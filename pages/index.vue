<template>
    <div v-if="loading" class="card flex justify-center mt-4">
        <ProgressSpinner class="p-progress-spinner-circle" />
    </div>
    <div v-else>
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
const loading = ref(true)

const coordinates = ref()
onMounted(async () => {
  const locRes = await getLocationFromUser()
  await store.setUserLocation({
    lat: locRes ? locRes.latitude : 34.0549, // Use DTLA lat. as fallback
    lng: locRes ? locRes.longitude : 118.2426 // Use DTLA lat. as fallback
  })

  coordinates.value = store.getUserLocation
  loading.value = false
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