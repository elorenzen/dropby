<template>
  <div>
    <VCalendar is-dark expanded :attributes="attributes" @dayclick="openDayView" />
    <Dialog v-model:visible="dayViewDialog" modal :header="new Date(dayDate).toLocaleDateString()" :style="{ width: '35rem' }">
      <Card v-if="eventOnDay" style="width: 30rem; overflow: hidden">
          <template #title>
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
            <span>
              <Tag :value="eventOnDay.status" :severity="getStatusLabel(eventOnDay.status)" />
            </span>
          </template>
          <template #subtitle>
            <NuxtLink :to="eventOnDay.location_url" target="_blank">{{ eventOnDay.location_address }}</NuxtLink>
          </template>
          <template #content>
              <p class="m-0">{{ eventOnDay.notes }}</p>
          </template>
          <template #footer>
              <div class="flex gap-4 mt-1">
                  <Button label="Edit" severity="secondary" outlined class="w-full" />
                  <Button label="Delete" severity="danger" class="w-full" />
              </div>
          </template>
      </Card>
      <Card v-else style="width: 30rem; overflow: hidden">
        <template #title>
          New Event
        </template>
        <template #content>
          <Fluid>
            <div>
              <div class="flex-auto">
                <FloatLabel variant="on" class="my-4">
                  <DatePicker id="new-event-start" v-model="newEventStart" timeOnly fluid />
                  <label for="new-event-start" class="block mb-2"> Start Time</label>
                </FloatLabel>
              </div>
              <div class="flex-auto">
                <FloatLabel variant="on" class="my-4">
                  <label for="new-event-end" class="block mb-2"> End Time</label>
                  <DatePicker id="new-event-end" v-model="newEventEnd" timeOnly fluid />
                </FloatLabel>
              </div>
              <div class="flex-auto">
                  <FloatLabel variant="on" class="my-4">
                      <Textarea id="notes" v-model="notes" rows="3" />
                      <label for="notes">Notes for Vendor</label>
                  </FloatLabel>
              </div>
            </div>
          </Fluid>
        </template>
        <template #footer>
            <div class="flex gap-4 mt-1">
                <Button @click="addEvent" label="Add Event" severity="success" class="w-full" />
            </div>
        </template>
      </Card>
    </Dialog>

    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />

    <v-snackbar
      v-model="snackbar"
      timeout="6000"
    >
      {{ snacktext }}

      <template v-slot:actions>
        <v-btn
          color="#000022"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import { v4 } from 'uuid'
  const supabase      = useSupabaseClient()
  const props         = defineProps(['id'])
  const idParam       = ref(props.id)

  const eventStore    = useEventStore()
  const merchantStore = useMerchantStore()

  const merchant      = ref(await merchantStore.getMerchantById(idParam.value))
  const events        = ref(await eventStore.getEventsByMerchantId(idParam.value))
  const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
  businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

  const notes         = ref(merchant.value.notes)
  const dayViewDialog = ref(false)
  const dayId         = ref()
  const dayDate       = ref()
  const eventOnDay    = ref()

  const snackbar      = ref(false)
  const snacktext     = ref('')
  const errType       = ref()
  const errMsg        = ref()
  const errDialog     = ref(false)

  const newEventStart = ref()
  const newEventEnd   = ref()

  const allOpenDates = computed(() => {
    const allOpenEvents = events.value.filter((e: any) => e.status === 'open')
    return allOpenEvents.map((e: any) => new Date(e.start))
  })
  const allBookedDates = computed(() => {
    const allBookedEvents = events.value.filter((e: any) => e.status === 'booked')
    return allBookedEvents.map((e: any) => new Date(e.start))
  })
  const allPendingDates = computed(() => {
    const allPendingEvents = events.value.filter((e: any) => e.status === 'pending')
    return allPendingEvents.map((e: any) => new Date(e.start))
  })

  const attributes = ref([
    {
      highlight: { fillMode: 'outline' },
      dates: new Date(),
    },
    {
      highlight: {
          color: 'blue',
          fillMode: 'light',
        },
      dates: allOpenDates.value
    },
    {
      highlight: {
          color: 'yellow',
          fillMode: 'light',
        },
      dates: allPendingDates.value
    },
    {
      highlight: {
          color: 'green',
          fillMode: 'light',
        },
      dates: allBookedDates.value
    }
  ]);

  
  const openDayView = (day: any) => {
    dayId.value = day.id
    dayDate.value = day.date
    eventOnDay.value = events.value
      .find((e: any) => new Date(e.start).toDateString() == new Date(day.date).toDateString())
    dayViewDialog.value = true
  }
  const getStatusLabel = (status: any) => {
      switch (status) {
          case 'open':
              return 'secondary';

          case 'pending':
              return 'warn';

          case 'booked':
              return 'success';

          case 'unfulfilled':
              return 'danger';
          
          case 'closed':
              return 'secondary';

          default:
              return null;
      }
  };
  const addEvent = async () => {
    const startHours = new Date(newEventStart.value).getHours()
    const endHours = new Date(newEventEnd.value).getHours()
    const day = dayDate.value
    const eventStart = day.setHours(startHours)
    const eventEnd = day.setHours(endHours)

    const evtObj = {
        id: v4(),
        created_at: new Date(),
        merchant: merchant.value.id,
        vendor: null,
        start: new Date(eventStart),
        end: new Date(eventEnd),
        day_id: dayId.value,
        location_coordinates: merchant.value.coordinates,
        location_address: merchant.value.formatted_address,
        location_url: merchant.value.address_url,
        status: 'open',
        vendor_rating: null,
        merchant_rating: null,
        vendor_comment: null,
        merchant_comment: null,
        notes: notes.value !== '' ? notes.value : merchant.value.notes
    }
    const { error } = await supabase.from('events').insert(evtObj)
    if (!error) await resetFields('created')
    else {
        errType.value = 'Event Creation'
        errMsg.value = error.message
        errDialog.value = true
    }
  }
  const resetFields = async (action: any) => {
      const { data: eventData } = await supabase.from('events').select()
      await eventStore.setAllEvents(eventData)
      events.value = await eventStore.getEventsByMerchantId(idParam.value)
      
      dayViewDialog.value = false

      snacktext.value = `Event ${action}!`
      snackbar.value = true

      newEventStart.value = ''
      newEventEnd.value = ''
}
  // const days = ref([])
  // const selectMultipleDays = (day: any) => {
  //   const idx = days.value.findIndex((d: any) => d.id === day.id);
  //   if (idx >= 0) {
  //     days.value.splice(idx, 1);
  //   } else {
  //     days.value.push({
  //       id: day.id,
  //       date: day.date,
  //     });
  //   }
  // }
</script>

<style scoped>

</style>