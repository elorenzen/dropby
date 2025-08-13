<template>
  <div>
    <VCalendar transparent is-dark expanded :attributes="attributes" @dayclick="openDayView" :key="refresh" />
    <Dialog v-model:visible="dayViewDialog" modal :header="new Date(dayDate).toLocaleDateString()" :style="{ width: '45rem' }">
      <!-- BOOKED EVENT -->
      <Card v-if="eventOnDay && eventOnDay.status !== 'pending'" style="width: 30rem; overflow: hidden">
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
                  <Button @click="promptDeletion" label="Delete" severity="danger" class="w-full" />
              </div>
          </template>
      </Card>
      <!-- PENDING EVENT -->
      <Card v-else-if="eventOnDay && eventOnDay.status === 'pending'" style="width: 40rem; overflow: hidden">
        <template #content>
          <DataTable :value="eventOnDay.pending_requests" tableStyle="width: 100%">
              <Column>
                  <template #body="{ data }">
                      <NuxtImg :src="vendorData(data, 'avatar_url')" :alt="vendorData(data, 'vendor_name')" class="w-30 rounded" />
                  </template>
              </Column>
              <template #header>
                  <div class="flex flex-wrap items-center justify-between gap-2">
                      <span class="text-xl font-bold">Pending Requests</span>
                  </div>
              </template>
              <Column header="Vendor" #body="{ data }">
                {{ vendorData(data, 'vendor_name') }}
                <p class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ vendorData(data, 'vendor_description') }}</p>
              </Column>
              <Column header="Rating" #body="{ data }">
                <Rating :model-value="vendorData(data, 'average_merchant_rating')" />
              </Column>
              <Column header="" #body="{ data }">
                <Button
                  v-tooltip.top="'Approve Vendor for Event'"
                  outlined
                  severity="success"
                  type="button"
                  icon="pi pi-check"
                  @click="approveRequest(data)"
                  :loading="loading">
                </Button>
              </Column>
          </DataTable>
        </template>
      </Card>
      <!-- NEW EVENT -->
      <EventCreate 
        v-model:visible="showCreateDialog"
        :merchant="merchant"
        :business-hours="businessHours"
        @event-created="onEventCreated"
      />
    </Dialog>

    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    <DeleteDialog v-if="deleteDialog" :itemType="'event'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />

    <Toast group="main" position="bottom-center" @close="onClose" />
  </div>
</template>

<script setup lang="ts">
  import { v4 } from 'uuid'
  import { useToast } from 'primevue/usetoast'
  const toast = useToast()
  const supabase      = useSupabaseClient()
  const userStore     = useUserStore()
  const eventStore    = useEventStore()
  const merchantStore = useMerchantStore()
  const vendorStore   = useVendorStore()

  const user          = ref(userStore.user)
  const merchant      = ref(await merchantStore.getMerchantById(user.value.associated_merchant_id))
  const vendors       = ref(await vendorStore.getAllVendors)

  const events        = computed(() => {
    return eventStore.allEvents
      .filter((e: any) => e.merchant === user.value.associated_merchant_id)
      .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
  })
  const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
  businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

  const notes         = ref(merchant.value.notes)
  const dayViewDialog = ref(false)
  const dayId         = ref()
  const dayDate       = ref()
  const eventOnDay    = ref()

  const errType       = ref()
  const errMsg        = ref()
  const errDialog     = ref(false)
  const deleteDialog  = ref(false)
  const loading       = ref(false)

  const showCreateDialog = ref(false)
  const refresh       = ref(0)

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
      highlight: {
        color: 'orange',
        fillMode: 'outline'
      },
      dates: new Date(),
    },
    {
      highlight: {
          color: 'orange',
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
    // date formatted
    dayId.value = day.id
    // date as Date()
    dayDate.value = day.date
    // checks if there's an event on selected day
    eventOnDay.value = events.value
      .find((e: any) => new Date(e.start).toDateString() == new Date(day.date).toDateString())

    // if there's no event on day, and selected day is in the future,
    // prompt user to add event. Then,
    // pre-populate 'add event' dialog start, end times
    // business hour values based on given day.
    if (
      !eventOnDay.value &&
      (new Date(day.date).getTime() > new Date().getTime()) &&
      businessHours.value.length > 0
    ) {
      showCreateDialog.value = true
    }
    dayViewDialog.value = true
  }
  const getBusinessHour = (day:number, type:any) => {
    const hours = businessHours.value
    switch (day) {
      case 0:
        return hours[6][type]
        break;
      case 1:
        return hours[0][type]
        break;
      case 2:
        return hours[1][type]
        break;
      case 3:
        return hours[2][type]
        break;
      case 4:
        return hours[3][type]
        break;
      case 5:
        return hours[4][type]
        break;
      case 6:
        return hours[5][type]
        break;
    }
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
  const onEventCreated = () => {
    refresh.value++
    dayViewDialog.value = false
  }

  const promptDeletion = () => { deleteDialog.value = true }
  const confirmDelete = async () => {
      const eventStore = useEventStore()
      try {
          await eventStore.deleteEvent(eventOnDay.value.id)
          await resetFields('deleted')
      } catch (error: any) {
          errType.value = 'Event Deletion'
          errMsg.value = error.message
          errDialog.value = true
      }
      deleteDialog.value = false
  }
  const cancelDelete = () => { deleteDialog.value = false }
  const resetFields = async (action: any) => {
      dayViewDialog.value = false
      toast.add({ severity: 'success', summary: 'Success', detail: `Event ${action}!`, group: 'main', life: 6000 })
      notes.value = ''
      refresh.value++
  }
  const vendorData = (id: any, field: any) => {
    const vendor = vendors.value.find(vendor => vendor.id === id)
    return vendor[field]
  }
  const approveRequest = async (id: any) => {
      loading.value = true
      try {
          const eventStore = useEventStore()
          const updates = {
              status: 'booked' as const,
              vendor: id
          }
          await eventStore.updateEvent(eventOnDay.value.id, updates)
          
          await useFetch(`/api/sendBookingConfirmation?eventId=${eventOnDay.value.id}&vendorId=${id}&merchantId=${user.value?.associated_merchant_id}`)
          await resetFields('approved')
      } catch (error: any) {
          errType.value = 'Event Approval'
          errMsg.value = error.message
          errDialog.value = true
      }

      loading.value = false
  }
  const onClose = () => {
    // Toast closed functionality
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