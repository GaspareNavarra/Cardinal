<template>
  <div class="dashboard-container d-flex justify-content-center align-items-center">
    <Card :class="['main-card shadow-xl', { 'is-expanded': expanded }]">
      <template #title>
        <div class="d-flex justify-content-between align-items-center header-content">
          <img src="/img/cardinal_logo_with_text.png" style="height: 40px" alt="Logo" />
          <div class="user-info d-flex align-items-center gap-2">
            <span class="pi pi-user"></span>
            <span class="text-sm"> Ciao, {{ username }}</span>
            <i class="pi pi-user-circle" style="font-size: 1.5rem"></i>
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="expanded" class="fade-in-content container-fluid">
          <div class="search-section my-4">
            <IconField class="w-100">
              <InputIcon :class="isSearching ? 'pi pi-spin pi-spinner' : 'pi pi-search-plus'" />
              <InputText
                v-model="newMangaSearch"
                placeholder="Cerca un nuovo manga..."
                class="w-100 search-input"
              />
            </IconField>
            <small class="text-muted mt-2 d-block">Scrivi il titolo da cercare</small>
          </div>

          <div class="row mb-4 gap-3 justify-content-between">
            <div class="col stats-card">
              <span class="label">Volumi Totali</span>
              <div class="value">735</div>
            </div>
            <div class="col stats-card">
              <span class="label">In Lettura</span>
              <div class="value">12</div>
            </div>
            <div class="col stats-card highlight">
              <span class="label">In Arrivo</span>
              <div class="value">3</div>
            </div>
          </div>

          <!-- <div class="gallery-placeholder d-flex align-items-center justify-content-center">
            <p class="text-muted" v-if="!searchResults.length > 0">
              La tua collezione apparirà qui...
            </p>
            <div class="manga-gallery mt-4" v-if="searchResults.length > 0">
              <div class="row g-4">
                <div
                  v-for="item in searchResults"
                  :key="item.mal_id"
                  class="col-6 col-sm-4 col-md-3 col-xl-2"
                >
                  <MangaCard :manga="item" @add="saveToDatabase()" />
                </div>
              </div>
            </div>
          </div> -->

          <div
            :class="[
              'results-container',
              { 'is-empty': !searchResults.length, 'has-results': searchResults.length },
            ]"
          >
            <div v-if="!searchResults.length" class="empty-state">
              <p class="text-muted">La tua collezione apparirà qui...</p>
            </div>

            <div v-else class="manga-gallery fade-in-content">
              <div class="row g-4">
                <div
                  v-for="item in searchResults"
                  :key="item.mal_id"
                  class="col-6 col-sm-4 col-md-3 col-xl-2"
                >
                  <MangaCard :manga="item" @add="saveToDatabase(item)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
<script>
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import MangaCard from '@/components/MangaCard.vue'
import { debounce, searchManga } from '@/DataRetriever'
export default {
  components: {
    Card,
    InputText,
    IconField,
    InputIcon,
    MangaCard,
  },
  inject: ['getUserStatus'],
  data() {
    return {
      expanded: false,
      newMangaSearch: '',
      username: '',
      isSearching: false,
      searchResults: [],
    }
  },
  watch: {
    newMangaSearch(newValue) {
      // 1. Se l'input è vuoto o ha meno di 4 caratteri, svuota tutto
      if (!newValue || newValue.trim().length < 4) {
        this.searchResults = []
        this.isSearching = false
        return
      }

      // 2. Fai partire la ricerca (rimuoviamo il blocco isSearching per permettere al debounce di aggiornarsi)
      this.debouncedSearch(newValue)
    },
  },
  methods: {
    saveToDatabase() {},
  },
  beforeMount() {
    if (!this.getUserStatus() || !localStorage.getItem('username')) {
      this.$router.push('/')
    }
    this.username = localStorage.getItem('username')
  },
  mounted() {
    // Facciamo partire l'animazione dopo un micro-ritardo dall'atterraggio
    setTimeout(() => {
      this.expanded = true
    }, 100)
  },
  created() {
    this.debouncedSearch = debounce(async (query) => {
      // Controllo preventivo: se nel tempo del debounce l'utente ha cancellato, non fare nulla
      if (this.newMangaSearch.length < 4) return

      this.isSearching = true
      try {
        const results = await searchManga(query)

        // Controllo post-chiamata: assegna i risultati solo se l'input è ancora valido
        if (this.newMangaSearch.length >= 4) {
          this.searchResults = results
        } else {
          this.searchResults = []
        }
      } catch (error) {
        console.error('Errore ricerca:', error)
      } finally {
        this.isSearching = false
      }
    }, 500)
  },
}
</script>
<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: transparent; /* O il tuo sfondo Matrix/Scuro */
  padding: 20px;
}

/* Stato Iniziale (uguale alla login) */
.main-card {
  width: 400px;
  height: 500px;
  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Effetto elastico */
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05); /* Effetto glassmorphism */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Stato Espanso */
.is-expanded {
  width: 95vw; /* Quasi tutta la larghezza */
  height: 90vh; /* Quasi tutta l'altezza */
}

/* Animazione per far apparire il contenuto dopo l'espansione */
.fade-in-content {
  animation: fadeIn 1s ease-in forwards;
  opacity: 0;
  margin-top: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
