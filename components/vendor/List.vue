<template>
  <DataTable
      :value="vendors"
      sortField="average_merchant_rating" :sort-order="-1"
  >
      <Column field="vendor_name" header="Name" sortable>
          <template #body="slotProps">
              {{ slotProps.data.vendor_name }}
          </template>
      </Column>
      <Column field="cuisine" header="Cuisine">
          <template #body="slotProps">
            <Badge class="mx-1" v-for="(i, index) in slotProps.data.cuisine" :key="`${i}-${index}`">{{ i }}</Badge>
          </template>
      </Column>
      <Column field="average_merchant_rating" header="Rating" :sortable="true">
          <template #body="slotProps">
            <Rating v-model="slotProps.data.average_merchant_rating" />
          </template>
      </Column>
      <Column field="socials" header="">
          <template #body="slotProps">
            <!-- 
            WILL BE READONLY WITH TOOLTIP
            <Button icon variant="plain">
                <NuxtLink :to="`tel:${slotProps.data.phone}`" target="_blank">
                    <v-icon>mdi-phone</v-icon>
                </NuxtLink>
            </Button> -->
            <Button icon="pi pi-globe" variant="plain">
                <NuxtLink :to="slotProps.data.website" target="_blank" />
            </Button>
            <Button icon="pi pi-instagram" variant="plain">
                <NuxtLink :to="slotProps.data.instagram" target="_blank" />
            </Button>
            <Button icon="pi pi-envelope" variant="plain">
              <NuxtLink :to="`mailto:${slotProps.data.email}`" target="_blank" />
            </Button>
          </template>
      </Column>
  </DataTable>
  </template>

<script setup>
const vendorStore = useVendorStore()
const vendors = vendorStore.getAllVendors
</script>

<style lang="scss" scoped>

</style>