<template>
  <div class="flex items-center justify-center p-5">
    <ScriptGoogleMaps
      ref="maps"
      :center="{ lat: lat, lng: lng }"
      :markers="markers"
      :api-key="config.public.gMapKey"
      class="group"
      above-the-fold
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoaded = ref(false)
const center = ref()
const maps = ref()

const config = useRuntimeConfig()

const lat = ref(0)
const lng = ref(0)

const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants

const markers = ref([])

onMounted(async () => {
  try {
    const locRes = await getLocationFromUser();
    lat.value = locRes.latitude
    lng.value = locRes.longitude
  } catch (error) {
    // Use Los Angeles coordinates as fallback
    lat.value = 34.0549
    lng.value = 118.2426
  }
  setMerchantMarkers()
})

const getLocationFromUser = () => {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position.coords);
      }, reject);
    } else {
      reject('Geolocation not supported');
    }
  });
}

function handleReady({ map }) {
  center.value = map.value.getCenter()
  map.value.addListener('center_changed', () => {
    center.value = map.value.getCenter()
  })
  isLoaded.value = true
}

const setMerchantMarkers = () => {
  merchants.forEach(merchant => {
    const coords = JSON.parse(merchant.coordinates)
    const marker = { id: merchant.id, position: coords }
    markers.value.push(marker)
  })
}
</script>