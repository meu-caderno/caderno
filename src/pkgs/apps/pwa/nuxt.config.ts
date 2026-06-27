// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  ssr: false,
  nitro: {
    preset: "static",
  },

  app: {
    baseURL: process.env.BASE_URL || "/",
  },

  srcDir: "./app",

  typescript: {
    typeCheck: false,
    strict: true,
  },

  devtools: {
    enabled: true,
  },
});
