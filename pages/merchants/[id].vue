<template>
  <v-row v-if="merchant && merchant.length > 0">
    <v-col cols="6">
      <MerchantCard :merchant="merchant[0]" />
    </v-col>
    <v-col>
    <EventList :merchant="merchant[0]" />
  </v-col>
  </v-row>
</template>
  
<script setup>
import EventList from '~/components/merchant/EventList.vue';

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