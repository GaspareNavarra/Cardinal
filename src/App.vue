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
    // Forza il Service Worker a saltare l'attesa e ad attivare la nuova build
    refreshApp() {
      this.updateExists = false

      // Se c'è un service worker attivo, gli diciamo di aggiornarsi ed eseguire il reload
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg && reg.waiting) {
            // Mandiamo il segnale di skip waiting
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          } else {
            // Failsafe: se non trova nulla in attesa, pulisce la cache dura e ricarica
            window.location.reload()
          }
        })
      }
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

    // --- NUOVA LOGICA PWA REATTIVA E PULITA ---
    if ('serviceWorker' in navigator) {
      // Controlliamo se c'è già un worker in attesa all'avvio
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          this.updateExists = true
        }
      })

      // Ascoltiamo quando un nuovo service worker viene installato ed è pronto
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'MSG_UPDATE_FOUND') {
          this.updateExists = true
        }
      })

      // Questo è l'interruttore magico: quando il worker si aggiorna (grazie a skipWaiting e clientsClaim),
      // il browser rileva il cambio di controllo e fa l'F5 caricando DAVVERO la nuova versione.
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  },
}
</script>
