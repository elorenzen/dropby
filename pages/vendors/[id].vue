<template>
  <div v-if="vendor && vendor.length > 0">
    <VendorCard :vendor="vendor[0]" />
    <VendorMenu :vendor="vendor[0]" />
  </div>
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