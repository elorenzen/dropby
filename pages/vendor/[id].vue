<template>
    <div class="ma-4">
        <VendorEventTable />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

const route = useRoute()
</script>