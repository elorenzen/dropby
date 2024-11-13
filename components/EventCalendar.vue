<template>
  <div>
    <VCalendar is-dark expanded :attributes="attributes" @dayclick="openDayView" />
    <Dialog v-model:visible="dayViewDialog" modal :header="dayId" :style="{ width: '25rem' }">
      {{ dayDate }}    
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps(['id'])
  const idParam = ref(props.id)
  const eventStore = useEventStore()
  const merchantStore = useMerchantStore()
  const merchant = ref(await merchantStore.getMerchantById(idParam.value))
  const events = ref(await eventStore.getEventsByMerchantId(idParam.value))
  const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
  businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

  const date = ref()

  const allOpenDates = computed(() => {
    const allOpenEvents = events.value.filter(e => e.status === 'open')
    return allOpenEvents.map(e => new Date(e.start))
  })
  const allBookedDates = computed(() => {
    const allBookedEvents = events.value.filter(e => e.status === 'booked')
    return allBookedEvents.map(e => new Date(e.start))
  })
  const allPendingDates = computed(() => {
    const allPendingEvents = events.value.filter(e => e.status === 'pending')
    return allPendingEvents.map(e => new Date(e.start))
  })
  
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

  const dayViewDialog = ref(false)

  const attributes = ref([
    {
      highlight: { fillMode: 'outline' },
      dates: new Date(),
    },
    {
      highlight: {
          color: 'gray',
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
  watch(date, (newVal) => {
      if (!newVal) console.log('new date: ', newVal)
  })
  const dayId = ref()
  const dayDate = ref()
  const openDayView = (day: any) => {
    dayViewDialog.value = true
    dayId.value = day.id
    dayDate.value = day.date
    console.log('day.id: ', day.id)
    console.log('day.date: ', day.date)
  }
</script>

<style scoped>

</style>