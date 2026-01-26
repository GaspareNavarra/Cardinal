<template>
  <div id="main-page">
    <Toast />
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
import Toast from 'primevue/toast'
export default {
  components: { ProgressSpinner, Toast },
  provide() {
    return {
      setIsLoading: this.setIsLoading,
      setUserStatus: this.setUserStatus,
      getUserStatus: this.getUserStatus,
      showToast: this.showToast,
    }
  },
  data() {
    return {
      isLoading: false,
      userIsLogged: false,
    }
  },
  methods: {
    setIsLoading(value) {
      this.isLoading = value
    },
    setUserStatus(isLogged) {
      this.userIsLogged = isLogged
    },
    getUserStatus() {
      return this.userIsLogged
    },
    showToast(params) {
      this.$toast.add(params)
    },
  },
  beforeMount() {
    this.isLoading = true
  },
  mounted() {
    this.isLoading = false
  },
}
</script>
