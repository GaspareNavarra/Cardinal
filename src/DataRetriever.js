import axios from 'axios'

export async function searchManga(title, filters = {}) {
  const baseUrl = `https://api.jikan.moe/v4/manga?q=${title}`
  let filterString = ''

  if (filters.type) filterString += `&type=${filters.type}`
  if (filters.rating) filterString += `&rating=${filters.rating}`
  // Aggiungi altri filtri dell'API Jikan qui...

  const response = await fetch(baseUrl + filterString)
  const json = await response.json()
  return json.data
}

// Aggiungila nel tuo file DataRetriever.js o dove preferisci
export function debounce(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
