<template>
    <div>
      <div v-if="coordinates">
        <div class="flex justify-center p-2">
            <h3 class="text-2xl">Welcome to DropBy!</h3>
        </div>
        <v-row class="flex justify-center">
          <MapView />
        </v-row>
        <v-row class="flex justify-center">
          <MainList />
        </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useUserStore()

const coordinates = ref()
onMounted(async () => {
  const locRes = await getLocationFromUser()
  await store.setUserLocation({
    lat: locRes ? locRes.latitude : 34.0549, // Use DTLA lat. as fallback
    lng: locRes ? locRes.longitude : 118.2426 // Use DTLA lat. as fallback
  })

  coordinates.value = store.getUserLocation
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
</script>