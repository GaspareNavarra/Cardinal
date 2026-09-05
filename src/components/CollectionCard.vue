<template>
  <div class="collection-card-simple shadow-lg" @click="$emit('view-details', entry)">
    <div class="image-container">
      <img :src="entry.series.image_url" :alt="entry.series.title" class="manga-cover" />

      <div class="hover-overlay">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-warning"
          @click.stop="$emit('edit', entry)"
          v-tooltip.top="'Modifica volumi posseduti'"
        />
      </div>
    </div>

    <div class="manga-info">
      <span class="manga-title text-truncate d-block" :title="entry.series.title">
        {{ entry.series.title }}
      </span>
      <div class="d-flex count-badges mt-1">
        <span v-if="entry.ownedCount" class="count-badge owned" v-tooltip.top="'Posseduti'">
          <i class="pi pi-check"></i> {{ entry.ownedCount }}
        </span>
        <span v-if="entry.arrivingCount" class="count-badge arriving" v-tooltip.top="'In arrivo'">
          <i class="pi pi-truck"></i> {{ entry.arrivingCount }}
        </span>
        <span v-if="entry.readCount" class="count-badge read" v-tooltip.top="'Letti'">
          <i class="pi pi-eye"></i> {{ entry.readCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button'

export default {
  name: 'CollectionCard',
  components: { Button },
  props: {
    entry: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped>
.collection-card-simple {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  cursor: pointer;
}

.collection-card-simple:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 204, 0, 0.5);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
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

.collection-card-simple:hover .hover-overlay {
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

.count-badges {
  flex-wrap: wrap;
  gap: 0.35rem;
}

.count-badge {
  font-size: 0.7rem;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.count-badge.owned {
  background: rgba(255, 204, 0, 0.15);
  color: #ffcc00;
}

.count-badge.arriving {
  background: rgba(0, 153, 255, 0.15);
  color: #66c2ff;
}

.count-badge.read {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}
</style>
