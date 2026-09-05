<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :header="manga?.title"
    :style="{ width: '90vw', maxWidth: '640px' }"
    class="manga-detail-dialog"
  >
    <div v-if="loading" class="d-flex justify-content-center py-4">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <div v-else-if="details" class="d-flex flex-column gap-3">
      <div class="d-flex gap-3">
        <img
          :src="details.images?.jpg?.image_url"
          :alt="details.title"
          class="detail-cover flex-shrink-0"
        />

        <div class="detail-info flex-grow-1">
          <div class="detail-badges d-flex flex-wrap gap-2 mb-2">
            <span v-if="details.type" class="badge">{{ details.type }}</span>
            <span v-if="details.status" class="badge">{{ details.status }}</span>
            <span v-if="details.score" class="badge"
              ><i class="pi pi-star-fill"></i> {{ details.score }}</span
            >
          </div>

          <p v-if="yearRange" class="detail-meta">{{ yearRange }}</p>
          <p v-if="details.author" class="detail-meta">Autore: {{ details.author }}</p>
          <p v-if="details.countryOfOrigin" class="detail-meta">
            Origine: {{ details.countryOfOrigin }}
          </p>
          <p v-if="details.source" class="detail-meta">{{ details.source }}</p>
          <p v-if="volumesChaptersLabel" class="detail-meta">{{ volumesChaptersLabel }}</p>
          <p v-if="details.popularity || details.favourites" class="detail-meta">
            <span v-if="details.popularity"
              ><i class="pi pi-users"></i> {{ details.popularity }}</span
            >
            <span v-if="details.favourites">
              · <i class="pi pi-heart-fill"></i> {{ details.favourites }}</span
            >
          </p>

          <div v-if="details.genres?.length" class="detail-genres mb-2">
            <span v-for="genre in details.genres" :key="genre" class="genre-chip">{{ genre }}</span>
          </div>

          <p v-if="publisherInfo" class="detail-meta">
            <span v-if="publisherInfo.publisher"
              >Editore IT: <strong>{{ publisherInfo.publisher }}</strong></span
            >
            <span v-if="publisherInfo.italianStatus">
              · Stato IT: <strong>{{ publisherInfo.italianStatus }}</strong></span
            >
          </p>

          <a
            v-if="details.siteUrl"
            :href="details.siteUrl"
            target="_blank"
            rel="noopener"
            class="detail-meta anilist-link"
          >
            Vedi su AniList <i class="pi pi-external-link"></i>
          </a>
        </div>
      </div>

      <p v-if="details.description" class="detail-description">{{ details.description }}</p>
    </div>

    <p v-else class="text-muted">Impossibile recuperare i dettagli di questa serie.</p>

    <template #footer>
      <Button label="Chiudi" severity="secondary" text @click="close" />
      <Button
        v-if="manga"
        label="Aggiungi alla collezione"
        icon="pi pi-plus"
        @click="$emit('add', manga)"
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { getMangaDetails, getItalianEditions } from '@/DataRetriever'

export default {
  name: 'MangaDetailDialog',
  components: { Dialog, Button, ProgressSpinner },
  props: {
    visible: { type: Boolean, default: false },
    manga: { type: Object, default: null },
  },
  emits: ['update:visible', 'add'],
  data() {
    return {
      loading: false,
      details: null,
      publisherInfo: null,
    }
  },
  computed: {
    yearRange() {
      if (!this.details?.startYear) return null
      return this.details.endYear && this.details.endYear !== this.details.startYear
        ? `${this.details.startYear} - ${this.details.endYear}`
        : `${this.details.startYear}`
    },
    volumesChaptersLabel() {
      if (!this.details) return null
      const parts = []
      if (this.details.jpVolumes) parts.push(`${this.details.jpVolumes} volumi JP`)
      if (this.details.chapters) parts.push(`${this.details.chapters} capitoli`)
      return parts.join(' · ') || null
    },
  },
  watch: {
    visible(isVisible) {
      if (isVisible) this.load()
    },
  },
  methods: {
    async load() {
      this.details = null
      this.publisherInfo = null
      this.loading = true
      try {
        const [details, italian] = await Promise.all([
          getMangaDetails(this.manga.anilist_id),
          getItalianEditions(this.manga.title),
        ])
        this.details = details
        this.publisherInfo =
          italian.publisher || italian.italianStatus
            ? { publisher: italian.publisher, italianStatus: italian.italianStatus }
            : null
      } catch (error) {
        console.log(error)
        this.details = null
      } finally {
        this.loading = false
      }
    },
    close() {
      this.$emit('update:visible', false)
    },
  },
}
</script>

<style scoped>
/* Il tema PrimeVue di default è chiaro (darkModeSelector non è mai attivato),
   quindi il Dialog risultava bianco contro il resto dell'app scura. Stesso
   trattamento già usato per il Popover dei filtri in Home.vue: stesso colore
   scuro/vetro della card principale, ma più opaco per restare leggibile
   (la card usa rgba(...,0.05), qui serve più densità per il testo).

   Dialog avvolge tutto in un Portal/mask interno: non è affidabile indovinare
   se l'attributo di scope Vue finisca su .p-dialog o su un suo genitore, né se
   PrimeVue applichi i suoi stili prima o dopo il nostro CSS statico. Usiamo
   quindi :global() sulla classe che passiamo già esplicitamente al componente
   (class="manga-detail-dialog"), coprendo entrambi i casi (che finisca sulla
   stessa .p-dialog o su un genitore) più !important per battere gli stili
   iniettati a runtime da PrimeVue a parità di specificità. */
:global(.manga-detail-dialog.p-dialog),
:global(.manga-detail-dialog .p-dialog) {
  background: rgba(20, 20, 20, 0.95) !important;
  border: 1px solid rgba(255, 204, 0, 0.3) !important;
  color: #fff !important;
}

:global(.manga-detail-dialog .p-dialog-header),
:global(.manga-detail-dialog .p-dialog-content),
:global(.manga-detail-dialog .p-dialog-footer) {
  background: transparent !important;
  color: #fff !important;
}

:global(.manga-detail-dialog .p-dialog-title) {
  color: #fff !important;
}

.detail-cover {
  width: 140px;
  max-height: 210px;
  border-radius: 8px;
  /* contain invece di cover: mostra la foto intera senza tagliarla, anche se
     le proporzioni reali della copertina non sono esattamente 2:3 */
  object-fit: contain;
}

.detail-info {
  /* min-width:0 (invece di un valore fisso) evita che il testo forzi la riga
     ad andare a capo sotto la copertina: autore/tag restano sempre a destra,
     si restringono e vanno a capo internamente se lo spazio è poco. */
  min-width: 0;
}

/* Su schermi stretti la copertina si restringe un po' per lasciare più spazio
   ai dati a destra, che altrimenti su mobile finirebbero troppo compressi. */
@media (max-width: 480px) {
  .detail-cover {
    width: 100px;
  }
}

.badge {
  background: rgba(255, 204, 0, 0.15);
  border: 1px solid rgba(255, 204, 0, 0.4);
  color: #ffcc00;
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
}

.detail-meta {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.detail-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.genre-chip {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.1rem 0.5rem;
}

.detail-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  max-height: 30vh;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.anilist-link {
  display: inline-block;
  color: #ffcc00 !important;
  text-decoration: none;
  margin-top: 0.25rem;
}

.anilist-link:hover {
  text-decoration: underline;
}
</style>
