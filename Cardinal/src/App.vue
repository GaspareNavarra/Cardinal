<template>
  <div id="main-page">
    <div class="card-wrapper">
      <Card style="width: 25rem">
        <template #title>Simple Card</template>
        <template #content>
          <p class="m-0">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </template>
      </Card>
    </div>
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
html,
body,
#app {
  height: 100vh;
  margin: 0;
}
/*-------------------------------------------------------------*/
#main-page {
  position: relative;
  min-height: 100vh;
  background: url('/img/cardinal_background.png') center / cover no-repeat;

  display: flex;
  justify-content: center;
  align-items: center;
}
#main-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}
.card-wrapper {
  position: relative;
  z-index: 2;
}
</style>
