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
const route = useRoute()
const id = route.params.id
</script>

<style scoped>

</style>