<template>
    <MerchantCard v-if="merchant && merchant.length > 0" :merchant="merchant[0]" />
    <!-- 
      SEE WHY COMMENTED OUT BELOW -->
      <!-- <MerchantCard v-if="merchant && merchant != ''" :merchant="merchant" /> -->
  </template>
  
<script setup>
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