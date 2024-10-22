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

<script setup>
const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants
</script>

<style lang="scss" scoped>

</style>