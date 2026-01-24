import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
// import Card from 'primevue/card';


const app = createApp(App)

app.use(router)
app.use(PrimeVue)

// app.component('Card', Card)

app.mount('#app')
