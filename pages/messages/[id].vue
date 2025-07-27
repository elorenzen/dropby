<template>
    <div>
        Messages HERE!
        {{ id }}
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

// Set page title
useSeoMeta({ title: 'Messages' })

const route = useRoute()
const id = route.params.id
</script>

<style scoped>

</style>