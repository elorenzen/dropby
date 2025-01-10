<template>
   <v-row>
    <VendorCard :id="route.params.id" />
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