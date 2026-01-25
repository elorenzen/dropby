<template>
  <div>
    <FullCalendar :options="calendarOptions" />
  
    <!-- Multiple Events List Dialog - Show when there are 3+ events on a day -->
    <Dialog v-if="eventsOnDay && eventsOnDay.length >= 3" :visible="multipleEventsDialog" @update:visible="(val) => { multipleEventsDialog = val; if (!val) dayViewDialog = false; }" modal :header="new Date(dayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })" :style="{ width: '90vw', maxWidth: '600px' }">
      <div class="space-y-4">
        <p class="text-text-muted mb-4">
          {{ eventsOnDay.length }} event{{ eventsOnDay.length !== 1 ? 's' : '' }} on this day:
        </p>
        
        <div class="space-y-3 max-h-[60vh] overflow-y-auto">
          <Card 
            v-for="event in eventsOnDay" 
            :key="event.id"
            class="event-list-item"
          >
            <template #content>
              <div class="space-y-3">
                <!-- Event Time and Status -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-text-main">
                      {{ new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }} - 
                      {{ new Date(event.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }}
                    </p>
                    <p class="text-sm text-text-muted mt-1">
                      {{ userType === 'merchant' ? getVendorProp(event.vendor, 'vendor_name') || 'Open Event' : getMerchantProp(event.merchant, 'merchant_name') || 'Establishment' }}
                    </p>
                  </div>
                  <Tag :value="userType === 'vendor' ? getVendorStatusLabel(event) : event.status.toUpperCase()" :severity="userType === 'vendor' ? getVendorStatusSeverity(event) : getStatusLabel(event)" />
                </div>
                
                <!-- Location -->
                <div v-if="event.location_address" class="flex items-center gap-2 text-sm text-text-muted">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ event.location_address }}</span>
                </div>
                
                <!-- Notes -->
                <div v-if="event.notes" class="text-sm text-text-muted">
                  <i class="pi pi-file-edit mr-2"></i>
                  {{ event.notes }}
                </div>
                
                <!-- Action Buttons for Vendor -->
                <div v-if="userType === 'vendor'" class="pt-2">
                  <Button 
                    v-if="event.status === 'open' && 
                          new Date(event.start) > new Date() && 
                          (!event.pending_requests || !event.pending_requests.includes(vendor?.id)) &&
                          event.status !== 'completed'"
                    label="Request Event" 
                    severity="success" 
                    size="small"
                    @click="requestEventFromList(event)"
                    :loading="loadingRequest === event.id"
                  />
                  
                  <Button 
                    v-else-if="event.pending_requests && 
                              event.pending_requests.includes(vendor?.id) &&
                              event.vendor !== vendor?.id"
                    label="Cancel Request" 
                    severity="danger" 
                    outlined
                    size="small"
                    @click="cancelRequestFromList(event)"
                    :loading="loadingRequest === event.id"
                  />
                  
                  <div 
                    v-else-if="event.status === 'booked' && event.vendor === vendor?.id"
                    class="text-sm text-success"
                  >
                    <i class="pi pi-check-circle mr-1"></i>
                    Event confirmed
                  </div>
                </div>
                
                <!-- Action Buttons for Merchant -->
                <div v-if="userType === 'merchant'" class="pt-2 flex gap-2">
                  <Button 
                    label="View Details" 
                    severity="secondary" 
                    outlined
                    size="small"
                    @click="viewEventDetails(event)"
                  />
                  <Button 
                    v-if="event.status === 'open'"
                    label="Delete" 
                    severity="danger" 
                    outlined
                    size="small"
                    @click="deleteEventFromList(event)"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </Dialog>

    <!-- Event Details Dialog - Only show if there's a single event -->
    <Dialog v-if="eventOnDay && (!eventsOnDay || eventsOnDay.length < 3)" :visible="dayViewDialog && !multipleEventsDialog" @update:visible="(val) => { dayViewDialog = val; if (!val) multipleEventsDialog = false; }" modal :header="new Date(dayDate).toLocaleDateString()" :style="{ width: '42rem' }">
      <!-- MERCHANT VIEW - BOOKED EVENT -->
      <div v-if="userType === 'merchant' && (eventOnDay.status === 'booked' || eventOnDay.status === 'completed' || eventOnDay.status === 'closed')" class="space-y-4">
        <!-- Event Time and Status -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
          </h3>
          <Tag :value="eventOnDay.status" :severity="getStatusLabel(eventOnDay.status)" />
        </div>
        
        <!-- Vendor Info -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Vendor</label>
          <div class="flex items-center gap-3 p-3 bg-success-light rounded-lg border border-success-light">
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
          <label class="text-sm font-medium text-md-gray">Location</label>
          <NuxtLink :to="eventOnDay.location_url" target="_blank" class="text-primary hover:text-primary-dark block">
            {{ eventOnDay.location_address }}
          </NuxtLink>
        </div>
        
        <!-- Notes -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Notes</label>
          <p class="text-color">{{ eventOnDay.notes }}</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <Button @click="promptDeletion" label="Delete" severity="danger" class="flex-1" />
        </div>
      </div>
      
      <!-- MERCHANT VIEW - PENDING EVENT -->
      <div v-else-if="userType === 'merchant' && eventOnDay.status === 'open' && eventOnDay.pending_requests && eventOnDay.pending_requests.length > 0" class="space-y-4">
        <!-- Event Details -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-color">
              {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
            </h3>
            <Tag :value="eventOnDay.status" :severity="getStatusLabel(eventOnDay.status)" />
          </div>
          
          <!-- Location -->
          <div class="space-y-1">
            <label class="text-sm font-medium text-md-gray">Location</label>
            <NuxtLink :to="eventOnDay.location_url" target="_blank" class="text-primary hover:text-primary-dark block">
              {{ eventOnDay.location_address }}
            </NuxtLink>
          </div>
          
          <!-- Notes -->
          <div class="space-y-1">
            <label class="text-sm font-medium text-md-gray">Notes</label>
            <p class="text-color">{{ eventOnDay.notes }}</p>
          </div>
        </div>
        
        <!-- Vendor Requests List -->
        <div class="space-y-3">
          <p class="text-sm font-medium text-primary-dark">
            {{ eventOnDay.pending_requests?.length || 0 }} vendor{{ (eventOnDay.pending_requests?.length || 0) !== 1 ? 's' : '' }} requesting this event:
          </p>
          <div v-for="vendorId in eventOnDay.pending_requests" :key="vendorId" class="flex items-center justify-between p-3 bg-primary-light rounded-lg border border-primary-light">
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
            <i class="pi pi-calendar-times text-4xl text-md-gray mb-4"></i>
          <h3 class="text-lg font-semibold text-color mb-2">Past Date</h3>
          <p class="text-md-gray">You cannot create events for past dates.</p>
        </div>
      </div>
      
      <!-- MERCHANT VIEW - OPEN EVENT (NO PENDING REQUESTS) -->
      <div v-else-if="userType === 'merchant' && eventOnDay.status === 'open'" class="space-y-4">
        <!-- Event Time and Status -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
          </h3>
          <Tag :value="eventOnDay.status" :severity="getStatusLabel(eventOnDay.status)" />
        </div>
        
        <!-- Location -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Location</label>
          <NuxtLink :to="eventOnDay.location_url" target="_blank" class="text-primary hover:text-primary-dark block">
            {{ eventOnDay.location_address }}
          </NuxtLink>
        </div>
        
        <!-- Notes -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Notes</label>
          <p class="text-color">{{ eventOnDay.notes }}</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <Button @click="promptDeletion" label="Delete" severity="danger" class="flex-1" />
        </div>
      </div>
      
      <!-- VENDOR VIEW - EVENT DETAILS -->
      <div v-else-if="userType === 'vendor'" class="space-y-4">
        <!-- Event Time and Status -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">
            {{ new Date(eventOnDay.start).toLocaleTimeString('en-US') }} - {{ new Date(eventOnDay.end).toLocaleTimeString('en-US') }}
          </h3>
          <Tag :value="getVendorStatusLabel(eventOnDay)" :severity="getVendorStatusSeverity(eventOnDay)" />
        </div>
        
        <!-- Merchant Info -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Establishment</label>
          <p class="text-white">{{ getMerchantProp(eventOnDay.merchant, 'merchant_name') || 'Establishment' }}</p>
        </div>
        
        <!-- Location -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Location</label>
          <NuxtLink :to="eventOnDay.location_url" target="_blank" class="text-primary hover:text-primary-dark block">
            {{ eventOnDay.location_address }}
          </NuxtLink>
        </div>
        
        <!-- Notes -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-md-gray">Notes</label>
          <p class="text-color">{{ eventOnDay.notes }}</p>
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
            class="flex-1 text-center text-md-gray text-sm py-2"
          >
            Event has already started
          </div>
          
          <!-- Show disabled message for completed events -->
          <div 
            v-else-if="eventOnDay.status === 'completed'"
            class="flex-1 text-center text-md-gray text-sm py-2"
          >
            Event completed
          </div>
          
          <!-- Show disabled message for booked events -->
          <div 
            v-else-if="eventOnDay.status === 'booked' && eventOnDay.vendor === vendor?.id"
            class="flex-1 text-center text-success text-sm py-2"
          >
            Event confirmed
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-if="usageLimitReached" :visible="usageLimitReached" @update:visible="usageLimitReached = $event" modal :style="{ width: '32rem' }">
      <template #header>
        <div class="flex items-center gap-3">
          <span class="text-xl font-semibold">Monthly Limit Exceeded</span>
        </div>
      </template>
      
      <div class="space-y-6">
        <!-- Icon and message -->
        <div class="text-center space-y-3">
          <div class="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto">
            <i class="pi pi-ban text-primary text-2xl"></i>
          </div>
          <div>
            <p class="text-md-gray">
              You've used all <span class="font-semibold text-primary-dark">{{ usageLimitObject.usageLimit }}</span> 
              {{ usageLimitObject.usageType === 'requests' ? 'event requests' : 'event creations' }} 
              for this month. Choose an option below to continue.
            </p>
          </div>
          <!-- Additional info -->
          <div class="text-center">
            <p class="text-sm text-md-gray">
              Wait until next month for your limits to reset, or select from the options below to continue.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
          <Button 
            severity="warning" 
            class="w-full justify-center"
            @click="navigateTo(`/settings/${usageLimitObject.businessId}/?activeTab=4`)" 
          >
            <i class="pi pi-arrow-up text-white"></i>
            Upgrade Plan
          </Button>
          <Button 
            severity="success" 
            class="w-full justify-center"
            @click="handlePayment"
            v-tooltip="{
              value: `Event: $${usageLimitObject.feeBreakdown?.baseAmount.toFixed(2)}<br/>Platform Fee: $${usageLimitObject.feeBreakdown?.platformFee.toFixed(2)}<br/>Processing Fee: $${usageLimitObject.feeBreakdown?.processingFee.toFixed(2)}<br/><strong>Total: $${usageLimitObject.feeBreakdown?.totalAmount.toFixed(2)}</strong>`,
              escape: false,
              showDelay: 500
            }"
          >
            <i class="pi pi-credit-card text-white"></i>
            Request Event for ${{ usageLimitObject.oneTimeFee.toFixed(2) }}
          </Button>
      </template>
    </Dialog>

    <!-- One-Time Payment Component -->
    <OneTimePayment
      v-if="usageLimitObject"
      :business-id="usageLimitObject.businessId"
      :business-type="usageLimitObject.businessType"
      :action-type="usageLimitObject.usageType"
      :current-usage="usageLimitObject.currentUsage"
      :limit="usageLimitObject.usageLimit"
      :one-time-fee="usageLimitObject.feeBreakdown?.baseAmount || 0"
      :show-payment-dialog="showPaymentDialog"
      @payment-success="handlePaymentSuccess"
      @subscription-upgraded="handleSubscriptionUpgraded"
      @payment-dialog-closed="handlePaymentDialogClosed"
    />

    <!-- Event Create Dialog - Only show for merchants if there's NO event and day is not in the past -->
    <EventCreate 
      v-if="userType === 'merchant' && merchant && !eventOnDay && dayDate && new Date(dayDate) >= new Date(new Date().setHours(0,0,0,0))"
      :visible="dayViewDialog"
      @update:visible="dayViewDialog = $event"
      :merchant="merchant"
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
import OneTimePayment from '~/components/OneTimePayment.vue'
import { v4 } from 'uuid'
import { useToast } from '~/composables/useToast'

export default {
  components: {
    FullCalendar,
    OneTimePayment
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
    const { showToast } = useToast()
    const supabase      = useSupabaseClient()
    const userStore     = useUserStore()
    const eventStore    = useEventStore()
    const merchantStore = useMerchantStore()
    const vendorStore   = useVendorStore()
    const businessHoursStore = useBusinessHoursStore()

    const user          = ref(userStore.user)
    const merchant      = ref(props.userType === 'merchant' ? await merchantStore.getMerchantById(user.value?.associated_merchant_id || '') : null)
    
    // Load vendors if store is empty
    if (vendorStore.allVendors.length === 0) {
      await vendorStore.loadVendors()
    }
    
    const vendor        = ref(props.userType === 'vendor' ? await vendorStore.getVendorById(user.value?.associated_vendor_id || '') : null)
    const vendors       = ref(await vendorStore.getAllVendors)
    const merchants     = ref(await merchantStore.getAllMerchants)

    // Business hours are loaded in app.vue, just use getters

    // Load events if store is empty
    if (eventStore.allEvents.length === 0) {
      await eventStore.loadEvents()
    }

    const events        = computed(() => {
      if (props.userType === 'merchant') {
        return eventStore.allEvents
          .filter((e: any) => e.merchant === user.value?.associated_merchant_id)
          .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
      } else {
        // For vendors, show all events they can see (open events + their booked events)
        const allEvents = eventStore.allEvents
        const vendorEvents = allEvents.filter((e: any) => e.vendor === vendor.value?.id)
        const openEvents = allEvents.filter((e: any) => e.status === 'open')
        return [...vendorEvents, ...openEvents]
          .filter((event, index, self) => self.findIndex(e => e.id === event.id) === index) // Remove duplicates
          .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
      }
    })

    const notes         = ref(merchant.value?.notes || '')
    const dayViewDialog = ref(false)
    const multipleEventsDialog = ref(false)
    const eventsOnDay = ref<any[]>([])
    const usageLimitReached = ref(false)
    const usageLimitObject = ref()
    const showPaymentDialog = ref(false)
    const dayId         = ref()
    const dayDate       = ref()
    const eventOnDay    = ref()
    const loadingRequest = ref<string | null>(null)

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

    // Group events by day and create summary events for days with 3+ events
    const fullCalendarEvents = computed(() => {
      // Group events by day
      const eventsByDay = new Map<string, any[]>()
      
      events.value.forEach((event: any) => {
        const dayKey = new Date(event.start).toDateString()
        if (!eventsByDay.has(dayKey)) {
          eventsByDay.set(dayKey, [])
        }
        eventsByDay.get(dayKey)!.push(event)
      })
      
      const calendarEvents: any[] = []
      
      eventsByDay.forEach((dayEvents, dayKey) => {
        if (dayEvents.length >= 3) {
          // Create a single summary event for days with 3+ events
          const firstEvent = dayEvents[0]
          calendarEvents.push({
            id: `summary-${dayKey}`,
            title: `${dayEvents.length} events`,
            start: firstEvent.start,
            end: firstEvent.end,
            backgroundColor: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            textColor: 'var(--p-text-color)',
            extendedProps: {
              isSummary: true,
              eventCount: dayEvents.length,
              allEvents: dayEvents.map((e: any) => ({
                id: e.id,
                status: e.status,
                notes: e.notes,
                location_address: e.location_address,
                location_url: e.location_url,
                pending_requests: e.pending_requests || [],
                vendor: e.vendor,
                merchant: e.merchant,
                start: e.start,
                end: e.end
              }))
            }
          })
        } else {
          // Show individual events for days with <3 events
          dayEvents.forEach((event: any) => {
            calendarEvents.push({
              id: event.id,
              title: getEventTitle(event),
              start: event.start,
              end: event.end,
              backgroundColor: getEventColor(event),
              borderColor: getEventColor(event),
              textColor: 'var(--p-text-color)',
              extendedProps: {
                status: event.status,
                notes: event.notes,
                location_address: event.location_address,
                location_url: event.location_url,
                pending_requests: event.pending_requests || [],
                vendor_name: event.vendor_name,
                isSummary: false
              }
            })
          })
        }
      })
      
      return calendarEvents
    })

    // Get event color based on status
    const getEventColor = (event: any) => {
      switch (event.status) {
        case 'open':
          // Only show yellow for pending requests if status is open
          if (props.userType === 'merchant' && event.pending_requests && event.pending_requests.length > 0) {
            return 'var(--warning-color)' // yellow for pending requests
          }
          return 'var(--primary-color)' // navy blue (matches new primary color)
        case 'pending':
          return 'var(--warning-color)' // yellow (matches VCalendar)
        case 'booked':
          return 'var(--success-color)' // green (matches VCalendar)
        case 'unfulfilled':
          return 'var(--error-color)' // red
        case 'closed':
          return 'var(--text-md-gray)' // gray
        default:
          return 'var(--primary-color)' // blue
      }
    }

    // Handle date click
    const handleDateClick = (arg: any) => {
      dayId.value = arg.dateStr
      dayDate.value = arg.date
      
      // Find all events on the selected day
      const dayEvents = events.value.filter((e: any) => 
        new Date(e.start).toDateString() === new Date(arg.date).toDateString()
      )
      
      if (dayEvents.length >= 3) {
        // Show multiple events dialog
        eventsOnDay.value = dayEvents.sort((a: any, b: any) => 
          new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        multipleEventsDialog.value = true
        dayViewDialog.value = false
      } else if (dayEvents.length === 1) {
        // Show single event dialog
        eventOnDay.value = dayEvents[0]
        eventsOnDay.value = []
        multipleEventsDialog.value = false
        dayViewDialog.value = true
      } else if (dayEvents.length === 2) {
        // For 2 events, show the first one (or could show list, but keeping simple for now)
        eventOnDay.value = dayEvents[0]
        eventsOnDay.value = []
        multipleEventsDialog.value = false
        dayViewDialog.value = true
      } else {
        // No events - show create dialog for merchants
        eventOnDay.value = null
        eventsOnDay.value = []
        multipleEventsDialog.value = false
        if (props.userType === 'merchant') {
          dayViewDialog.value = true
        }
      }
    }

    // Handle event click
    const handleEventClick = (arg: any) => {
      const event = arg.event
      const eventData = event.extendedProps
      
      // Check if this is a summary event (3+ events on a day)
      if (eventData.isSummary && eventData.allEvents) {
        dayDate.value = new Date(event.start)
        // Get full event data from events array
        eventsOnDay.value = eventData.allEvents
          .map((e: any) => events.value.find((ev: any) => ev.id === e.id))
          .filter(Boolean)
          .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
        multipleEventsDialog.value = true
        dayViewDialog.value = false
        return
      }
      
      // Single event click
      dayId.value = event.id
      dayDate.value = event.start
      
      // Find the full event data
      eventOnDay.value = events.value.find((e: any) => e.id === event.id)
      eventsOnDay.value = []
      multipleEventsDialog.value = false
      dayViewDialog.value = true
      
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
        dayMaxEvents: 2, // Show max 2 events, then show summary for 3+
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

    const getBusinessHour = (day: number, type: 'open' | 'close'): string => {
      if (!merchant.value?.id || props.userType !== 'merchant') {
        return type === 'open' ? '09:00' : '17:00'
      }
      return businessHoursStore.getBusinessHour(merchant.value.id, 'merchant', day, type)
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
        multipleEventsDialog.value = false
        showToast('success', 'Success', `Event ${action}!`, 6000)
        notes.value = ''
        refresh.value++
    }
    const vendorData = (id: any, field: string) => {
      const vendor = vendors.value.find((vendor: any) => vendor.id === id)
      return vendor?.[field as keyof typeof vendor] || ''
    }

    const getVendorProp = (vendorId: string, prop: string): string => {
      return vendorStore.getVendorProp(vendorId, prop)
    }

    const getMerchantProp = (merchantId: string | null, prop: string): string => {
      if (!merchantId) return ''
      return merchantStore.getMerchantProp(merchantId, prop)
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
            
            // Create timeline item for event booked
            const timelineStore = useTimelineStore()
            const vendorStore = useVendorStore()
            const vendor = await vendorStore.getVendorById(vendorId)
            await timelineStore.createTimelineItem({
              owner_id: user.value?.associated_merchant_id || '',
              other_ids: [eventOnDay.value.id, vendorId],
              title: 'Event Booked',
              description: `Approved ${vendor?.vendor_name || 'vendor'} for event on ${new Date(eventOnDay.value.start).toLocaleDateString()}`,
              type: 'event_booked'
            })
            
            // Create notification for vendor
            const notificationStore = useNotificationStore()
            const currentUser = useSupabaseUser()
            const vendorUserIds = await userStore.getUserIdsFromBusiness(vendorId, 'vendor')
            
            for (const vendorUserId of vendorUserIds) {
              try {
                await notificationStore.createNotification({
                  recipient_id: vendorUserId,
                  sender_id: currentUser.value?.id || null,
                  sender_business_id: user.value?.associated_merchant_id || null,
                  sender_business_type: 'merchant',
                  action_type: 'event_request_approved',
                  entity_type: 'event',
                  entity_id: eventOnDay.value.id,
                  title: 'Event Request Approved',
                  message: `${merchant.value?.merchant_name || 'A merchant'} approved your request for the event on ${new Date(eventOnDay.value.start).toLocaleDateString()}`,
                  metadata: {
                    event_id: eventOnDay.value.id,
                    merchant_id: user.value?.associated_merchant_id,
                    merchant_name: merchant.value?.merchant_name,
                    event_date: eventOnDay.value.start
                  }
                })
              } catch (notifError) {
                console.error('Failed to create notification for vendor user:', vendorUserId, notifError)
              }
            }
            
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

    const getVendorStatusLabel = (event: any) => {
      if (event.status === 'booked' && event.vendor === vendor.value?.id) {
        return 'BOOKED'
      } else if (event.pending_requests && event.pending_requests.includes(vendor.value?.id)) {
        return 'PENDING'
      } else if (event.status === 'open') {
        return 'AVAILABLE'
      }
      return event.status.toUpperCase()
    }

    const getVendorStatusSeverity = (event: any) => {
      if (event.status === 'booked' && event.vendor === vendor.value?.id) {
        return 'success'
      } else if (event.pending_requests && event.pending_requests.includes(vendor.value?.id)) {
        return 'warn'
      } else if (event.status === 'open') {
        return 'info'
      }
      return 'secondary'
    }

    const showUsageLimitReached = (object: any) => {
      dayViewDialog.value = false
      
      // Calculate one-time payment fees
      const baseAmount = object.businessType === 'vendor' ? 3.00 : 5.00 // $3 for vendors, $5 for merchants
      const platformFee = baseAmount * 0.08 // 8% platform fee
      const processingFee = (baseAmount * 0.029) + 0.30 // Stripe processing fee
      const totalAmount = baseAmount + platformFee + processingFee
      
      usageLimitObject.value = {
        ...object,
        oneTimeFee: totalAmount, // Show total amount to user
        feeBreakdown: {
          baseAmount,
          platformFee,
          processingFee,
          totalAmount
        }
      }
      usageLimitReached.value = true
    }

    const handlePayment = async () => {
      // Close the usage limit dialog and show the payment dialog
      usageLimitReached.value = false
      showPaymentDialog.value = true
    }

    // Handle payment success from OneTimePayment component
    const handlePaymentSuccess = () => {
      // Refresh the page or reload data to reflect the new usage
      window.location.reload()
    }

    // Handle subscription upgrade from OneTimePayment component
    const handleSubscriptionUpgraded = () => {
      // Refresh the page or reload data to reflect the new subscription
      window.location.reload()
    }

    // Handle payment dialog close
    const handlePaymentDialogClosed = () => {
      showPaymentDialog.value = false
    }

    const requestEvent = async () => {
      loading.value = true

      try {
        if (!vendor.value?.id || !eventOnDay.value) {
          throw new Error('Vendor or event information is missing')
        }
        
        const result = await eventStore.requestEvent(eventOnDay.value.id, vendor.value.id, { sendEmail: true })
        
        if (!result.success) {
          if (result.error === 'usage_limit') {
            showUsageLimitReached({ usageLimit: result.usageLimit })
          } else if (result.error === 'already_requested') {
            showToast('warn', 'Already Requested', 'You have already requested this event.')
          } else {
            errType.value = 'Event Request'
            errMsg.value = result.message || 'Failed to request event'
            errDialog.value = true
          }
          return
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
      if (!vendor.value?.id || !eventOnDay.value) return
      
      loading.value = true
      try {
        let reqArr = eventOnDay.value.pending_requests || []
        reqArr = reqArr.filter((id: any) => id !== vendor.value.id)
        
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

    // Request event from multiple events list
    const requestEventFromList = async (event: any) => {
      if (!vendor.value?.id || !event) return
      
      loadingRequest.value = event.id
      try {
        const result = await eventStore.requestEvent(event.id, vendor.value.id, { sendEmail: true })
        
        if (!result.success) {
          if (result.error === 'usage_limit') {
            showUsageLimitReached({ usageLimit: result.usageLimit })
          } else if (result.error === 'already_requested') {
            showToast('warn', 'Already Requested', 'You have already requested this event.')
          } else {
            errType.value = 'Event Request'
            errMsg.value = result.message || 'Failed to request event'
            errDialog.value = true
          }
          loadingRequest.value = null
          return
        }
        
        // Update the event in the list
        const eventIndex = eventsOnDay.value.findIndex((e: any) => e.id === event.id)
        if (eventIndex !== -1 && result.event) {
          eventsOnDay.value[eventIndex] = result.event
        }
        
        showToast('success', 'Request Sent', `Request sent for event on ${new Date(event.start).toLocaleDateString()}`)
        
        refresh.value++
      } catch (error: any) {
        errType.value = 'Event Request'
        errMsg.value = error.message || 'Failed to request event'
        errDialog.value = true
      } finally {
        loadingRequest.value = null
      }
    }

    // Cancel request from multiple events list
    const cancelRequestFromList = async (event: any) => {
      if (!vendor.value?.id || !event) return
      
      loadingRequest.value = event.id
      try {
        const result = await eventStore.withdrawRequest(event.id, vendor.value.id)
        
        if (!result.success) {
          errType.value = 'Event Request'
          errMsg.value = result.message || 'Failed to cancel request'
          errDialog.value = true
          loadingRequest.value = null
          return
        }
        
        // Update the event in the list
        const eventIndex = eventsOnDay.value.findIndex((e: any) => e.id === event.id)
        if (eventIndex !== -1 && result.event) {
          eventsOnDay.value[eventIndex] = result.event
        }
        
        showToast('info', 'Request Cancelled', `Request cancelled for event on ${new Date(event.start).toLocaleDateString()}`)
        
        refresh.value++
      } catch (error: any) {
        errType.value = 'Event Request'
        errMsg.value = error.message || 'Failed to cancel request'
        errDialog.value = true
      } finally {
        loadingRequest.value = null
      }
    }

    // View event details from list (for merchants)
    const viewEventDetails = (event: any) => {
      eventOnDay.value = event
      eventsOnDay.value = []
      multipleEventsDialog.value = false
      dayViewDialog.value = true
    }

    // Delete event from list (for merchants)
    const deleteEventFromList = async (event: any) => {
      eventOnDay.value = event
      promptDeletion()
    }

    const onClose = () => {
      // Toast closed functionality
    }

      return {
      calendarOptions,
      dayViewDialog,
      multipleEventsDialog,
      eventsOnDay,
      dayId,
      getMerchantProp,
      dayDate,
      eventOnDay,
      errType,
      errMsg,
      errDialog,
      deleteDialog,
      loading,
      loadingRequest,
      loadingApproval,
      loadingRejection,
      refresh,
      merchant,
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
      getVendorStatusLabel,
      getVendorStatusSeverity,
      requestEvent,
      cancelRequest,
      requestEventFromList,
      cancelRequestFromList,
      viewEventDetails,
      deleteEventFromList,
      // Usage limit dialog
      usageLimitReached,
      usageLimitObject,
      showPaymentDialog,
      showUsageLimitReached,
      handlePayment,
      handlePaymentSuccess,
      handleSubscriptionUpgraded,
      handlePaymentDialogClosed
    }
  },
  
  async mounted() {
    // Ensure events are loaded on mount
    const eventStore = useEventStore()
    if (eventStore.allEvents.length === 0) {
      await eventStore.loadEvents()
    }
  }
}
</script>

<style scoped>
:deep(.fc-today) {
  background-color: rgba(from var(--p-warn-color) r g b / 0.1) !important;
}

:deep(.today-highlight) {
  background-color: rgba(from var(--p-warn-color) r g b / 0.1) !important;
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
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
}

:deep(.fc-button-primary:hover) {
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
  opacity: 0.8;
}

:deep(.fc-button-primary:focus) {
  box-shadow: 0 0 0 2px rgba(from var(--p-primary-color) r g b / 0.2);
}

:deep(.fc-today-button) {
  background-color: #9ca3af;
  border-color: #9ca3af;
}

:deep(.fc-today-button:hover) {
  background-color: #9ca3af;
  border-color: #9ca3af;
  opacity: 0.8;
}

.event-list-item {
  transition: all 0.2s ease;
}

.event-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
