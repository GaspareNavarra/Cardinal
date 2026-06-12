import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'promptForUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Cardinal',
        short_name: 'Cardinal',
        description: 'Traccia la tua collezione di libri e manga',
        theme_color: '#141414',
        background_color: '#141414',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/android/cardinal-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/android/cardinal-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/android/cardinal-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
