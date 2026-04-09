<template>
    <div>
        <MerchantSettings v-if="type === 'merchant'" />
        <VendorSettings v-else-if="type === 'vendor'" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})
const route = useRoute()
const userStore = useUserStore()
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const user: any = userStore.getUser
const type = user?.type

// Load business data - handle case where stores might not have data yet
const business = ref<any>(null)

if (type === 'merchant') {
    // Try to get from store first, then load if needed
    let merchantData = await merchantStore.getMerchantById(route.params.id as string)
    if (!merchantData) {
        // Load merchants if not already loaded
        await merchantStore.loadMerchants()
        merchantData = await merchantStore.getMerchantById(route.params.id as string)
    }
    business.value = merchantData
    // Preferred vendors UI needs the vendor directory; hard refresh skips app.vue timing
    if (vendorStore.allVendors.length === 0) {
        await vendorStore.loadVendors()
    }
} else if (type === 'vendor') {
    let vendorData = await vendorStore.getVendorById(route.params.id as string)
    if (!vendorData) {
        await vendorStore.loadVendors()
        vendorData = await vendorStore.getVendorById(route.params.id as string)
    }
    business.value = vendorData
}

// Safe title with fallback
const businessName = computed(() => {
    if (!business.value || !type) return 'Settings'
    return business.value[`${type}_name`] || 'Settings'
})

useSeoMeta({ title: () => `Settings | ${businessName.value}` })
</script>

<style scoped>

</style>