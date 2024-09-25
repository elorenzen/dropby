<template>
    <VendorCard v-if="vendor && vendor.length > 0" :vendor="vendor[0]" />
</template>
  
<script setup>
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