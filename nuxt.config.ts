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
    "@primevue/nuxt-module",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "vuetify-nuxt-module",
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "nuxt-svgo",
    "@nuxt/scripts",
    '@samk-dev/nuxt-vcalendar',
    "haversine",
    "@nuxtjs/google-fonts",
    "nuxt-graphql-client"
  ],
  runtimeConfig: {
    public: {
      autocomplete: process.env.GEO_KEY,
      gMapKey: process.env.GMAPS_API_KEY,
      GQL_HOST: 'https://spacex-api-2gl6xp7kua-ue.a.run.app/query'
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