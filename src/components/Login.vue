<template>
  <div class="col-11 col-sm-8 col-md-6 col-lg-4 card-wrapper">
    <Card class="p-4 shadow-xl">
      <template #title>
        <img
          src="/img/cardinal_logo_with_text.png"
          class="img-fluid w-100 d-block mx-auto mb-2"
          alt="Logo"
        />
      </template>
      <template #content>
        <FloatLabel variant="on" class="w-100 mb-4">
          <InputText id="username" v-model="username" class="w-100" />
          <label for="username">Username</label>
        </FloatLabel>

        <FloatLabel variant="on" class="w-100 mb-4">
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggle-mask
            class="w-100"
            inputClass="w-100"
            @keyup.enter="Login()"
          />
          <label for="password">Password</label>
        </FloatLabel>

        <Button
          label="Submit"
          severity="contrast"
          class="w-100 mt-2"
          :disabled="!enableLoginButton()"
          @click="Login()"
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
import axios from 'axios'
import endpoints from '@/config/endpoints.json'

export default {
  components: {
    Card,
    FloatLabel,
    InputText,
    Password,
    Button,
  },
  inject: ['setIsLoading', 'setUserStatus', 'showToast'],
  data() {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    linkTo(path) {
      this.$router.push(path)
    },
    enableLoginButton() {
      if (this.username == '' || this.password == '') return false
      return true
    },
    async Login() {
      this.setIsLoading(true)
      const params = {
        username: this.username,
        password: this.password,
      }

      try {
        const response = await axios.post(endpoints.BASE_URL + endpoints.AUTH.LOGIN, params)
        localStorage.setItem('token', response.data.authToken)
        this.showToast({
          severity: 'success',
          summary: 'Login effettuato',
          detail: 'Benvenuto in Cardinal',
          life: 4000,
        })
        this.setUserStatus(true)
        this.$router.push('/home')
      } catch (error) {
        console.log(error)
        this.showToast({
          severity: 'error',
          summary: 'Errore Login',
          detail: 'Username o Password non validi',
          life: 4000,
        })
        this.setUserStatus(false)
      }
      this.setIsLoading(false)
    },
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
