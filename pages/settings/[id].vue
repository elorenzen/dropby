<template>
    <div>
        <MerchantSettings v-if="type === 'merchant'" :id="route.params.id" />
        <VendorSettings v-else-if="type === 'vendor'" :id="route.params.id" />
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