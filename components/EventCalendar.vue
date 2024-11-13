<template>
  <VCalendar is-dark expanded :attributes="attributes" />
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

  const attributes = ref([
    {
      highlight: 'blue',
      dates: new Date(),
    },
    {
      highlight: 'gray',
      dates: allOpenDates.value
    },
    {
      highlight: 'yellow',
      dates: allPendingDates.value
    },
    {
      highlight: 'green',
      dates: allBookedDates.value
    }
  ]);
</script>

<style scoped>

</style>