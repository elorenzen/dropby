<template>
  <div v-if="merchant && merchant.length > 0">
    <MerchantCard :merchant="merchant[0]" />
    <Calendar :merchant="merchant[0]" />
  </div>
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