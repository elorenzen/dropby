<template>
    <span>Merchant ID: {{ $route.params.id }}</span>
    {{ merchant }}
  </template>
  
  <script setup>
  const route = useRoute()
  const supabase = useSupabaseClient()
  console.log(route.params) // { id: '123' }
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