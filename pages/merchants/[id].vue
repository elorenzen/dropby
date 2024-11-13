<template>
  <v-row>
      <MerchantCard :id="route.params.id" />
    <Divider />
    <div>
      <EventList :acctId="route.params.id" :acctType="'merchant'" />
    </div>
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