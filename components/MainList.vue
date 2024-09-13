<template>
  <v-card>
    <v-tabs
      v-model="tab"
      align-tabs="center"
      color="#000022"
    >
      <v-tab :value="1">Establishments</v-tab>
      <v-tab :value="2">Food Trucks</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item
        v-for="n in 2"
        :key="n"
        :value="n"
      >
        <v-container>
            <MerchantList v-if="n == 1" />
            <VendorList v-else />
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script>
export default {
    data: () => ({
      tab: null,
    }),
}
</script>

<style lang="scss" scoped>

</style>