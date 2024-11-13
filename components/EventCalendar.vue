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
        <template #content>
          No event scheduled. Create one now...
        </template>
      </Card>
      <div v-else>No events scheduled. Add one now...</div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  const props         = defineProps(['id'])
  const idParam       = ref(props.id)

  const eventStore    = useEventStore()
  const merchantStore = useMerchantStore()

  const merchant      = ref(await merchantStore.getMerchantById(idParam.value))
  const events        = ref(await eventStore.getEventsByMerchantId(idParam.value))
  const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
  businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

  const date          = ref()
  const dayViewDialog = ref(false)
  const dayId         = ref()
  const dayDate       = ref()
  const eventOnDay    = ref()

  watch(date, (newVal) => {
      if (!newVal) console.log('new date: ', newVal)
  })

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