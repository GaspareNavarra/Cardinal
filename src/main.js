import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura' // Importa il preset JS, non il CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import '../public/style/style.css'
import { definePreset } from '@primeuix/themes'
import router from './router/router'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import Tooltip from 'primevue/tooltip'

const app = createApp(App)

// 1. Definiamo il nuovo Preset basato su Aura
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // Qui mappiamo il colore primario sulla palette Zinc (grigi)
      // Questo renderà bottoni, checkbox e focus tutti "Black & White"
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
  },
})

app.use(PrimeVue, {
  // Configurazione per PrimeVue 4
  theme: {
    preset: MyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.my-app-dark', // o 'system'
      cssLayer: false,
    },
  },
})

app.use(ToastService)
app.use(router)
app.directive('tooltip', Tooltip)
app.mount('#app')
