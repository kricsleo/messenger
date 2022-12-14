import { defineNuxtConfig } from 'nuxt/config'
import ElementPlus from 'unplugin-element-plus/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Messenger',
      "meta": [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1"
        },
        { charset: "utf-8" }
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg' }
      ],
    }
  },
  build: {
    transpile: ['element-plus/es'],
  },
  modules: [
    '@unocss/nuxt',
    '@nuxt/content'
  ],
  vite: {
    plugins: [
      ElementPlus(),
    ]
  },
  components: false,
})
