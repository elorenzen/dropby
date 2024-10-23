<template>
  <DataTable
      v-model:selection="selectedEvt"
      :value="merchants"
      selectionMode="single"
      dataKey="id"
      @row-select="selectRow"
  >
      <Column field="merchant_name" header="Name">
          <template #body="slotProps">
              {{ slotProps.data.merchant_name }}
          </template>
      </Column>
      <Column field="formatted_address" header="Address">
          <template #body="slotProps">
              {{ slotProps.data.formatted_address }}
              <Badge :value="getDistance(slotProps.data.coordinates)"></Badge>
          </template>
      </Column>
      <Column field="socials" header="">
          <template #body="slotProps">
            <!-- 
            WILL BE READONLY WITH TOOLTIP
            <v-btn icon variant="plain">
                <NuxtLink :to="`tel:${slotProps.data.phone}`" target="_blank">
                    <v-icon>mdi-phone</v-icon>
                </NuxtLink>
            </v-btn> -->
            <v-btn icon variant="plain">
                <NuxtLink :to="slotProps.data.website" target="_blank">
                    <v-icon>mdi-web</v-icon>
                </NuxtLink>
            </v-btn>
            <v-btn icon variant="plain">
                <NuxtLink :to="slotProps.data.instagram" target="_blank">
                    <v-icon>mdi-instagram</v-icon>
                </NuxtLink>
            </v-btn>
            <v-btn icon variant="plain">
              <NuxtLink :to="`mailto:${slotProps.data.email}`" target="_blank">
                  <v-icon>mdi-email</v-icon>
              </NuxtLink>
            </v-btn>
          </template>
      </Column>
  </DataTable>
  </template>

<script setup lang="ts">
import haversine from 'haversine'
const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants

const lat = ref(0)
const lng = ref(0)

onMounted(async () => {
  const locRes = await getLocationFromUser();
  lat.value = locRes ? locRes.latitude : 34.0549 // Use DTLA lat. as fallback
  lng.value =  locRes ? locRes.longitude : 118.2426 // Use DTLA lng. as fallback
})

const getDistance = (coordinates: any) => {
  const coordsParam = JSON.parse(coordinates)
  const merchantCoords = {
    latitude: coordsParam.lat,
    longitude: coordsParam.lng
  }
  const merchantDist = haversine(
    { latitude: lat.value, longitude: lng.value },
    merchantCoords,
    {unit: 'mile'}
  )
  return `${merchantDist.toFixed(2)} mi.`
}

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

<style lang="scss" scoped>

</style>