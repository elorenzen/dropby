<template>
    <div>
        SETTINGS HERE!
        <AssociatedUsers :id="route.params.id" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id
</script>

<style scoped>

</style>