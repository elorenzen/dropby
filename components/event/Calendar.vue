<template>
  <div>
    <FullCalendar :options="calendarOptions" />
  
    <!-- Event Details Dialog - Only show if there's an event -->
    <Dialog v-if="eventOnDay" :visible="dayViewDialog" @update:visible="dayViewDialog = $event" modal :header="new Date(dayDate).toLocaleDateString()" :style="{ width: '42rem' }">
      <!-- MERCHANT VIEW - BOOKED EVENT -->
      <div v-if="userType === 'merchant' && (eventOnDay.status === 'booked' || eventOnDay.status === 'completed' || eventOnDay.status === 'closed')" class="space-y-4">
        <!-- Event Time and Status -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
          </h3>
          <Tag :value="eventOnDay.status" :severity="getStatusLabel(eventOnDay.status)" />
        </div>
        
        <!-- Vendor Info -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-400">Vendor</label>
          <div class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <NuxtImg 
              :src="getVendorProp(eventOnDay.vendor, 'avatar_url')" 
              :alt="getVendorProp(eventOnDay.vendor, 'vendor_name')" 
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p class="font-medium text-text-main">{{ getVendorProp(eventOnDay.vendor, 'vendor_name') }}</p>
              <p class="text-sm text-text-muted">{{ getVendorProp(eventOnDay.vendor, 'vendor_description') }}</p>
              <div class="flex items-center mt-1">
                <Rating :model-value="Number(getVendorProp(eventOnDay.vendor, 'average_merchant_rating'))" readonly :cancel="false" class="text-sm" />
                <span class="text-xs text-text-muted ml-2">({{ getVendorProp(eventOnDay.vendor, 'total_merchant_ratings') || 0 }} reviews)</span>
              </div>
            </div>
          </div>
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
      
      <!-- MERCHANT VIEW - PENDING EVENT -->
      <div v-else-if="userType === 'merchant' && eventOnDay.status === 'open' && eventOnDay.pending_requests && eventOnDay.pending_requests.length > 0" class="space-y-4">
        <!-- Event Details -->
        <div class="space-y-3">
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
        </div>
        
        <!-- Vendor Requests List -->
        <div class="space-y-3">
          <p class="text-sm font-medium text-orange-600 dark:text-orange-400">
            {{ eventOnDay.pending_requests?.length || 0 }} vendor{{ (eventOnDay.pending_requests?.length || 0) !== 1 ? 's' : '' }} requesting this event:
          </p>
          <div v-for="vendorId in eventOnDay.pending_requests" :key="vendorId" class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <div class="flex items-center gap-3">
              <NuxtImg 
                :src="getVendorProp(vendorId, 'avatar_url')" 
                :alt="getVendorProp(vendorId, 'vendor_name')" 
                class="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p class="font-medium text-text-main">{{ getVendorProp(vendorId, 'vendor_name') }}</p>
                <p class="text-sm text-text-muted">{{ getVendorProp(vendorId, 'vendor_description') }}</p>
                <div class="flex items-center mt-1">
                  <Rating :model-value="Number(getVendorProp(vendorId, 'average_merchant_rating'))" readonly :cancel="false" class="text-sm" />
                  <span class="text-xs text-text-muted ml-2">({{ getVendorProp(vendorId, 'total_merchant_ratings') || 0 }} reviews)</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button 
                @click="rejectRequest(vendorId)"
                label="Reject"
                severity="danger"
                outlined
                size="small"
                :loading="loadingRejection === vendorId"
              />
              <Button 
                @click="approveRequest(vendorId)"
                label="Approve"
                severity="success"
                size="small"
                :loading="loadingApproval === vendorId"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- MERCHANT VIEW - PAST DATE (NO EVENTS) -->
      <div v-else-if="userType === 'merchant' && !eventOnDay && dayDate && new Date(dayDate) < new Date(new Date().setHours(0,0,0,0))" class="space-y-4">
        <div class="text-center py-8">
          <i class="pi pi-calendar-times text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-semibold text-white mb-2">Past Date</h3>
          <p class="text-gray-400">You cannot create events for past dates.</p>
        </div>
      </div>
      
      <!-- MERCHANT VIEW - OPEN EVENT (NO PENDING REQUESTS) -->
      <div v-else-if="userType === 'merchant' && eventOnDay.status === 'open'" class="space-y-4">
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
      
      <!-- VENDOR VIEW - EVENT DETAILS -->
      <div v-else-if="userType === 'vendor'" class="space-y-4">
        <!-- Event Time and Status -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
          </h3>
          <Tag :value="getVendorStatusLabel(eventOnDay)" :severity="getVendorStatusSeverity(eventOnDay)" />
        </div>
        
        <!-- Merchant Info -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-400">Establishment</label>
          <p class="text-white">{{ getMerchantName(eventOnDay.merchant) }}</p>
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
        
        <!-- Action Buttons for Vendor -->
        <div class="flex gap-3 pt-4">
          <!-- Show Request Event button only if:
               1. Event is open
               2. Event hasn't started yet
               3. Vendor hasn't already requested it
               4. Event isn't completed -->
          <Button 
            v-if="eventOnDay.status === 'open' && 
                  new Date(eventOnDay.start) > new Date() && 
                  (!eventOnDay.pending_requests || !eventOnDay.pending_requests.includes(vendor?.id)) &&
                  eventOnDay.status !== 'completed'"
            label="Request Event" 
            severity="success" 
            class="flex-1" 
            @click="requestEvent"
            :loading="loading"
          />
          
          <!-- Show Cancel Request button only if:
               1. Vendor has pending request
               2. Event hasn't been booked with this vendor yet -->
          <Button 
            v-else-if="eventOnDay.pending_requests && 
                      eventOnDay.pending_requests.includes(vendor?.id) &&
                      eventOnDay.vendor !== vendor?.id"
            label="Cancel Request" 
            severity="danger" 
            outlined
            class="flex-1" 
            @click="cancelRequest"
            :loading="loading"
          />
          
          <!-- Show disabled message for past events -->
          <div 
            v-else-if="eventOnDay.status === 'open' && new Date(eventOnDay.start) <= new Date()"
            class="flex-1 text-center text-gray-400 text-sm py-2"
          >
            Event has already started
          </div>
          
          <!-- Show disabled message for completed events -->
          <div 
            v-else-if="eventOnDay.status === 'completed'"
            class="flex-1 text-center text-gray-400 text-sm py-2"
          >
            Event completed
          </div>
          
          <!-- Show disabled message for booked events -->
          <div 
            v-else-if="eventOnDay.status === 'booked' && eventOnDay.vendor === vendor?.id"
            class="flex-1 text-center text-green-400 text-sm py-2"
          >
            Event confirmed
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Event Create Dialog - Only show for merchants if there's NO event and day is not in the past -->
    <EventCreate 
      v-if="userType === 'merchant' && merchant && !eventOnDay && dayDate && new Date(dayDate) >= new Date(new Date().setHours(0,0,0,0))"
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
  props: {
    userType: {
      type: String,
      default: 'merchant',
      validator: (value: string) => ['merchant', 'vendor'].includes(value)
    },
    vendor: {
      type: Object,
      default: null
    }
  },
  async setup(props: any) {
    const toast = useToast()
    const supabase      = useSupabaseClient()
    const userStore     = useUserStore()
    const eventStore    = useEventStore()
    const merchantStore = useMerchantStore()
    const vendorStore   = useVendorStore()

    const user          = ref(userStore.user)
    const merchant      = ref(props.userType === 'merchant' ? await merchantStore.getMerchantById(user.value?.associated_merchant_id || '') : null)
    const vendors       = ref(await vendorStore.getAllVendors)
    const merchants     = ref(await merchantStore.getAllMerchants)

    const events        = computed(() => {
      if (props.userType === 'merchant') {
        return eventStore.allEvents
          .filter((e: any) => e.merchant === user.value?.associated_merchant_id)
          .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
      } else {
        // For vendors, show all events they can see (open events + their booked events)
        const allEvents = eventStore.allEvents
        const vendorEvents = allEvents.filter((e: any) => e.vendor === props.vendor?.id)
        const openEvents = allEvents.filter((e: any) => e.status === 'open')
        return [...vendorEvents, ...openEvents]
          .filter((event, index, self) => self.findIndex(e => e.id === event.id) === index) // Remove duplicates
          .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
      }
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
    const loadingApproval = ref('')
    const loadingRejection = ref('')

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

      if (props.userType === 'merchant') {
        switch (event.status) {
          case 'open':
            // Only show "Pending Event" if status is open AND has pending requests
            if (event.pending_requests && event.pending_requests.length > 0) {
              return 'Pending Event'
            }
            return `${startTime}`
          case 'booked':
          case 'completed':
            const vendor = event.vendor ? vendors.value.find((v: any) => v.id === event.vendor) : null
            const vendorName = vendor?.vendor_name || 'Vendor'
            return vendorName
          case 'closed':
            return `${startTime} - Closed`
          default:
            return `${startTime} Event`
        }
      } else {
        // Vendor view
        switch (event.status) {
          case 'open':
            const merchant = event.merchant ? merchants.value.find((m: any) => m.id === event.merchant) : null
            const merchantName = merchant?.merchant_name || 'Establishment'
            return `${startTime} - ${merchantName}`
          case 'booked':
          case 'completed':
            return `${startTime} - Booked`
          case 'pending':
            return 'Pending Event'
          case 'closed':
            return `${startTime} - Closed`
          default:
            return `${startTime} Event`
        }
      }
    }

    // Convert events to FullCalendar format
    const fullCalendarEvents = computed(() => {
      return events.value.map((event: any) => ({
        id: event.id,
        title: getEventTitle(event),
        start: event.start,
        end: event.end,
        backgroundColor: getEventColor(event),
        borderColor: getEventColor(event),
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
    const getEventColor = (event: any) => {
      switch (event.status) {
        case 'open':
          // Only show yellow for pending requests if status is open
          if (props.userType === 'merchant' && event.pending_requests && event.pending_requests.length > 0) {
            return '#eab308' // yellow for pending requests
          }
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

    const getVendorProp = (vendorId: string, prop: string): string => {
      const vendor = vendors.value.find((v: any) => v.id === vendorId)
      return String(vendor?.[prop as keyof typeof vendor] || '')
    }
    const approveRequest = async (vendorId: string) => {
        loadingApproval.value = vendorId
        try {
            const eventStore = useEventStore()
            const updates = {
                status: 'booked' as const,
                vendor: vendorId
            }
            await eventStore.updateEvent(eventOnDay.value.id, updates)
            
            await useFetch(`/api/sendBookingConfirmation?eventId=${eventOnDay.value.id}&vendorId=${vendorId}&merchantId=${user.value?.associated_merchant_id}`)
            await resetFields('approved')
        } catch (error: any) {
            errType.value = 'Event Approval'
            errMsg.value = error.message
            errDialog.value = true
        } finally {
            loadingApproval.value = ''
        }
    }

    const rejectRequest = async (vendorId: string) => {
        loadingRejection.value = vendorId
        try {
            const eventStore = useEventStore()
            let reqArr = eventOnDay.value.pending_requests || []
            reqArr = reqArr.filter((id: any) => id !== vendorId)
            
            const updates = {
                updated_at: new Date().toISOString(),
                pending_requests: reqArr
            }
            
            await eventStore.updateEvent(eventOnDay.value.id, updates)
            await resetFields('rejected')
        } catch (error: any) {
            errType.value = 'Event Rejection'
            errMsg.value = error.message
            errDialog.value = true
        } finally {
            loadingRejection.value = ''
        }
    }
    // Vendor-specific helper functions
    const getMerchantName = (merchantId: string) => {
      const merchant = merchants.value.find((m: any) => m.id === merchantId)
      return merchant?.merchant_name || 'Establishment'
    }

    const getVendorStatusLabel = (event: any) => {
      if (event.status === 'booked' && event.vendor === props.vendor?.id) {
        return 'BOOKED'
      } else if (event.pending_requests && event.pending_requests.includes(props.vendor?.id)) {
        return 'PENDING'
      } else if (event.status === 'open') {
        return 'AVAILABLE'
      }
      return event.status.toUpperCase()
    }

    const getVendorStatusSeverity = (event: any) => {
      if (event.status === 'booked' && event.vendor === props.vendor?.id) {
        return 'success'
      } else if (event.pending_requests && event.pending_requests.includes(props.vendor?.id)) {
        return 'warn'
      } else if (event.status === 'open') {
        return 'info'
      }
      return 'secondary'
    }

    const requestEvent = async () => {
      if (!props.vendor?.id || !eventOnDay.value) return
      
      loading.value = true
      try {
        // Check usage limit before allowing request
        const usageCheck = await $fetch('/api/usage/check', {
          method: 'POST',
          body: {
            businessId: props.vendor.id,
            businessType: 'vendor',
            usageType: 'requests',
            requiredAmount: 1
          }
        }) as any

        if (!usageCheck.allowed) {
          toast.add({
            severity: 'warn',
            summary: 'Usage Limit Reached',
            detail: `You've reached your monthly limit of ${usageCheck.usageLimit} event requests. Upgrade your plan to request unlimited events.`,
            life: 5000
          })
          return
        }

        let reqArr = eventOnDay.value.pending_requests || []
        reqArr.push(props.vendor.id)
        
        const updates = {
          updated_at: new Date().toISOString(),
          pending_requests: reqArr
        }
        
        await eventStore.updateEvent(eventOnDay.value.id, updates)
        
        // Increment usage after successful request
        await $fetch('/api/usage/increment', {
          method: 'POST',
          body: {
            businessId: props.vendor.id,
            businessType: 'vendor',
            usageType: 'requests',
            incrementAmount: 1
          }
        })

        // Send notification to merchant
        try {
          await $fetch(`/api/sendEventRequestNotification?eventId=${eventOnDay.value.id}&vendorId=${props.vendor.id}&merchantId=${eventOnDay.value.merchant}`)
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr)
        }
        
        await resetFields('requested')
      } catch (error: any) {
        errType.value = 'Event Request'
        errMsg.value = error.message || 'Failed to request event'
        errDialog.value = true
      } finally {
        loading.value = false
      }
    }

    const cancelRequest = async () => {
      if (!props.vendor?.id || !eventOnDay.value) return
      
      loading.value = true
      try {
        let reqArr = eventOnDay.value.pending_requests || []
        reqArr = reqArr.filter((id: any) => id !== props.vendor.id)
        
        const updates = {
          updated_at: new Date().toISOString(),
          pending_requests: reqArr
        }
        
        await eventStore.updateEvent(eventOnDay.value.id, updates)
        await resetFields('cancelled')
      } catch (error: any) {
        errType.value = 'Event Request'
        errMsg.value = error.message || 'Failed to cancel request'
        errDialog.value = true
      } finally {
        loading.value = false
      }
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
      loadingApproval,
      loadingRejection,
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
      getVendorProp,
      approveRequest,
      rejectRequest,
      onClose,
      // Vendor-specific functions
      getMerchantName,
      getVendorStatusLabel,
      getVendorStatusSeverity,
      requestEvent,
      cancelRequest
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
