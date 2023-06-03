import { defineNuxtConfig } from 'nuxt/config'
import ElementPlus from 'unplugin-element-plus/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'Messenger',
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Deliver http messages between diffenert systems." },
        { charset: "utf-8" }
      ],
      link: [
        { rel: 'icon', href: '/favicon.png' }
      ],
    }
  },
  build: {
    transpile: ['element-plus/es'],
  },
  modules: [
    '@unocss/nuxt',
    'unplugin-markdown-2-html/nuxt'
  ],
  vite: {
    plugins: [
      ElementPlus(),
    ],
    assetsInclude: ['**/*.wasm'],
    resolve: {
      dedupe: ['monaco-editor']
    },
    optimizeDeps: {
      include: [
        'vscode', 'vscode/extensions', 'vscode/services', 'vscode/monaco', 'vscode/service-override/modelEditor',
        'vscode/service-override/keybindings', 'vscode/service-override/textmate', 'vscode/service-override/theme', 'vscode/service-override/languages',
        'vscode/service-override/audioCue', 'vscode/service-override/debug',
        'vscode/service-override/preferences', 'vscode/service-override/snippets', 'vscode/service-override/files',
        'vscode/default-extensions/theme-defaults', 'vscode/default-extensions/javascript', 'vscode/default-extensions/json'
      ]
    },
  },
  components: false,
})
