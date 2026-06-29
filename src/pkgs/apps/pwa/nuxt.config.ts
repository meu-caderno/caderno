// https://nuxt.com/docs/api/configuration/nuxt-config

const baseURL = process.env.BASE_URL || "/";
const siteOrigin =
  process.env.NUXT_PUBLIC_SITE_URL || "https://meu-caderno.github.io";

const homeUrl = `${siteOrigin}${baseURL}`;

const ogImageUrl = `${homeUrl}og-image.png`;

const title = "Meu Caderno";
const description =
  "Caderno é um app local-first para organizar seus estudos (matérias, atividades, presença, notas e materiais), funcionando offline, com seus dados no seu dispositivo.";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  srcDir: "./app",

  css: ["~/assets/css/papel-tinta.css"],

  modules: [
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/seo",
    "@nuxt/image",
    "@nuxt/fonts",
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
    prerender: {
      crawlLinks: true,
      routes: ["/"],
      failOnError: false,
    },
  },

  routeRules: {
    "/**": { prerender: true },
  },

  experimental: {
    typedPages: true,
    payloadExtraction: true,
    sharedPrerenderData: true,
    viewTransition: true,
  },

  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: "pt-BR" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
      title,
      meta: [
        { name: "description", content: description },
        { name: "theme-color", content: "#faf6ec" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: title },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:url", content: homeUrl },
        { property: "og:image", content: ogImageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageUrl },
      ],
      link: [
        { rel: "canonical", href: homeUrl },
        { rel: "icon", href: `${baseURL}favicon.ico`, sizes: "any" },
        { rel: "apple-touch-icon", href: `${baseURL}apple-touch-icon.png` },
      ],
    },
  },

  site: {
    url: siteOrigin,
    name: title,
    description,
    defaultLocale: "pt-BR",
  },

  ogImage: {
    enabled: false,
  },

  robots: {
    robotsTxt: false,
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  devtools: {
    enabled: true,
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: title,
      short_name: "Caderno",
      description,
      lang: "pt-BR",
      theme_color: "#faf6ec",
      background_color: "#faf6ec",
      display: "standalone",
      start_url: baseURL,
      scope: baseURL,
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: baseURL,
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
    client: { installPrompt: true },
    devOptions: { enabled: true, type: "module", suppressWarnings: true },
  },

  i18n: {
    defaultLocale: "pt-BR",
    strategy: "no_prefix",
    baseUrl: siteOrigin,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
    },
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      {
        code: "pt-BR",
        name: "Português",
        language: "pt-BR",
        file: "pt-BR.json",
      },
    ],
  },

  hints: {
    devtools: true,

    features: {
      hydration: true,
    },
  },

  fonts: {
    families: [
      {
        name: "Familjen Grotesk",
        provider: "google",
        weights: [400, 500, 600, 700],
      },
      {
        name: "Shantell Sans",
        provider: "google",
        weights: [400, 500, 600, 700],
      },
      {
        name: "Literata",
        provider: "google",
        weights: [400, 500, 600],
        styles: ["normal", "italic"],
      },
    ],
  },

  image: {
    provider: "ipxStatic",
    format: ["avif", "webp"],
    quality: 70,
    densities: [1, 2],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  scripts: {
    defaultScriptOptions: { trigger: "onNuxtReady" },
  },

  a11y: {
    enabled: true,
  },

  colorMode: {
    classSuffix: "",
    storageKey: "caderno-color-mode",
    fallback: "light",
    preference: "system",
  },

  icon: {
    mode: "css",
    serverBundle: false,
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },
});
