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

    <div v-else-if="details" class="d-flex gap-3 flex-wrap">
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
        <p v-if="details.jpVolumes" class="detail-meta">Volumi JP: {{ details.jpVolumes }}</p>

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

        <p v-if="details.description" class="detail-description">{{ details.description }}</p>
      </div>
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
.detail-cover {
  width: 140px;
  border-radius: 8px;
  object-fit: cover;
  aspect-ratio: 2/3;
}

.detail-info {
  min-width: 200px;
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
</style>
