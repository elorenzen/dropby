<template>
   <v-row>
    <v-col cols="6">
      <VendorCard :id="route.params.id" />
    </v-col>

    <v-divider class="my-2"></v-divider>

    <v-row class="mt-4">
      <v-col><EventList :acctId="route.params.id" :acctType="'vendor'" /></v-col>
      <v-col><AllEvents :vendor="route.params.id" /></v-col>
    </v-row>
  </v-row>
</template>
  
<script setup lang="ts">
  definePageMeta({
    middleware: ['auth']
  })
  const route = useRoute()
</script>

<style lang="scss" scoped>

</style>