<template>
  <div class="dashboard-container d-flex justify-content-center align-items-center">
    <Card :class="['main-card shadow-xl', { 'is-expanded': expanded }]">
      <template #title>
        <div class="d-flex justify-content-between align-items-center header-content">
          <img src="/img/cardinal_logo_with_text.png" style="height: 40px" alt="Logo" />
          <div class="user-info d-flex align-items-center gap-2 hello-message">
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
              <InputIcon
                class="pi pi-filter filter-icon"
                @click="toggleFilters"
                style="cursor: pointer; right: 1rem; left: auto"
              />
            </IconField>
            <Popover ref="filterOp" class="filter-popover">
              <div class="d-flex flex-column gap-3 p-2">
                <h6>Filtra Ricerca</h6>
                <div class="field">
                  <label class="d-block mb-1">Tipo</label>
                  <SelectButton
                    v-model="filters.type"
                    :options="typeOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
                <div class="field">
                  <label class="d-block mb-1">Target</label>
                  <SelectButton
                    v-model="filters.rating"
                    :options="ratingOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
                <Button
                  label="Reset Filtri"
                  icon="pi pi-refresh"
                  severity="secondary"
                  text
                  @click="resetFilters()"
                />
              </div>
            </Popover>
            <small class="text-muted mt-2 d-block">Scrivi il titolo da cercare</small>
          </div>

          <div class="row mb-4 gap-3 justify-content-between">
            <div class="col stats-card">
              <span class="label">Volumi Totali</span>
              <div class="value">{{ totalVolumes }}</div>
            </div>
            <div class="col stats-card">
              <span class="label">In Lettura</span>
              <div class="value">{{ reading }}</div>
            </div>
            <div class="col stats-card highlight">
              <span class="label">In Arrivo</span>
              <div class="value">{{ arriving }}</div>
            </div>
          </div>

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
                  v-for="(item, index) in searchResults"
                  :key="item.mal_id + '-' + index"
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
import Popover from 'primevue/popover'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import MangaCard from '@/components/MangaCard.vue'
import { debounce, searchManga } from '@/DataRetriever'
export default {
  components: {
    Card,
    InputText,
    IconField,
    InputIcon,
    Popover,
    Button,
    SelectButton,
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
      userId: '',
      totalVolumes: 0,
      reading: 0,
      arriving: 0,
      filters: {
        type: null,
        rating: null,
      },
      typeOptions: [
        { label: 'Manga', value: 'manga' },
        { label: 'Manhwa', value: 'manhwa' },
        { label: 'Manhua', value: 'manhua' },
      ],
      ratingOptions: [
        { label: 'Tutti', value: null },
        { label: 'SFW', value: 'sfw' },
      ],
    }
  },
  watch: {
    // Osserviamo sia la stringa che i filtri
    newMangaSearch() {
      this.triggerSearch()
    },
    filters: {
      handler() {
        this.triggerSearch()
      },
      deep: true,
    },
  },
  methods: {
    saveToDatabase() {
      debugger
    },
    toggleFilters(event) {
      this.$refs.filterOp.toggle(event)
    },
    resetFilters() {
      this.filters.type = null
      this.filters.rating = null
    },
    triggerSearch() {
      const query = this.newMangaSearch
      if (query && query.length >= 4) {
        // Passiamo query + filtri al debounce
        this.debouncedSearch(query, { ...this.filters })
      } else {
        this.searchResults = []
      }
    },
  },
  beforeMount() {
    if (!this.getUserStatus() || !localStorage.getItem('user')) {
      this.$router.push('/')
    }
    const user = JSON.parse(localStorage.getItem('user'))
    this.username = user.username
    this.userId = user.user_id
  },
  mounted() {
    // Facciamo partire l'animazione dopo un micro-ritardo dall'atterraggio
    setTimeout(() => {
      this.expanded = true
    }, 100)
  },
  created() {
    this.debouncedSearch = debounce(async (query, params) => {
      this.isSearching = true
      try {
        // searchManga dovrà ora accettare un secondo parametro per i filtri
        const results = await searchManga(query, params)
        if (this.newMangaSearch.length >= 4) {
          this.searchResults = results
        }
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
/* Forza il corpo della card a occupare lo spazio verticale */
:deep(.p-card-body) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.p-card-content) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Permette al figlio di non "esplodere" fuori dal padre */
}

.fade-in-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}

/* IL FIX: Gestione corretta della galleria */
.results-container {
  width: 100%;
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto; /* Attiva lo scroll verticale */
  overflow-x: hidden; /* Evita scroll orizzontali fastidiosi */
  margin-top: 20px;
  padding: 10px;
}

/* Quando ci sono i risultati, assicuriamoci che la galleria 
   non forzi le card a rimpicciolirsi */
.manga-gallery {
  height: auto;
  min-height: min-content;
}

/* Stile per il placeholder vuoto - rimane Full Height e centrato */
.results-container.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  flex-grow: 1;
}
/* Rendi lo sfondo del Popover coerente con la Card principale */
:deep(.p-popover) {
  background: rgba(20, 20, 20, 0.95) !important; /* Grigio scurissimo/Nero */
  border: 1px solid rgba(255, 204, 0, 0.3) !important; /* Bordo giallo tenue */
  backdrop-filter: blur(10px);
  color: white !important;
}

/* Stile delle righe (SelectButton) non selezionate */
:deep(.p-selectbutton .p-button) {
  background: rgba(255, 255, 255, 0.05) !important; /* Leggermente più chiaro dello sfondo */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  transition: all 0.3s ease;
}

/* EFFETTO BOLLA: Quando un filtro è selezionato (p-highlight) */
:deep(.p-selectbutton .p-button.p-highlight) {
  background: rgba(255, 204, 0, 0.15) !important; /* Giallo cardinal molto trasparente */
  border: 1.5px solid #ffcc00 !important; /* Bordo giallo Cardinal acceso */
  color: #ffcc00 !important; /* Testo giallo */
  box-shadow: 0 0 10px rgba(255, 204, 0, 0.2); /* Leggero bagliore */
}

/* Rendi invisibile la riga di divisione tra i bottoni se necessario */
:deep(.p-selectbutton .p-button:not(.p-highlight):not(.p-disabled):hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

/* Titoli e label dentro il popover */
.filter-popover h6 {
  color: #ffcc00;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.field label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}
/* Nasconde la freccia del Popover */
:deep(.p-popover::before),
:deep(.p-popover::after) {
  display: none !important;
}
</style>
