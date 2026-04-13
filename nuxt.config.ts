import DropByTheme from './assets/themes/dropby-theme'

const appEnv = process.env.NUXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development'
const isDev = appEnv === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: isDev },
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
    "nuxt-svgo",
    "@nuxt/scripts",
    '@samk-dev/nuxt-vcalendar',
    "haversine",
    "@nuxt/image"
  ],
  runtimeConfig: {
    superadminEmail: process.env.SUPERADMIN_EMAIL || '',
    public: {
      appEnv,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://dropby.dev',
      gMapKey: process.env.GMAPS_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE,
    redirect: false
  },
  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/base.css'
  ],
  primevue: {
    importTheme: { from: '~/assets/themes/dropby-theme.ts' },
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: DropByTheme
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