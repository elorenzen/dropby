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
            <!-- <template #content>
                {{ user }}
            </template> -->
        </Card>
        <Card class="ma-2">
            <template #title>
                Upcoming Events
            </template>
            <template #content>
                <BaseCalendar :attributes="attributes" :refresh="refreshKey" @dayclick="openDayView" />
                <Divider />
                <VendorEventTable />
            </template>
        </Card>
        <Dialog v-model:visible="addEventDialog" modal header="Add Event" :style="{ width: '45rem' }">
            <EventBaseDialog>
                <template #content>content here</template>
                <template #footer>footer here</template>
            </EventBaseDialog>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})
const userStore      = useUserStore()
const vendorStore    = useVendorStore()
const eventStore     = useEventStore()
const user           = ref(userStore.user)
const vendor         = ref(await vendorStore.getVendorById(user.value.associated_vendor_id))
const refreshKey     = ref(0)
const addEventDialog = ref(false)
const allEvents      = ref(eventStore.getAllOpenEvents)
const bookedEvents   = ref(await eventStore.getBookedEventsByVendorId(vendor.value.id))
console.log(bookedEvents.value)
const pendingEvents  = ref(await eventStore.getPendingEventsByVendorId(vendor.value.id))

const events         = computed(() => {
    return eventStore.allEvents
      .filter((e: any) => e.vendor === vendor.value.id)
      .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
  })

const allBookedDates = computed(() => {
  const allBookedEvents = events.value.filter((e: any) => e.status === 'booked')
  console.log(allBookedEvents)
  return allBookedEvents.map((e: any) => new Date(e.start))
})

const attributes     = ref([
    {
      highlight: {
        color: 'orange',
        fillMode: 'outline'
      },
      dates: new Date(),
    },
    {
      highlight: {
          color: 'green',
          fillMode: 'light',
        },
      dates: allEvents.value
    },
    {
      highlight: {
          color: 'yellow',
          fillMode: 'light',
        },
      dates: pendingEvents.value
    },
    {
      dot: true,
      dates: bookedEvents.value
    }
])
const openDayView = (day: any) => {
    console.log(day)
    const aggregateEvents = [...allEvents.value, ...bookedEvents.value, ...pendingEvents.value]
    // first, check if there are events on this day
    const eventsOnDay = aggregateEvents.filter((e: any) => e.day_id === day.id)
    console.log('eventsOnDay', eventsOnDay)
    // if there are, check what type of event each is
        // if it is an open event, show 'Request Event' button
        // if it is a pending event, show 'Cancel Request' button
        // if it is a booked event, determine who booked it(merchant or vendor)
            // if it is a vendor, show 'Cancel Event' button
    // else, if day is not in the past, show 'Add Event' dialog for vendor
    if (eventsOnDay.length === 0 && day.date > new Date()){
        addEventDialog.value = true

    }
}
</script>