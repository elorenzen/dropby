// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "vuetify-nuxt-module",
    "@nuxt/scripts"
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
  }
})