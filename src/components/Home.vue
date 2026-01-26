<template>
  <div id="homePage" class="row">
    <Card class="p-4 shadow-xl col-sm-12">
      <template #title></template>
      <template #content> </template>
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
  beforeMount() {
    if (!this.getUserStatus()) {
      this.$router.push('/')
    }
  },
}
</script>
