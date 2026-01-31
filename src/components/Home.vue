<template>
  <div class="dashboard-container d-flex justify-content-center align-items-center">
    <Card :class="['main-card shadow-xl', { 'is-expanded': expanded }]">
      <template #title>
        <div class="d-flex justify-content-between align-items-center header-content">
          <img src="/img/cardinal_logo_with_text.png" style="height: 40px" alt="Logo" />
          <div class="user-info d-flex align-items-center gap-2">
            <span class="pi pi-user"></span>
            <span class="text-sm"> Ciao, Fratomo</span>
            <i class="pi pi-user-circle" style="font-size: 1.5rem"></i>
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="expanded" class="fade-in-content container-fluid">
          <div class="search-section my-4">
            <IconField class="w-100">
              <InputIcon class="pi pi-search-plus" />
              <InputText
                v-model="newMangaSearch"
                placeholder="Cerca un nuovo manga da aggiungere alla tua libreria..."
                class="w-100 search-input"
              />
            </IconField>
            <small class="text-muted mt-2 d-block"
              >Scrivi il titolo e premi invio per cercare nel database globale</small
            >
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

          <div class="gallery-placeholder d-flex align-items-center justify-content-center">
            <p class="text-muted">La tua collezione apparirà qui...</p>
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
export default {
  components: {
    Card,
    InputText,
    IconField,
    InputIcon,
  },
  inject: ['getUserStatus'],
  data() {
    return {
      expanded: false,
      newMangaSearch: '',
    }
  },
  beforeMount() {
    if (!this.getUserStatus()) {
      this.$router.push('/')
    }
  },
  mounted() {
    // Facciamo partire l'animazione dopo un micro-ritardo dall'atterraggio
    setTimeout(() => {
      this.expanded = true
    }, 100)
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
