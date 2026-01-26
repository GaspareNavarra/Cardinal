<template>
  <div id="main-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="loading" v-show="isLoading">
          <ProgressSpinner />
        </div>
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>
<script>
import ProgressSpinner from 'primevue/progressspinner'
export default {
  components: { ProgressSpinner },
  provide() {
    return {}
  },
  data() {
    return {
      isLoading: false,
    }
  },
  methods: {},
  beforeMount() {
    this.isLoading = true
  },
  mounted() {
    this.isLoading = false
  },
}
</script>
<style scoped>
:deep(.p-floatlabel) {
  --p-floatlabel-on-active-background: linear-gradient(
    to bottom,
    transparent 50%,
    #ffffff 50%
  ) !important;
}

:deep(.p-floatlabel label) {
  padding: 0 6px !important;
  background: var(--p-floatlabel-on-active-background) !important;
}

:deep(.p-password input) {
  width: 100%;
}

.card-wrapper {
  transform: translateY(-5%) !important;
}

:deep(.p-card-title) {
  margin-top: -10px !important;
  margin-bottom: 20px !important;
}

:deep(.p-card-content) {
  padding-bottom: 1.5rem !important;
}
</style>
