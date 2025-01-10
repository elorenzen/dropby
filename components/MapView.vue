<template>
  <div class="flex items-center justify-center p-5">
    <ScriptGoogleMaps
      :center="center"
      :markers="markers"
      :width="1000"
      :height="500"
      :api-key="key"
      :mapOptions="{ zoom: 8 }"
    />
  </div>
</template>

<script setup lang="ts">
const config        = useRuntimeConfig()
const userStore     = useUserStore()
const merchantStore = useMerchantStore()
const merchants     = ref(merchantStore.allMerchants)
const key           = ref(config.public.gMapKey)
const markers       = ref([])
const center        = ref({ lat: 34.0557, lng: -118.2426})


onMounted(() => {
  setMerchantMarkers()
})

const setMerchantMarkers = () => {
  merchants.value.forEach((merchant:any) => {
    if (merchant.coordinates) {
      const coords = JSON.parse(merchant.coordinates)
      markers.value.push(`${coords.lat},${coords.lng}`)
    }
  })
}
</script>