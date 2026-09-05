<template>
  <div class="manga-card-simple shadow-lg" @click="$emit('view-details', manga)">
    <div class="image-container">
      <img :src="manga.images.jpg.image_url" :alt="manga.title" class="manga-cover" />

      <!-- Visibile anche senza hover (utile su mobile, dove l'overlay si vede
           solo al tocco): a colpo d'occhio si capisce che è già in collezione. -->
      <span v-if="inCollection" class="in-collection-badge" v-tooltip.top="'Già in collezione'">
        <i class="pi pi-check"></i>
      </span>

      <div class="hover-overlay">
        <Button
          :icon="inCollection ? 'pi pi-check' : 'pi pi-plus'"
          :class="[
            'p-button-rounded',
            inCollection ? 'p-button-secondary' : 'p-button-warning',
          ]"
          @click.stop="$emit('add', manga)"
          v-tooltip.top="inCollection ? 'Aggiungi altri volumi' : 'Aggiungi alla collezione'"
        />
      </div>
    </div>

    <div class="manga-info">
      <span class="manga-title text-truncate d-block" :title="manga.title">
        {{ manga.title }}
      </span>
      <div class="d-flex justify-content-between align-items-center mt-1">
        <small class="manga-type">{{ manga.type }}</small>
        <small class="manga-score"
          ><i class="pi pi-star-fill"></i> {{ manga.score || 'N/A' }}</small
        >
      </div>
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button'

export default {
  name: 'MangaCard',
  components: { Button },
  props: {
    manga: {
      type: Object,
      required: true,
    },
    inCollection: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.manga-card-simple {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.manga-card-simple:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 204, 0, 0.5);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}

.image-container {
  position: relative;
  aspect-ratio: 2/3;
}

.manga-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.in-collection-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 204, 0, 0.5);
  color: #ffcc00;
  font-size: 0.7rem;
  z-index: 2;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.manga-card-simple:hover .hover-overlay {
  opacity: 1;
}

.manga-info {
  padding: 8px;
  text-align: center;
}

.manga-title {
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
}

.manga-type {
  font-size: 0.7rem;
  color: rgba(255, 204, 0, 0.8);
  text-transform: uppercase;
}

/* Personalizzazione scrollbar per restare in tema */
.manga-gallery::-webkit-scrollbar {
  width: 6px;
}
.manga-gallery::-webkit-scrollbar-thumb {
  background: rgba(255, 204, 0, 0.3);
  border-radius: 10px;
}
/* Incolla qui gli stili .manga-card-simple, .image-container, ecc. che abbiamo scritto prima */
.manga-card-simple {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  cursor: pointer;
}

.image-container {
  position: relative;
  aspect-ratio: 2/3;
  background: #1a1a1a;
}

.manga-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.manga-card-simple:hover .hover-overlay {
  opacity: 1;
}

.manga-info {
  padding: 10px;
}

.manga-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.manga-type {
  font-size: 0.7rem;
  color: #ffcc00;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.manga-score {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.pi-star-fill {
  color: #ffcc00;
  font-size: 0.65rem;
}
</style>
