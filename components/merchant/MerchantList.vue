<template>
    <v-data-table :headers="headers" :items="merchants">
        <template v-slot:item.actions="{ item }">
            <v-btn icon variant="plain">
                <NuxtLink :to="`/merchants/${item.id}`">
                    <v-icon>mdi-eye</v-icon>
                </NuxtLink>
            </v-btn>
        </template>
    </v-data-table>
  </template>

<script setup>
const supabase = useSupabaseClient()
const headers = ref([
    { title: 'Name', key: 'merchant_name' },
    { title: 'Website URL', key: 'website' },
    { title: 'Instagram', key: 'instagram' },
    { title: 'Phone Number', key: 'phone' },
    { title: 'Email', key: 'email' },
    { title: 'Avg. Vendor Rating', key: 'average_vendor_rating' },
    { title: '', key: 'actions'}
])
const merchants = ref([])

async function getMerchants() {
  const { data } = await supabase.from('merchants').select()
  merchants.value = data
}

onMounted(() => {
  getMerchants()
})
</script>

<style lang="scss" scoped>

</style>