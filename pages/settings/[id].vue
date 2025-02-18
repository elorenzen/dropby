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
const store = useUserStore()
const user:any = store.getUser
const type = user?.type
</script>

<style scoped>

</style>