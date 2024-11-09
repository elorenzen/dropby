<template>
  <v-row v-if="merchant && merchant.length > 0">
    <v-col cols="12">
      <MerchantCard :merchant="merchant[0]" />
    </v-col>
    <v-col>
      <EventList :acctId="merchant[0].id" :acctType="'merchant'" />
    </v-col>
  </v-row>
</template>
  
<script setup>
  import EventList from '~/components/EventList.vue';

  const route = useRoute()
  const supabase = useSupabaseClient()
  const merchant = ref('')

  async function getMerchant() {
    const { data, error } = await supabase
        .from('merchants')
        .select()
        .eq('id', route.params.id)
      
    if (error) console.log(error)
    merchant.value = data
  }

  onMounted(() => {
    getMerchant()
  })
</script>

<style lang="scss" scoped>

</style>