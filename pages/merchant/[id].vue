<template>
    <div class="ma-4">
        <div>
            <EventCalendar />
        </div>
        <Divider />
        <div>
            <EventList :acctId="route.params.id" :acctType="'merchant'" />
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

const route = useRoute()
</script>