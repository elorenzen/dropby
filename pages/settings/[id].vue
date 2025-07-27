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
const user:any = userStore.getUser
const type = user?.type
const business = ref(
    type === 'merchant' ?
    await merchantStore.getMerchantById(route.params.id) :
    await vendorStore.getVendorById(route.params.id)
)
useSeoMeta({ title: () => `Settings | ${business.value[`${type}_name`]}` })
</script>

<style scoped>

</style>