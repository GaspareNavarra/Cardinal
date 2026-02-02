import axios from 'axios'

export async function searchManga(manga_name) {
  if (!manga_name) return []

  try {
    const response = await axios.get(`https://api.jikan.moe/v4/manga`, {
      params: { q: manga_name, limit: 5 },
    })
    return response.data.data
  } catch (error) {
    console.error('Errore ricerca Jikan:', error)
    return []
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
