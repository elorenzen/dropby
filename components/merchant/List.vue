<template>
  <DataTable
      v-if="allMerchants && allMerchants.length > 0"
      :value="allMerchants"
      sortField="average_vendor_rating" :sort-order="-1"
  >
      <Column field="merchant_name" header="Name" sortable>
          <template #body="slotProps">
              {{ slotProps.data.merchant_name }}
          </template>
      </Column>
      <Column field="formatted_address" header="Address">
          <template #body="slotProps">
              {{ slotProps.data.formatted_address }}
              <Badge v-if="slotProps.data && slotProps.data.coordinates" :value="getDistance(slotProps.data.coordinates)"></Badge>
          </template>
      </Column>
      <Column field="average_vendor_rating" header="Rating" :sortable="true">
          <template #body="slotProps">
            <Rating v-model="slotProps.data.average_vendor_rating" />
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
const userStore = useUserStore()
const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants

const lat = ref(34.0549) // Use DTLA lat. as fallback
const lng = ref(118.2426) // Use DTLA lat. as fallback

onMounted(() => {
  const coordinates = userStore.getUserLocation
  lat.value = coordinates.lat
  lng.value =  coordinates.lng
})

const allMerchants = computed(() => {
  let allMerchants = merchants
  return allMerchants.sort((a, b) => a.merchant_name.localeCompare(b.merchant_name))
})

const getDistance = (coordinates: any) => {
  const coordsParam = JSON.parse(coordinates)
  const merchantCoords = {
    latitude: coordsParam.lat,
    longitude: coordsParam.lng
  }

  // Use 'haversine' package to calculate distance from user location to each merchant location.
  const merchantDist = haversine(
    { latitude: lat.value, longitude: lng.value },
    merchantCoords,
    {unit: 'mile'}
  )
  return `${merchantDist.toFixed(2)} mi.`
}
</script>

<style lang="scss" scoped>

</style>