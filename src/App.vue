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
      doLogin: this.doLogin,
      doLogout: this.doLogout,
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
    async doLogin(email, password) {
      this.setIsLoading(true)
      const params = {
        email: email,
        password: password,
      }

      const { data, error } = await this.$supabase.auth.signInWithPassword(params)

      if (error) {
        console.log(error)
        this.showToast({
          severity: 'error',
          summary: 'Errore Login',
          detail: 'email o Password non validi',
          life: 4000,
        })
        this.showToast({
          severity: 'error',
          summary: 'Errore Login',
          detail: JSON.stringify(error),
          life: 50000,
        })
        this.setUserStatus(false)
        this.setIsLoading(false)
        return
      }

      this.showToast({
        severity: 'success',
        summary: 'Login effettuato',
        detail: 'Benvenuto in Cardinal',
        life: 4000,
      })
      this.setUserStatus(true)
      this.$router.push('/home')

      this.setIsLoading(false)
    },
    async doLogout() {
      this.setIsLoading(true)
      const { error } = await this.$supabase.auth.signOut()
      if (error) {
        console.log(error)
        this.showToast({
          severity: 'error',
          summary: 'Errore Login',
          detail: 'email o Password non validi',
          life: 4000,
        })
        this.setIsLoading(false)
        return
      }

      this.setUserStatus(false)
      this.setIsLoading(false)
      this.showToast({
        severity: 'info',
        summary: 'Logout successfully',
        detail: 'Logout andata a buon fine',
        life: 4000,
      })
      this.$router.push('/')
    },
  },
  async beforeMount() {
    this.setIsLoading(true)

    const { data, error } = await this.$supabase.auth.getSession()
    if (error) {
      console.log(error)
      this.showToast({
        severity: 'error',
        summary: 'Sessione scaduta',
        detail: "Sessione scaduta, ritentare l'accesso",
        life: 4000,
      })
      this.$router.push('/')
      return
    }
    this.setUserStatus(true)
    this.setIsLoading(false)
  },
  mounted() {
    this.isLoading = false
  },
}
</script>
