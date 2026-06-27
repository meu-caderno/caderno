// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  srcDir: "./app",

  modules: [
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/image",
    "@nuxt/hints",
    "@nuxt/scripts",
    "@nuxt/a11y",
    "@nuxt/icon",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
  ],

  ssr: false,

  nitro: {
    preset: "static",
  },

  app: {
    baseURL: process.env.BASE_URL || "/",
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  devtools: {
    enabled: true,
  },

  pwa: {},

  i18n: {
    defaultLocale: "pt-BR",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "pt-BR", name: "Português", file: "pt-BR.json" },
    ],
    strategy: "no_prefix",
  },

  hints: {
    devtools: true,

    // Enable or configure individual features
    // if you feel overwhelmed by logs, you can disable some features and fix things step by step.
    features: {
      // Defaults to true for each feature
      hydration: true,
    },
  },

  image: {},

  colorMode: {},

  icon: {},
});
