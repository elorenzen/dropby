<template>
    <div class="ma-4">
        <Card class="ma-2">
            <template #title>
                Welcome, {{
                    (user.first_name && user.last_name) ?
                    `${user.first_name} ${user.last_name.substring(0, 1)}` :
                    'User'
                }}.
            </template>
            <template #content>
                {{ user }}
            </template>
        </Card>
        <Card class="ma-2">
            <template #title>
                Upcoming Events
            </template>
            <template #content>
                <EventCalendar />
                <Divider />
                <MerchantEventTable />
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})
const store = useUserStore()
const user = ref(store.user)

const route = useRoute()
const merchantStore = useMerchantStore()
const merchant = ref(await merchantStore.getMerchantById(route.params.id))
useSeoMeta({ title: () => `${merchant.value.merchant_name} Home` })
</script>