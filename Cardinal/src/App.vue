<template>
  <div id="main-page">
    <template class="row">
      <Card class="col-sm-12">
        <template #title>Simple Card</template>
        <template #content>
          <p class="m-0">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur
            error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis,
            culpa ratione quam perferendis esse, cupiditate neque quas!
          </p>
        </template>
      </Card>
    </template>
  </div>
</template>
<script>
import Card from 'primevue/card'
export default {
  components: {
    Card,
  },
  provide() {
    return {}
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
<style>
* {
  color: black;
}
#main-page {
  background: linear-gradient(90deg, rgba(42, 123, 155, 1) 0%, rgba(255, 0, 0, 1) 100%, rgba(237, 221, 83, 1) 100%);
  width: 100%;
  height: 100%;
}
</style>
