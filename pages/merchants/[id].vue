<template>
    <MerchantCard v-if="merchant && merchant.length > 0" :merchant="merchant[0]" />
    <!-- 
      SEE WHY COMMENTED OUT BELOW -->
      <!-- <MerchantCard v-if="merchant && merchant != ''" :merchant="merchant" /> -->
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
      
    if (data) console.log('data: ', data)
    if (error) console.log(error)
    merchant.value = data

    // TESTING OBJ HERE TO PASS AS PROP WITHOUT INCURRING COSTS FROM API CALL
    // merchant.value = { 
    //   average_vendor_rating: null,
    //   created_at: "2024-09-05T16:16:37.245+00:00",
    //   email: "chris@hopsecretbrewing.com",
    //   formatted_address: null,
    //   id: "b7b2a8fb-95ce-41be-bf78-eeac9f9ea5c4",
    //   instagram: "https://www.instagram.com/hopsecretbrewery/",
    //   merchant_name: "Hop Secret Brewing Company",
    //   merchant_description: "Award-winning brewery and taproom nestled in the heart of Monrovia, CA.",
    //   phone: "(626) 386-5960",
    //   website: "https://www.hopsecretbrewing.com/"
    // }
  }

  onMounted(() => {
    getMerchant()
  })
</script>

<style lang="scss" scoped>

</style>