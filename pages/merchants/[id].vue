<template>
  <div v-if="merchant && merchant.length > 0">
    <div>
      <MerchantCard :merchant="merchant[0]" />
    </div>
    <Divider />
    <div>
      <EventList :acctId="merchant[0].id" :acctType="'merchant'" />
    </div>
  </div>
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