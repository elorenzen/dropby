<template>
   <v-row v-if="vendor && vendor.length > 0">
    <v-col cols="6">
      <VendorCard :vendor="vendor[0]" />
    </v-col>
    <v-col>
      <EventList :acctId="vendor[0].id" :acctType="'vendor'" />
    </v-col>
  </v-row>
</template>
  
<script setup>
  import EventList from '~/components/EventList.vue';

  const route = useRoute()
  const supabase = useSupabaseClient()
  const vendor = ref('')

  async function getVendor() {
    const { data, error } = await supabase
        .from('vendors')
        .select()
        .eq('id', route.params.id)
      
    if (error) console.log(error)
    vendor.value = data
  }

  onMounted(() => {
    getVendor()
  })
</script>

<style lang="scss" scoped>

</style>