<template>
  <div class="dashboard-container d-flex justify-content-center align-items-center">
    <Card :class="['main-card shadow-xl', { 'is-expanded': expanded }]">
      <template #title>
        <div class="d-flex justify-content-between align-items-center">
          <img src="/img/cardinal_logo_with_text.png" style="height: 40px" alt="Logo" />
          <span class="text-sm">Benvenuto</span>
        </div>
      </template>

      <template #content>
        <div v-if="expanded" class="fade-in-content">
          <h3>Dashboard Principale</h3>
          <p>Qui puoi gestire i tuoi record...</p>
        </div>
      </template>
    </Card>
  </div>
</template>
<script>
import Card from 'primevue/card'
export default {
  components: {
    Card,
  },
  inject: ['getUserStatus'],
  data() {
    return {
      expanded: false,
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
