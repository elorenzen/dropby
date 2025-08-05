import Aura from '@primevue/themes/aura'
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
    // "vuetify-nuxt-module",
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
    "nuxt-graphql-client",
    "nuxt-svgo",
    "@nuxt/scripts",
    '@samk-dev/nuxt-vcalendar',
    "haversine",
    "@nuxt/image"
  ],
  runtimeConfig: {
    public: {
      autocomplete: process.env.GEO_KEY,
      gMapKey: process.env.GMAPS_API_KEY,
      GQL_HOST: 'https://spacex-api-2gl6xp7kua-ue.a.run.app/query',
      openaiApiKey: process.env.OPENAI_API_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE,
    redirect: false // set to 'true', EVENTUALLY
  },
  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/base.css'
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          colorScheme: 'dark', // Force dark mode
          primaryColor: '#FF8906', // PrimeVue orange
          accentColor: '#FF8906',
          darkModeSelector: ".p-dark"
        },
      },
    },
  },
  postcss: {
    plugins: {
      "postcss-import": {},
      autoprefixer: {},
    },
  },
  googleFonts: {
    families: {
      Taviraj: true,
      "League Spartan": true,
      "Fugaz One": true,
      Shrikhand: true
    }
  },
})