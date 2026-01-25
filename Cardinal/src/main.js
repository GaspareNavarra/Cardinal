import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
// import Card from 'primevue/card';

// tema Aura
import '@primeuix/themes/aura/aura-dark-indigo.css';

// oppure light:
// import 'primevue/resources/themes/aura-light-indigo/theme.css'

// core PrimeVue
import 'primevue/resources/primevue.min.css'

// icone
import 'primeicons/primeicons.css'


const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.use(router)
app.use(PrimeVue)

// app.component('Card', Card)

app.mount('#app')
