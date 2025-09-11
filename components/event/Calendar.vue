<template>
  <div>
    <FullCalendar :options="calendarOptions" />
  
    <!-- Event Details Dialog - Only show if there's an event -->
    <Dialog v-if="eventOnDay" :visible="dayViewDialog" @update:visible="dayViewDialog = $event" modal :header="new Date(dayDate).toLocaleDateString()" :style="{ width: '42rem' }">
      <!-- BOOKED EVENT -->
      <div v-if="eventOnDay.status !== 'pending'" class="space-y-4">
        <!-- Event Time and Status -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
          </h3>
          <Tag :value="eventOnDay.status" :severity="getStatusLabel(eventOnDay.status)" />
        </div>
        
        <!-- Location -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-400">Location</label>
          <NuxtLink :to="eventOnDay.location_url" target="_blank" class="text-orange-400 hover:text-orange-300 block">
            {{ eventOnDay.location_address }}
          </NuxtLink>
        </div>
        
        <!-- Notes -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-400">Notes</label>
          <p class="text-white">{{ eventOnDay.notes }}</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <Button label="Edit" severity="secondary" outlined class="flex-1" />
          <Button @click="promptDeletion" label="Delete" severity="danger" class="flex-1" />
        </div>
      </div>
      <!-- PENDING EVENT -->
      <div v-else class="space-y-4">
        <h3 class="text-lg font-semibold text-white">Pending Requests</h3>
        <DataTable :value="eventOnDay.pending_requests" tableStyle="width: 100%">
            <Column>
                <template v-slot:body="{ data }">
                    <NuxtImg :src="String(vendorData(data, 'avatar_url'))" :alt="String(vendorData(data, 'vendor_name'))" class="w-12 h-12 rounded-full object-cover" />
                </template>
            </Column>
            <Column header="Vendor">
              <template v-slot:body="{ data }">
                <div>
                  <div class="font-medium text-white">{{ vendorData(data, 'vendor_name') }}</div>
                  <div class="text-sm text-gray-400">{{ vendorData(data, 'vendor_description') }}</div>
                </div>
              </template>
            </Column>
            <Column header="Rating">
              <template v-slot:body="{ data }">
                <Rating :model-value="Number(vendorData(data, 'average_merchant_rating'))" />
              </template>
            </Column>
            <Column header="Action">
              <template v-slot:body="{ data }">
                <Button
                  v-tooltip.top="'Approve Vendor for Event'"
                  outlined
                  severity="success"
                  type="button"
                  icon="pi pi-check"
                  @click="approveRequest(data)"
                  :loading="loading">
                </Button>
              </template>
            </Column>
        </DataTable>
      </div>
    </Dialog>

    <!-- Event Create Dialog - Only show if there's NO event -->
    <EventCreate 
      v-if="merchant && !eventOnDay"
      :visible="dayViewDialog"
      @update:visible="dayViewDialog = $event"
      :merchant="merchant"
      :business-hours="businessHours"
      :pre-filled-date="dayDate"
      @event-created="onEventCreated"
    />

    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    <DeleteDialog v-if="deleteDialog" :visible="deleteDialog" :itemType="'event'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />

    <Toast group="main" position="bottom-center" @close="onClose" />
  </div>
</template>

<script lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { v4 } from 'uuid'
import { useToast } from 'primevue/usetoast'

export default {
  components: {
    FullCalendar
  },
  async setup() {
    const toast = useToast()
    const supabase      = useSupabaseClient()
    const userStore     = useUserStore()
    const eventStore    = useEventStore()
    const merchantStore = useMerchantStore()
    const vendorStore   = useVendorStore()

    const user          = ref(userStore.user)
    const merchant      = ref(await merchantStore.getMerchantById(user.value?.associated_merchant_id || ''))
    const vendors       = ref(await vendorStore.getAllVendors)

    const events        = computed(() => {
      return eventStore.allEvents
        .filter((e: any) => e.merchant === user.value?.associated_merchant_id)
        .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
    })
    const businessHours = ref(merchant.value ? JSON.parse(JSON.stringify((merchant.value.business_hours))) : [])
    businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

    const notes         = ref(merchant.value?.notes || '')
    const dayViewDialog = ref(false)
    const dayId         = ref()
    const dayDate       = ref()
    const eventOnDay    = ref()

    const errType       = ref()
    const errMsg        = ref()
    const errDialog     = ref(false)
    const deleteDialog  = ref(false)
    const loading       = ref(false)

    const refresh       = ref(0)

    // Generate event title based on status and data
    const getEventTitle = (event: any) => {
      const startTime = new Date(event.start).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
      const endTime = new Date(event.end).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })

      switch (event.status) {
        case 'open':
          return `${startTime}`
        case 'booked':
        case 'completed':
          const vendor = event.vendor ? vendors.value.find((v: any) => v.id === event.vendor) : null
          const vendorName = vendor?.vendor_name || 'Vendor'
          return vendorName
        case 'pending':
          return 'Pending Event'
        case 'closed':
          return `${startTime} - Closed`
        default:
          return `${startTime} Event`
      }
    }

    // Convert events to FullCalendar format
    const fullCalendarEvents = computed(() => {
      return events.value.map((event: any) => ({
        id: event.id,
        title: getEventTitle(event),
        start: event.start,
        end: event.end,
        backgroundColor: getEventColor(event.status),
        borderColor: getEventColor(event.status),
        textColor: '#fff',
        extendedProps: {
          status: event.status,
          notes: event.notes,
          location_address: event.location_address,
          location_url: event.location_url,
          pending_requests: event.pending_requests || [],
          vendor_name: event.vendor_name
        }
      }))
    })

    // Get event color based on status
    const getEventColor = (status: string) => {
      switch (status) {
        case 'open':
          return '#f97316' // orange (matches VCalendar)
        case 'pending':
          return '#eab308' // yellow (matches VCalendar)
        case 'booked':
          return '#22c55e' // green (matches VCalendar)
        case 'unfulfilled':
          return '#ef4444' // red
        case 'closed':
          return '#6b7280' // gray
        default:
          return '#3b82f6' // blue
      }
    }

    // Handle date click
    const handleDateClick = (arg: any) => {
      console.log('Date clicked:', arg.dateStr)
      console.log('Date object:', arg.date)
      dayId.value = arg.dateStr
      dayDate.value = arg.date
      
      // Check if there's an event on selected day
      eventOnDay.value = events.value
        .find((e: any) => new Date(e.start).toDateString() === new Date(arg.date).toDateString())

      console.log('Found event on date:', eventOnDay.value)
      console.log('dayDate set to:', dayDate.value)
      console.log('Setting dayViewDialog to true from date click')

      // Always open the main dialog - it will show appropriate content based on eventOnDay
      dayViewDialog.value = true
      console.log('dayViewDialog after date click:', dayViewDialog.value)
    }

    // Handle event click
    const handleEventClick = (arg: any) => {
      console.log('Event clicked:', arg.event)
      const event = arg.event
      const eventData = event.extendedProps
      
      dayId.value = event.id
      dayDate.value = event.start
      
      // Find the full event data
      eventOnDay.value = events.value.find((e: any) => e.id === event.id)
      
      console.log('Found event:', eventOnDay.value)
      console.log('Setting dayViewDialog to true')
      
      // Don't show create dialog for event clicks, just show the event details
      dayViewDialog.value = true
      
      console.log('dayViewDialog after setting:', dayViewDialog.value)
      
      // Force a re-render by updating the refresh counter
      refresh.value++
    }

    // Calendar options
    const calendarOptions = computed(() => {
      console.log('Calendar options computed, events:', fullCalendarEvents.value.length)
      return {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        },
        events: fullCalendarEvents.value,
        dateClick: handleDateClick,
        eventClick: handleEventClick,
        height: 'auto',
        dayMaxEvents: true,
        moreLinkClick: 'popover',
        eventDisplay: 'block',
        displayEventTime: false,
        displayEventEnd: false,
        dayCellClassNames: (arg: any) => {
          const today = new Date()
          const cellDate = new Date(arg.date)
          if (cellDate.toDateString() === today.toDateString()) {
            return ['today-highlight']
          }
          return []
        }
      }
    })

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
                return 'info';
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
    const vendorData = (id: any, field: string) => {
      const vendor = vendors.value.find((vendor: any) => vendor.id === id)
      return vendor?.[field as keyof typeof vendor] || ''
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

    return {
      calendarOptions,
      dayViewDialog,
      dayId,
      dayDate,
      eventOnDay,
      errType,
      errMsg,
      errDialog,
      deleteDialog,
      loading,
      refresh,
      merchant,
      businessHours,
      notes,
      getStatusLabel,
      onEventCreated,
      promptDeletion,
      confirmDelete,
      cancelDelete,
      resetFields,
      vendorData,
      approveRequest,
      onClose
    }
  }
}
</script>

<style scoped>
:deep(.fc-today) {
  background-color: rgba(251, 191, 36, 0.1) !important;
}

:deep(.today-highlight) {
  background-color: rgba(251, 191, 36, 0.1) !important;
}

:deep(.fc-event) {
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.fc-event-title) {
  font-weight: 600;
}

:deep(.fc-daygrid-event) {
  margin: 1px 2px;
}

:deep(.fc-daygrid-day-events) {
  margin-top: 1px;
}

:deep(.fc-daygrid-day-number) {
  font-weight: 500;
}

:deep(.fc-col-header-cell) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.fc-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.fc-button-primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

:deep(.fc-button-primary:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.fc-button-primary:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.fc-today-button) {
  background-color: #6b7280;
  border-color: #6b7280;
}

:deep(.fc-today-button:hover) {
  background-color: #4b5563;
  border-color: #4b5563;
}
</style>
