<template>
  <div class="flex items-center justify-center p-5">
    <ScriptGoogleMaps
      ref="maps"
      :center="center"
      :markers="markers"
      :api-key="config.public.gMapKey"
      class="group"
      above-the-fold
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const maps = ref()

const config = useRuntimeConfig()

const center = ref()

const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants

const markers = ref([])


onMounted(async () => {
  console.log('merchants: ', merchants)
  if (merchants.length > 0) {
    setMerchantMarkers()
    const merchantCoords = merchants.map(merchant => JSON.parse(merchant.coordinates))
    center.value = setCenter(merchantCoords)
  } else {
    try {
      const locRes = await getLocationFromUser();
      center.value = { lat: locRes.latitude, lng: locRes.longitude }
    } catch (error) {
      center.value = { lat: 34.0549, lng: 118.2426}
      // Use Los Angeles coordinates as fallback
    }
  }
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


const setMerchantMarkers = () => {
  merchants.forEach(merchant => {
    const coords = JSON.parse(merchant.coordinates)
    const marker = { id: merchant.id, position: coords }
    markers.value.push(marker)
  })
}

const setCenter = (markers: any) => {
  let lat = 0;
  let lng = 0;
    
  for(let i = 0; i < markers.length; ++i) {
      lat += markers[i].lat;
      lng += markers[i].lng;
  }

  lat /= markers.length;
  lng /= markers.length;

  return { lat: lat, lng: lng }
}
</script>