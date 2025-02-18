import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  // routeRules: {
  //   '/': { prerender: true }
  // },
  ssr: false,
  app: {
    pageTransition: {
      name: 'fade',
      mode: 'out-in'
    },
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "vuetify-nuxt-module",
    "@nuxt/scripts",
    '@samk-dev/nuxt-vcalendar',
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "haversine",
    "nuxt-svgo",
    "@nuxtjs/google-fonts"
  ],
  runtimeConfig: {
    public: {
      autocomplete: process.env.GEO_KEY,
      gMapKey: process.env.GMAPS_API_KEY
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE,
    redirect: false // set to 'true', EVENTUALLY
  },
  primevue: {
    importTheme: { from: '~/assets/theme.js' },
  },
  googleFonts: {
    families: {
      Taviraj: true,
      "League Spartan": true,
      "Fugaz One": true,
      Shrikhand: true
    }
  },
  css: ['primeicons/primeicons.css']
})