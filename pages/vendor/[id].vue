<template>
    <div>
        <EventCalendar :id="route.params.id" />
    </div>
    <Divider />
    <div>
        <EventList :acctId="route.params.id" :acctType="'vendor'" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

const route = useRoute()
</script>