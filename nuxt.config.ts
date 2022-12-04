import ElementPlus from 'unplugin-element-plus/vite'
import GlobPlugin from 'vite-plugin-glob'

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
        { rel: 'icon', href: '/favico.svg' }
      ],
    }
  },
  build: {
    transpile: ['element-plus/es'],
  },
  modules: [
    '@unocss/nuxt',
  ],
  vite: {
    plugins: [
      ElementPlus(),
      GlobPlugin({
        takeover: true,
      })
    ]
  },
})
