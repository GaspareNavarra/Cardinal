<template>
  <div id="main-page">
    <div class="container">
      <div class="row justify-content-center">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  provide() {
    return {}
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
<style scoped>
/* Applichiamo il trucco del gradiente alla variabile ufficiale di PrimeVue 4 */
:deep(.p-floatlabel) {
  --p-floatlabel-on-active-background: linear-gradient(
    to bottom,
    transparent 50%,
    #ffffff 50% /* Usa il colore della tua card qui */
  ) !important;
}

/* Assicuriamoci che la label abbia un po' di respiro ai lati per non far toccare la riga */
:deep(.p-floatlabel label) {
  padding: 0 6px !important;
  /* Se la riga si vede ancora, regola la percentuale del gradiente (es. 48% invece di 50%) */
  background: var(--p-floatlabel-on-active-background) !important;
}

/* Fix specifico per il componente Password che spesso ignora le classi esterne */
:deep(.p-password input) {
  width: 100%;
}

/* 1. Solleva la card rispetto allo schermo */
.card-wrapper {
  /* Invece di essere perfettamente al centro, la alziamo di un 5% */
  transform: translateY(-5%) !important;
  /* Nota: Se hai già l'animazione zoomIn, 
       aggiungi il translateY( -5%) nel 100% dell'animazione */
}

/* 2. Recupera spazio dentro la card */
:deep(.p-card-title) {
  margin-top: -10px !important; /* Porta il logo più vicino al bordo superiore */
  margin-bottom: 20px !important; /* Spazio tra logo e Username */
}

/* 3. Aumenta il respiro sotto il bottone */
:deep(.p-card-content) {
  padding-bottom: 1.5rem !important;
}
</style>
