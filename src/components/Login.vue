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
          />
          <label for="password">Password</label>
        </FloatLabel>

        <Button label="Submit" severity="contrast" class="w-100 mt-2" />
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
  provide() {
    return {}
  },
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
  },
}
</script>
<style></style>
