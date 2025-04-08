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
        <Dialog v-model:visible="addEventDialog" modal :header="`Add Event for ${newEventDate.toLocaleDateString()}`" :style="{ width: '45rem' }">
            <EventBaseDialog>
                <template #content>
                    <Fluid>
                        <div class="col-span-full">
                            <FloatLabel variant="on" class="my-4">
                            <DatePicker id="new-event-start" v-model="newEventStart" timeOnly fluid hourFormat="12" />
                            <label for="new-event-start" class="block mb-2"> Start Time</label>
                            </FloatLabel>
                        </div>
                        <div class="col-span-full">
                            <FloatLabel variant="on" class="my-4">
                            <label for="new-event-end" class="block mb-2"> End Time</label>
                            <DatePicker id="new-event-end" v-model="newEventEnd" timeOnly fluid hourFormat="12" />
                            </FloatLabel>
                        </div>
                        <div class="col-span-full">
                            <FloatLabel variant="on" class="my-4">
                                <Textarea id="notes" v-model="notes" rows="3" />
                                <label for="notes">Notes for Vendor</label>
                            </FloatLabel>
                        </div>
                    </Fluid>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button
                            @click="addEvent"
                            :disabled="
                                !newEventStart ||
                                !newEventEnd ||
                                new Date(newEventStart).getTime() < new Date().getTime()
                            "
                            label="Add Event"
                            class="w-full"
                            :loading="loading"
                        ></Button>
                    </div>
                </template>
            </EventBaseDialog>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})
import { v4 } from 'uuid'
const supabase       = useSupabaseClient()
const userStore      = useUserStore()
const vendorStore    = useVendorStore()
const eventStore     = useEventStore()
const user           = ref(userStore.user)
const vendor         = ref(await vendorStore.getVendorById(user.value.associated_vendor_id))
useSeoMeta({ title: () => `${vendor.value.vendor_name} Home` })
const refreshKey     = ref(0)
const addEventDialog = ref(false)
const allEvents      = ref(eventStore.getAllOpenEvents)
const bookedEvents   = ref(await eventStore.getBookedEventsByVendorId(vendor.value.id))
console.log(bookedEvents.value)
const pendingEvents  = ref(await eventStore.getPendingEventsByVendorId(vendor.value.id))
const newEventDate   = ref(new Date())
const newEventStart  = ref(new Date())
const newEventEnd    = ref(new Date())
const notes          = ref('')
const loading        = ref(false)
const dayId          = ref()
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

watch(newEventStart, (newVal) => {
    console.log(new Date(newVal).getTime())
    console.log(new Date().getTime())
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
        newEventDate.value = day.date
        dayId.value = day.id
    }
}
const addEvent = async () => {
    loading.value    = true
    const startHours = new Date(newEventStart.value).getHours()
    const endHours   = new Date(newEventEnd.value).getHours()
    const day        = newEventDate.value
    const eventStart = day.setHours(startHours)
    const eventEnd   = day.setHours(endHours)

    const evtObj = {
        id: v4(),
        created_at: new Date(),
        merchant: null,
        vendor: vendor.value.id,
        start: new Date(eventStart),
        end: new Date(eventEnd),
        day_id: dayId.value,
        // location_coordinates:(vendor.value.base_latitude && vendor.value.base_longitude) ? `${vendor.value.base_latitude},${vendor.value.base_longitude}` : null,
        // location_address: (vendor.value.base_address) ? vendor.value.base_address : null,
        // location_url: (vendor.value.base_url) ? vendor.value.base_url : null,
        status: 'booked',
        vendor_rating: null,
        merchant_rating: null,
        vendor_comment: null,
        merchant_comment: null,
        notes: notes.value
    }
    const { error } = await supabase.from('events').insert(evtObj)
    // if (!error) await resetFields('created')
    // else {
    //     errType.value = 'Event Creation'
    //     errMsg.value = error.message
    //     errDialog.value = true
    // }
    loading.value = false
  }
</script>