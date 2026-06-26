// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  srcDir: './app',

  modules: ["@vite-pwa/nuxt"],

  typescript: {
    typeCheck: true,
  },

  devtools: {
    enabled: true
  },

  pwa: {
  },
});