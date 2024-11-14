<template>
    <div>
        <MerchantSettings v-if="type === 'merchant'" :id="route.params.id" />
        <VendorSettings v-else-if="type === 'vendor'" :id="route.params.id" />
        <div v-if="type === 'vendor'">
            <Divider />
            <VendorMenu :id="route.params.id" />
            <Divider />
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})
const route = useRoute()
const userStore = useUserStore()
const type = userStore.user.type
</script>

<style scoped>

</style>