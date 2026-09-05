<!-- <template>
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
        email: email.trim(),
        password: password.trim(),
      }

      const { data, error } = await this.$supabase.auth.signInWithPassword(params)

      if (error) {
        console.log(error)
        this.showToast({
          severity: 'error',
          summary: 'Errore Login',
          detail:
            error.message === 'validation_failed'
              ? 'Email o password non valide. Controlla che non ci siano spazi!'
              : error.message,
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
</script> -->
<template>
  <div id="main-page">
    <Toast />

    <Dialog
      v-model:visible="updateExists"
      modal
      header="Aggiornamento Richiesto 🚀"
      :closable="false"
      :draggable="false"
      :style="{ width: '90vw', maxWidth: '400px' }"
    >
      <p class="m-0 text-center">
        È disponibile una nuova versione di <strong>Cardinal</strong> con miglioramenti e
        correzioni. Aggiorna ora per continuare.
      </p>
      <template #footer>
        <Button label="Aggiorna Ora" severity="warning" class="w-100 mt-2" @click="refreshApp" />
      </template>
    </Dialog>

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
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { registerSW } from 'virtual:pwa-register'

export default {
  components: { ProgressSpinner, Toast, Dialog, Button },
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
      // Stati per la gestione della PWA
      updateExists: false,
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
      try {
        this.setIsLoading(true)

        // Controllo di sicurezza preventivo per mobile ed evitare crash su .trim()
        if (!email || !password) {
          throw new Error('Email e Password sono obbligatorie')
        }

        const params = {
          email: email.trim(),
          password: password.trim(),
        }

        const { data, error } = await this.$supabase.auth.signInWithPassword(params)

        if (error) {
          console.log(error)
          this.showToast({
            severity: 'error',
            summary: 'Errore Login',
            detail:
              error.message === 'validation_failed'
                ? 'Email o password non valide. Controlla che non ci siano spazi!'
                : error.message,
            life: 4000,
          })
          this.setUserStatus(false)
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
      } catch (err) {
        console.error(err)
        this.showToast({
          severity: 'error',
          summary: 'Errore Applicazione',
          detail: err.message,
          life: 4000,
        })
      } finally {
        // Questo si esegue SEMPRE, spegnendo il loader sia in caso di successo che di errore
        this.setIsLoading(false)
      }
    },
    async doLogout() {
      try {
        this.setIsLoading(true)
        const { error } = await this.$supabase.auth.signOut()

        if (error) throw error

        this.setUserStatus(false)
        this.showToast({
          severity: 'info',
          summary: 'Logout effettuato',
          detail: 'Sessione chiusa correttamente',
          life: 4000,
        })
        this.$router.push('/')
      } catch (error) {
        console.log(error)
        this.showToast({
          severity: 'error',
          summary: 'Errore Logout',
          detail: 'Impossibile disconnettersi al momento',
          life: 4000,
        })
      } finally {
        this.setIsLoading(false)
      }
    },
    // Dice al Service Worker in attesa di attivarsi subito; updateSW(true) gestisce
    // da solo sia lo skipWaiting che il reload una volta preso il controllo.
    refreshApp() {
      this.updateExists = false
      if (this.updateSW) this.updateSW(true)
    },
  },
  async beforeMount() {
    this.setIsLoading(true)

    const { data, error } = await this.$supabase.auth.getSession()

    // getSession() non dà errore se non sei loggato, semplicemente session è null
    if (error || !data?.session) {
      this.setUserStatus(false)
      this.setIsLoading(false)
      if (this.$route.path !== '/') this.$router.push('/')
      return
    }

    this.setUserStatus(true)
    this.setIsLoading(false)
  },
  mounted() {
    this.isLoading = false

    // Registrazione PWA ufficiale (vite-plugin-pwa): a differenza del vecchio
    // script auto-iniettato, questa continua a ricontrollare aggiornamenti nel
    // tempo (non solo una volta al mount) e gestisce da sola skipWaiting/reload
    // quando l'utente conferma dal dialog "Aggiornamento Richiesto".
    this.updateSW = registerSW({
      onNeedRefresh: () => {
        this.updateExists = true
      },
      onRegisteredSW: (swUrl, registration) => {
        if (!registration) return
        // Ricontrolla se c'è un nuovo sw.js ogni 20 minuti: senza questo, dopo il
        // primo mount un utente rimaneva bloccato all'infinito sulla build vecchia.
        setInterval(
          () => {
            registration.update()
          },
          20 * 60 * 1000,
        )
      },
    })
  },
}
</script>
