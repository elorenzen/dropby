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
              <div class="flex items-center justify-between gap-2 py-4 w-full">
                <span>{{ slotProps.data.formatted_address }}</span>
                <Badge
                  v-if="slotProps.data.coordinates && userCoords"
                  :value="getDistance(slotProps.data.coordinates)">
                </Badge>
              </div>
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
const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants
const userCoords = ref()

onMounted(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    const obj = position.coords.toJSON()
    const coords = {
      latitude: obj.latitude,
      longitude: obj.longitude
    }
    userCoords.value = coords
  });
});

const getDistance = (coordinates: any) => {
  console.log(coordinates)
  const parsedCoords = JSON.parse(coordinates)

  // Convert degrees to radians
  const radLat1 = userCoords.value.latitude * Math.PI / 180;
  const radLon1 = userCoords.value.longitude * Math.PI / 180;
  const radLat2 = parsedCoords.lat * Math.PI / 180;
  const radLon2 = parsedCoords.lng * Math.PI / 180;

  // Radius of the Earth in miles
  const R = 3950; // mi

  // Differences in coordinates
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return `${distance.toFixed(2)} mi.`; // Return distance rounded to 2 decimal places
};

</script>

<style lang="scss" scoped>

</style>