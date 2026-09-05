const ANILIST_URL = 'https://graphql.anilist.co'

// Manteniamo la stessa terminologia italiana già usata nei filtri di Home.vue
const COUNTRY_BY_TYPE = {
  manga: 'JP',
  manhwa: 'KR',
  manhua: 'CN',
}

const FORMAT_LABELS = {
  MANGA: 'Manga',
  ONE_SHOT: 'One Shot',
  NOVEL: 'Novel',
}

const STATUS_LABELS = {
  FINISHED: 'Concluso',
  RELEASING: 'In corso',
  NOT_YET_RELEASED: 'Non ancora uscito',
  CANCELLED: 'Cancellato',
  HIATUS: 'In pausa',
}

async function postAniList(query, variables) {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Errore nella richiesta ad AniList (status ${response.status})`)
  }

  const json = await response.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }

  return json.data
}

// AniList tratta un argomento passato esplicitamente a null come "il campo deve
// essere null" (quindi 0 risultati, dato che countryOfOrigin/isAdult non sono mai
// null nei loro dati), non come "nessun filtro". Va quindi omesso del tutto
// dalla query quando il filtro non è attivo, non semplicemente valorizzato a null:
// costruiamo perciò la query dinamicamente in base ai filtri passati.
function buildSearchQuery(filters) {
  const variableDefs = ['$search: String']
  const mediaArgs = ['search: $search']
  const variables = {}

  const countryOfOrigin = filters.type ? COUNTRY_BY_TYPE[filters.type] : null
  if (countryOfOrigin) {
    variableDefs.push('$countryOfOrigin: CountryCode')
    mediaArgs.push('countryOfOrigin: $countryOfOrigin')
    variables.countryOfOrigin = countryOfOrigin
  }

  // Di default (includeAdult: false) filtriamo isAdult:false. Quando il toggle
  // "Tutti (incl. +18)" è attivo, l'argomento isAdult va omesso del tutto (non
  // passato a true, altrimenti mostrerebbe SOLO i +18 invece di tutto).
  if (!filters.includeAdult) {
    variableDefs.push('$isAdult: Boolean')
    mediaArgs.push('isAdult: $isAdult')
    variables.isAdult = false
  }

  const query = `
    query (${variableDefs.join(', ')}) {
      Page(perPage: 24) {
        media(
          ${mediaArgs.join('\n          ')}
          type: MANGA
          format_in: [MANGA, ONE_SHOT]
          sort: SEARCH_MATCH
        ) {
          id
          title {
            romaji
            english
          }
          format
          meanScore
          volumes
          coverImage {
            large
          }
        }
      }
    }
  `
  return { query, variables }
}

// Normalizza un risultato AniList nella shape che MangaCard.vue/Home.vue si aspettano già
function normalizeMedia(media) {
  return {
    anilist_id: media.id,
    title: media.title.romaji || media.title.english,
    type: FORMAT_LABELS[media.format] || media.format,
    score: media.meanScore ? +(media.meanScore / 10).toFixed(1) : null,
    images: {
      jpg: {
        image_url: media.coverImage?.large,
      },
    },
    jpVolumes: media.volumes,
  }
}

export async function searchManga(title, filters = {}) {
  const { query, variables } = buildSearchQuery(filters)
  variables.search = title

  const data = await postAniList(query, variables)
  const media = data?.Page?.media ?? []
  return media.map(normalizeMedia)
}

const DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      title {
        romaji
        english
      }
      description(asHtml: false)
      status
      genres
      format
      meanScore
      volumes
      chapters
      startDate {
        year
      }
      endDate {
        year
      }
      staff(perPage: 3) {
        edges {
          role
          node {
            name {
              full
            }
          }
        }
      }
      coverImage {
        large
      }
    }
  }
`

// Query di dettaglio per la pagina/dialog aperta cliccando una card (non il "+"):
// recupera campi più ricchi (trama, generi, autore, stato) che la ricerca non
// chiede per non appesantire ogni risultato.
export async function getMangaDetails(anilistId) {
  const data = await postAniList(DETAIL_QUERY, { id: anilistId })
  const media = data?.Media
  if (!media) return null

  const author = media.staff?.edges?.[0]?.node?.name?.full ?? null

  return {
    anilist_id: media.id,
    title: media.title.romaji || media.title.english,
    type: FORMAT_LABELS[media.format] || media.format,
    description: media.description,
    status: STATUS_LABELS[media.status] || media.status,
    genres: media.genres || [],
    score: media.meanScore ? +(media.meanScore / 10).toFixed(1) : null,
    jpVolumes: media.volumes,
    chapters: media.chapters,
    startYear: media.startDate?.year ?? null,
    endYear: media.endDate?.year ?? null,
    author,
    images: {
      jpg: {
        image_url: media.coverImage?.large,
      },
    },
  }
}

// Recupera (best-effort) i volumi italiani reperibili in fumetteria per una serie,
// scrapeando AnimeClick tramite l'endpoint server-side /api/animeclick.
// Non lancia mai in caso di fallimento: degrada a { italianVolumes: [] } così il
// chiamante può passare alla modalità di inserimento manuale.
export async function getItalianEditions(title, candidate = null) {
  try {
    const params = candidate
      ? `id=${encodeURIComponent(candidate.id)}&slug=${encodeURIComponent(candidate.slug)}`
      : `title=${encodeURIComponent(title)}`
    const response = await fetch(`/api/animeclick?${params}`)
    if (!response.ok) {
      return { italianVolumes: [], specialEditions: [] }
    }
    const json = await response.json()
    return {
      jpVolumes: json.jpVolumes ?? null,
      italianStatus: json.italianStatus ?? null,
      publisher: json.publisher ?? null,
      candidates: json.candidates ?? null,
      italianVolumes: json.italianVolumes ?? [],
      specialEditions: json.specialEditions ?? [],
    }
  } catch (error) {
    console.log(error)
    return { italianVolumes: [], specialEditions: [] }
  }
}

// Aggiungila nel tuo file DataRetriever.js o dove preferisci
export function debounce(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
