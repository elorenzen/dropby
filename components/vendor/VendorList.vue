<template>
    <v-data-table :headers="headers" :items="vendors">
        <template v-slot:item.actions="{ item }">
            <v-btn icon variant="plain">
                <NuxtLink :to="`/vendors/${item.id}`">
                    <v-icon>mdi-eye</v-icon>
                </NuxtLink>
            </v-btn>
        </template>
    </v-data-table>
  </template>

<script setup>
const supabase = useSupabaseClient()
const headers = ref([
    { title: 'Name', key: 'vendor_name' },
    { title: 'Website URL', key: 'website' },
    { title: 'Instagram', key: 'instagram' },
    { title: 'Phone Number', key: 'phone' },
    { title: 'Email', key: 'email' },
    { title: 'Avg. Merchant Rating', key: 'average_merchant_rating' },
    { title: '', key: 'actions'}
])
const vendors = ref([])

async function getVendors() {
  const { data } = await supabase.from('vendors').select()
  vendors.value = data
}

onMounted(() => {
  getVendors()
})
</script>

<style lang="scss" scoped>

</style>