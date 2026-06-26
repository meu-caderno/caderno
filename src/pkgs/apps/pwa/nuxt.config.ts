import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  srcDir: './app',

  nitro: {
    preset: 'bun'
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  devtools: {
    enabled: true
  },
});