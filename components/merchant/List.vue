<template>
  <DataTable
      :value="merchants"
      sortField="average_vendor_rating" :sort-order="-1"
  >
      <Column field="merchant_name" header="Merchant" sortable>
          <template #body="slotProps">
              <p class="m-0 font-semibold">{{ slotProps.data.merchant_name }}</p>
          </template>
      </Column>
      <Column field="formatted_address" header="Address">
          <template #body="slotProps">
              {{ slotProps.data.formatted_address }}
              <!-- <Badge v-if="slotProps.data.coordinates" :value="getDistance(slotProps.data.coordinates)"></Badge> -->
          </template>
      </Column>
      <Column field="average_vendor_rating" header="Rating" :sortable="true">
          <template #body="slotProps">
            <Rating v-model="slotProps.data.average_vendor_rating" />
          </template>
      </Column>
      <Column field="socials" header="">
          <template #body="slotProps">
              <Button
                  as="a"
                  size="small"
                  class="mr-1"
                  icon="pi pi-globe"
                  variant="text"
                  :href="slotProps.data.website"
                  rounded
                  target="_blank"
              />
              <Button
                  as="a"
                  size="small"
                  class="mr-1"
                  icon="pi pi-instagram"
                  variant="text"
                  :href="slotProps.data.instagram"
                  rounded
                  target="_blank"
              />
              <Button
                  as="a"
                  size="small"
                  class="mr-1"
                  icon="pi pi-envelope"
                  variant="text"
                  :href="`mailto:${slotProps.data.email}`"
                  rounded
                  target="_blank"
              />
          </template>
      </Column>
  </DataTable>
  </template>

<script setup lang="ts">
import haversine from 'haversine'
const userStore = useUserStore()
const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants
const coordinates = userStore.getUserLocation

const lat = ref(coordinates.lat ? coordinates.lat : 34.0549) // Use DTLA lat. as fallback
const lng = ref(coordinates.lng ? coordinates.lng : -118.2426) // Use DTLA lat. as fallback

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