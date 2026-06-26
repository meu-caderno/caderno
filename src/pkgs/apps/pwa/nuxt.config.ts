import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  srcDir: './app',

  modules: [
    "@vite-pwa/nuxt"
  ],

  pwa: {
  },

  typescript: {
    typeCheck: true,
  },

  devtools: {
    enabled: true
  },

});