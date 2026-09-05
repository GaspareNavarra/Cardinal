// Endpoint server-side (Vercel Serverless Function) che recupera, in modo best-effort,
// i dati sulle edizioni italiane di una serie manga da AnimeClick.it.
//
// AnimeClick non ha una API ufficiale e non manda header CORS: va quindi interrogato
// lato server (qui, non dal browser) e i risultati vanno trattati come un SUGGERIMENTO
// di partenza, non come dato autoritativo — se il parsing fallisce o la struttura del
// sito cambia, si risponde comunque 200 con liste vuote così il client passa
// all'inserimento manuale invece di rompersi.
//
// GET /api/animeclick?title=<serie>[&id=<manga id AnimeClick>&slug=<slug>]
// - senza id/slug: cerca la serie su AnimeClick; se il match è ambiguo risponde con
//   { candidates: [...] } perché il client faccia scegliere all'utente.
// - con id/slug (es. dopo che l'utente ha scelto un candidate): salta la ricerca e
//   legge direttamente quella pagina.

const UA = 'Mozilla/5.0 (compatible; CardinalApp/1.0; +https://cardinal.app)'

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accenti
    .replace(/[-:._]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// La ricerca di AnimeClick non restituisce nulla se il titolo contiene ":" o altra
// punteggiatura (es. i titoli AniList tipo "Sword Art Online: Aincrad" danno 0 risultati
// finché non si toglie i due punti) — la ripuliamo prima di interrogarli.
function sanitizeForSearch(str) {
  return (str || '').replace(/[:_.]/g, ' ').replace(/\s+/g, ' ').trim()
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!response.ok) {
    throw new Error(`AnimeClick ${response.status} su ${url}`)
  }
  return response.text()
}

function parseCandidates(html) {
  const candidates = []
  const re = /<h4><a href="\/manga\/(\d+)\/([^"]+)">([^<]+)<\/a><\/h4>/g
  let match
  while ((match = re.exec(html))) {
    candidates.push({ id: match[1], slug: match[2], title: stripTags(match[3]) })
  }
  return candidates
}

function pickBestCandidate(candidates, title) {
  const query = normalize(title)
  const exact = candidates.find((c) => normalize(c.title) === query)
  if (exact) return exact

  if (candidates.length === 1) return candidates[0]

  // Se un solo candidato contiene per intero il titolo cercato (ed è nettamente
  // il migliore), procediamo da soli; altrimenti lasciamo scegliere all'utente.
  const containing = candidates.filter((c) => normalize(c.title).includes(query))
  if (containing.length === 1) return containing[0]

  return null
}

function extractDtDd(html, label) {
  const re = new RegExp(`<dt>\\s*${label}\\s*<\\/dt>\\s*<dd>([\\s\\S]*?)<\\/dd>`, 'i')
  const match = html.match(re)
  return match ? stripTags(match[1]) || null : null
}

function extractPublisher(html) {
  const re = /<dt>\s*Disponibilit&agrave;\s*<\/dt>\s*<dd>([\s\S]*?)<\/dd>/i
  const match = html.match(re)
  if (!match) return null
  const nameMatch = match[1].match(/itemprop="name">([^<]+)</)
  return nameMatch ? stripTags(nameMatch[1]) : stripTags(match[1]) || null
}

function parseEditions(html, seriesTitle) {
  const tableMatch = html.match(/id="table-edizioni"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i)
  if (!tableMatch) return { italianVolumes: [], specialEditions: [] }

  const rows = tableMatch[1].match(/<tr>[\s\S]*?<\/tr>/g) || []
  const baseTitleNorm = normalize(seriesTitle)

  const parsedRows = rows
    .map((row) => {
      const collanaMatch = row.match(/<td style="display:none;">(\d+)<\/td>/)
      const titleMatch = row.match(/<td class="col-lg-4"><a[^>]*>([^<]+)<\/a>/)
      const coverMatch = row.match(/data-img="([^"]+)"/)
      const usciteMatch = row.match(/<td class="col-lg-1">(\d{2}\/\d{2}\/\d{4})<\/td>/)
      if (!collanaMatch || !titleMatch) return null

      const label = stripTags(titleMatch[1])
      const labelNorm = normalize(label)
      const remainder = labelNorm.startsWith(baseTitleNorm)
        ? labelNorm.slice(baseTitleNorm.length).trim()
        : labelNorm
      const numberMatch = remainder.match(/(\d+)$/)

      return {
        collana: collanaMatch[1],
        label,
        number: numberMatch ? parseInt(numberMatch[1], 10) : null,
        coverUrl: coverMatch ? coverMatch[1] : null,
        releaseDate: usciteMatch ? usciteMatch[1] : null,
      }
    })
    .filter(Boolean)

  // Raggruppiamo per "collana" (edizione/ristampa) e scegliamo come edizione
  // principale quella con più volumi numerati in sequenza: è il conteggio reale
  // di volumi usciti in Italia, che può differire dal totale giapponese per via
  // di box/omnibus pubblicati come edizioni separate.
  const byCollana = new Map()
  for (const row of parsedRows) {
    if (!byCollana.has(row.collana)) byCollana.set(row.collana, [])
    byCollana.get(row.collana).push(row)
  }

  let mainCollana = null
  let mainCount = -1
  for (const [collana, group] of byCollana) {
    const numbered = group.filter((r) => r.number !== null).length
    if (numbered > mainCount) {
      mainCount = numbered
      mainCollana = collana
    }
  }

  const italianVolumes = []
  const specialEditions = []
  for (const [collana, group] of byCollana) {
    for (const row of group) {
      if (collana === mainCollana && row.number !== null) {
        italianVolumes.push({
          number: row.number,
          coverUrl: row.coverUrl,
          releaseDate: row.releaseDate,
        })
      } else {
        specialEditions.push({
          label: row.label,
          coverUrl: row.coverUrl,
          releaseDate: row.releaseDate,
        })
      }
    }
  }

  italianVolumes.sort((a, b) => a.number - b.number)
  return { italianVolumes, specialEditions }
}

export default async function handler(req, res) {
  const { title, id, slug } = req.query

  if (!title && !(id && slug)) {
    res.status(400).json({ error: 'Parametro "title" mancante' })
    return
  }

  try {
    let targetId = id
    let targetSlug = slug

    if (!targetId || !targetSlug) {
      const searchUrl = `https://www.animeclick.it/cerca?tipo=opera&tipi_opera%5B%5D=fumetto&name=${encodeURIComponent(sanitizeForSearch(title))}`
      const searchHtml = await fetchHtml(searchUrl)
      const candidates = parseCandidates(searchHtml)

      if (candidates.length === 0) {
        res.status(200).json({ italianVolumes: [], specialEditions: [] })
        return
      }

      const best = pickBestCandidate(candidates, title)
      if (!best) {
        res.status(200).json({ candidates: candidates.slice(0, 8) })
        return
      }

      targetId = best.id
      targetSlug = best.slug
    }

    const detailUrl = `https://www.animeclick.it/manga/${targetId}/${targetSlug}`
    const detailHtml = await fetchHtml(detailUrl)

    const jpVolumesRaw = extractDtDd(detailHtml, 'Volumi')
    const jpVolumes = jpVolumesRaw ? parseInt(jpVolumesRaw, 10) || null : null
    const italianStatus = extractDtDd(detailHtml, 'Stato in Italia')
    const publisher = extractPublisher(detailHtml)

    const seriesTitleMatch = detailHtml.match(/<title>([^<|]+)/)
    const seriesTitle = seriesTitleMatch ? stripTags(seriesTitleMatch[1]) : title

    const edizioniHtml = await fetchHtml(`${detailUrl}/edizioni`)
    const { italianVolumes, specialEditions } = parseEditions(edizioniHtml, seriesTitle)

    res.status(200).json({
      jpVolumes,
      italianStatus,
      publisher,
      italianVolumes,
      specialEditions,
    })
  } catch (error) {
    console.log(error)
    // Best-effort: mai un errore bloccante, il client passa alla modalità manuale.
    res.status(200).json({ italianVolumes: [], specialEditions: [] })
  }
}
