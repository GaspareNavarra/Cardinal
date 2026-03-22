<template>
  <div class="col-12 col-sm-10 col-md-6 col-lg-4 card-wrapper">
    <Card class="p-4 shadow-xl stocazzo">
      <template #title>
        <img
          src="/img/cardinal_logo_with_text.png"
          class="img-fluid w-100 d-block mx-auto mb-2"
          alt="Logo"
        />
      </template>
      <template #content>
        <FloatLabel variant="on" class="w-100 mb-4">
          <InputText id="email" type="email" v-model.trim="email" class="w-100" />
          <label for="email">email</label>
        </FloatLabel>

        <FloatLabel variant="on" class="w-100 mb-4">
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggle-mask
            class="w-100"
            inputClass="w-100"
            @keyup.enter="doLogin(email, password)"
          />
          <label for="password">Password</label>
        </FloatLabel>

        <Button
          label="Submit"
          severity="contrast"
          class="w-100 mt-2"
          :disabled="!enableLoginButton()"
          @click="doLogin(email, password)"
          >Login</Button
        >
      </template>
    </Card>
  </div>
</template>
<script>
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

export default {
  components: {
    Card,
    FloatLabel,
    InputText,
    Password,
    Button,
  },
  inject: ['setIsLoading', 'setUserStatus', 'showToast', 'doLogin'],
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    linkTo(path) {
      this.$router.push(path)
    },
    enableLoginButton() {
      if (this.email == '' || this.password == '') return false
      return true
    },
  },
}
</script>
<style scoped>
/* Adattamento FloatLabel per fondo scuro */
:deep(.p-floatlabel) {
  /* Rimuoviamo il gradiente bianco, usiamo la trasparenza o il colore della card */
  --p-floatlabel-on-active-background: transparent !important;
}

:deep(.p-floatlabel label) {
  padding: 0 6px !important;
  background: rgba(20, 20, 20, 0.8) !important; /* Un piccolo sfondo per la label quando sale */
  color: rgba(255, 255, 255, 0.6) !important;
}

/* Colore label quando è attiva */
:deep(.p-floatlabel input:focus ~ label),
:deep(.p-floatlabel input.p-filled ~ label) {
  color: #ffcc00 !important; /* Giallo Cardinal */
}

:deep(.p-password input) {
  width: 100%;
}

.card-wrapper {
  /* Tolto il transform rigido per far lavorare meglio l'animazione zoomIn */
  margin-top: -5vh;
}

:deep(.p-card-title) {
  margin-top: -10px !important;
  margin-bottom: 20px !important;
}

:deep(.p-card-content) {
  padding-bottom: 1.5rem !important;
}
</style>
