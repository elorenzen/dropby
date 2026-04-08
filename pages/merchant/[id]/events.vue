<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Events
          </h1>
          <p class="text-text-muted text-lg">
            Manage and view all events for {{ merchant?.name || 'your business' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Button 
            v-if="canCreateRecurringEvents"
            @click="viewRecurringEvents"
            label="Recurring Events"
            outlined
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- Pending Event Requests Card -->
    <Card class="mb-6 border-primary-light bg-primary-light">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
              <i class="pi pi-clock icon-primary"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-primary-dark">
                Pending Event Requests
              </h3>
              <p class="text-sm text-primary-dark">
                {{ pendingRequests.length }} event{{ pendingRequests.length !== 1 ? 's' : '' }} with pending requests
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="pendingRequests.length > 0" class="space-y-4">
          <div v-for="event in pendingRequests" :key="event.id" class="space-y-3">
            <div class="mb-4 pb-3 border-b border-primary-light">
              <p class="mb-1">Event on {{ new Date(event.start).toLocaleDateString() }}</p>
              <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
              <p class="text-xs text-text-muted">Location: {{ event.location_address || 'No address specified' }}</p>
              <p class="text-sm font-medium text-primary-dark mt-2">
                {{ event.pending_requests?.length || 0 }} vendor{{ (event.pending_requests?.length || 0) !== 1 ? 's' : '' }} requesting this event:
              </p>
            </div>
            
            <ReviewCard
              v-for="vendorId in event.pending_requests"
              :key="`${event.id}-${vendorId}`"
              :avatar="getVendorProp(vendorId, 'avatar_url')"
              :name="getVendorProp(vendorId, 'vendor_name')"
              :event-date="event.start"
              :event-time="`${new Date(event.start).toLocaleTimeString()} - ${new Date(event.end).toLocaleTimeString()}`"
              border-class="bg-primary-light border-primary-light"
            >
              <template #middle>
                <p class="text-sm text-text-muted">{{ getVendorProp(vendorId, 'vendor_description') || 'No description available' }}</p>
              </template>
              
              <template #actions>
                <Button 
                  @click="rejectRequest(event, vendorId)"
                  label="Reject"
                  severity="danger"
                  outlined
                  size="small"
                  :loading="loadingRejection === `${event.id}-${vendorId}`"
                />
                <Button 
                  @click="approveRequest(event, vendorId)"
                  label="Approve"
                  size="small"
                  :loading="loadingApproval === `${event.id}-${vendorId}`"
                />
              </template>
            </ReviewCard>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-primary-light mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-check-circle icon-primary text-2xl"></i>
          </div>
          <p class="text-primary-dark font-medium">No pending requests</p>
          <p class="text-sm text-primary-dark">All event requests have been processed</p>
        </div>
      </template>
    </Card>

    <!-- All Events Card -->
    <SearchAndFilter
      :has-active-filters="!!(eventFilters.keyword || (eventFilters.status && eventFilters.status.length > 0))"
      @clear-filters="clearEventFilters"
    >
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
            <i class="pi pi-calendar text-success"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-text-main">All Events</h3>
          </div>
        </div>
      </template>

      <template #subtitle>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-text-muted">Total events: {{ filteredEvents.length }} |</span>
          <span v-if="openEventsCount > 0" class="text-error font-medium">open: {{ openEventsCount }}</span>
          <span v-if="openEventsCount > 0 && bookedEventsCount > 0" class="text-text-muted">|</span>
          <span v-if="bookedEventsCount > 0" class="text-success font-medium">booked: {{ bookedEventsCount }}</span>
          <span v-if="(openEventsCount > 0 || bookedEventsCount > 0) && completedEventsCount > 0" class="text-text-muted">|</span>
          <span v-if="completedEventsCount > 0" class="text-success font-medium">completed: {{ completedEventsCount }}</span>
          <span v-if="(openEventsCount > 0 || bookedEventsCount > 0 || completedEventsCount > 0) && (cancelledEventsCount > 0 || closedEventsCount > 0)" class="text-text-muted">|</span>
          <span v-if="cancelledEventsCount > 0" class="text-warning font-medium">cancelled: {{ cancelledEventsCount }}</span>
          <span v-if="cancelledEventsCount > 0 && closedEventsCount > 0" class="text-text-muted">|</span>
          <span v-if="closedEventsCount > 0" class="text-md-gray font-medium">closed: {{ closedEventsCount }}</span>
        </div>
      </template>

      <template #actions>
        <Button 
          v-if="canCreateDateRangeEvents"
          @click="showCreateMultipleDialog = true"
          label="Create Multiple"
          icon="pi pi-calendar-plus"
          size="small"
        />
      </template>
          <template #search-bar>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-color-secondary"></i>
              </div>
              <InputText 
                v-model="eventFilters.keyword" 
                placeholder="Search by food truck name..."
                class="w-full pl-10 pr-4"
                size="small"
              />
            </div>
          </template>

          <template #filters>
            <div class="w-56">
              <FloatLabel>
                <AutoComplete
                  inputId="status-filter"
                  v-model="eventFilters.status"
                  multiple
                  fluid
                  dropdown
                  dropdownMode="blank"
                  completeOnFocus
                  :suggestions="statusFilterSuggestions"
                  optionLabel="label"
                  dataKey="value"
                  placeholder=" "
                  class="w-full"
                  size="small"
                  @complete="searchStatusFilter"
                />
                <label for="status-filter">Status</label>
              </FloatLabel>
            </div>
          </template>

          <template #sort-by>
            <div class="w-48">
              <FloatLabel>
                <Select 
                  id="sort-filter"
                  v-model="eventFilters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                  size="small"
                />
                <label for="sort-filter">Sort by</label>
              </FloatLabel>
            </div>
          </template>
        </SearchAndFilter>

    <div v-if="filteredEvents.length > 0" class="space-y-4 mt-6">
          <EventBaseListCard 
            v-for="event in filteredEvents" 
            :key="event.id"
            :show-status-badge="true"
          >
            <template #vendor-avatar>
              <!-- Show vendor info if event has a vendor -->
              <template v-if="event.vendor">
                <NuxtImg 
                  :src="getVendorProp(event.vendor, 'avatar_url')" 
                  :alt="getVendorProp(event.vendor, 'vendor_name')" 
                  class="w-12 h-12 rounded-full"
                />
              </template>
              
              <!-- Show no vendor message if event doesn't have a vendor -->
              <template v-else>
                <div class="w-12 h-12 rounded-full bg-surface-section flex items-center justify-center">
                  <i class="pi pi-truck text-md-gray"></i>
                </div>
              </template>
            </template>
            
            <template #event-content>
              <!-- Show vendor info if event has a vendor -->
              <template v-if="event.vendor">
                <p class="font-semibold text-text-main truncate mb-1">{{ getVendorProp(event.vendor, 'vendor_name') }}</p>
                <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <Tag v-for="cuisine in getVendorCuisines(event.vendor)" :key="cuisine" :value="cuisine" severity="info" size="small" />
                </div>
              </template>
              
              <!-- Show no vendor message if event doesn't have a vendor -->
              <template v-else>
                <p class="font-semibold text-text-main truncate mb-1">No Food Truck Booked</p>
                <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                <p v-if="event.status === 'open'" class="text-xs text-primary-dark mt-1">Waiting for food truck requests</p>
                <p v-else class="text-xs text-md-gray mt-1">Event was {{ event.status }} without a vendor</p>
              </template>
            </template>
            
            <template #status-badge>
              <Tag :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" size="small" />
            </template>
            
            <template #action-buttons>
              <Button 
                type="button" 
                icon="pi pi-ellipsis-v" 
                @click="(e) => toggleEventMenu(e, event)" 
                aria-haspopup="true" 
                aria-controls="event_menu"
                severity="secondary"
                outlined
                size="small"
              />
            </template>
          </EventBaseListCard>
        </div>
        <div v-else-if="allEvents.length > 0" class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-surface-section mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-search text-md-gray text-2xl"></i>
          </div>
          <p class="text-md-gray font-medium">No events match your filters</p>
          <p class="text-sm text-md-gray">Try adjusting your search criteria</p>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-success-light mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-calendar-times text-success text-2xl"></i>
          </div>
          <p class="text-success font-medium">No events</p>
          <p class="text-sm text-success-dark">Create new events to get started</p>
        </div>

    <Toast group="main" position="bottom-center" @close="onClose" />
    
    <!-- Write Review Dialog -->
    <WriteReview
      :visible="showWriteReviewDialog"
      :event="selectedEventForReview"
      :is-vendor="false"
      :sender-id="String(route.params.id)"
      :recipient-id="selectedEventForReview?.vendor || ''"
      @update:visible="showWriteReviewDialog = $event"
      @review-submitted="onReviewSubmitted"
    />

    <!-- Create Event Dialog -->
    <EventCreate
      :visible="showCreateEventDialog"
      :merchant="merchant"
      @update:visible="showCreateEventDialog = $event"
      @event-created="onEventCreated"
    />

    <!-- Create Multiple Events Dialog -->
    <EventCreateMultiple
      :visible="showCreateMultipleDialog"
      :merchant="merchant"
      @update:visible="showCreateMultipleDialog = $event"
      @event-created="onEventCreated"
    />

    <!-- Event Details Dialog -->
    <EventDetailsCard
      :visible="showEventDetailsDialog"
      :event="selectedEventForDetails"
      :merchant="merchant"
      :business-type="'merchant'"
      :get-vendor-prop="getVendorProp"
      :get-vendor-cuisines="getVendorCuisines"
      :has-review="hasReview"
      @update:visible="showEventDetailsDialog = $event"
      @write-review="onWriteReviewFromDetails"
    />

    <!-- Delete Event Dialog -->
    <Dialog 
      :visible="showDeleteEventDialog" 
      @update:visible="showDeleteEventDialog = $event"
      modal 
      :style="{ width: '90vw', maxWidth: '400px' }"
      :closable="true"
      :closeOnEscape="true"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-error-light flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-error"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-text-main">Delete Event</h3>
            <p class="text-sm text-text-muted">Are you sure you want to delete this event?</p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-text-main">
          This action cannot be undone. The event will be permanently deleted.
        </p>
        <div v-if="selectedEventForDelete" class="p-4 bg-surface-section rounded-lg">
          <p class="font-medium text-text-main">Event Details:</p>
          <p class="text-sm text-text-muted">Date: {{ new Date(selectedEventForDelete.start).toLocaleDateString() }}</p>
          <p class="text-sm text-text-muted">Time: {{ new Date(selectedEventForDelete.start).toLocaleTimeString() }} - {{ new Date(selectedEventForDelete.end).toLocaleTimeString() }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button 
            label="Cancel" 
            severity="secondary" 
            outlined
            :disabled="deletingEvent"
            @click="showDeleteEventDialog = false" 
          />
          <Button 
            label="Delete Event" 
            severity="danger"
            :loading="deletingEvent"
            @click="confirmDeleteEvent"
            class="min-w-[120px]"
          />
        </div>
      </template>
    </Dialog>

    <!-- Menu Dropdowns -->
    <Menu ref="eventMenu" id="event_menu" :model="getEventMenuItems(selectedEventForMenu || {})" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { getEventStatus, getEventStatusSeverity } from '~/utils/events'
import { useToast } from '~/composables/useToast'

const { showToast } = useToast()

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const supabase = useSupabaseClient()
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const eventStore = useEventStore()
const reviewStore = useReviewStore()
const userStore = useUserStore()
const subscriptionStore = useSubscriptionStore()

const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
const currentUser = useSupabaseUser()
const notificationStore = useNotificationStore()
const loadingApproval = ref<string | null>(null)
const loadingRejection = ref<string | null>(null)

// Check and set active subscription on mount if not already set
onMounted(async () => {
  // Load events if store is empty
  if (eventStore.allEvents.length === 0) {
    await eventStore.loadEvents()
  }
  
  // Load vendors if store is empty
  if (vendorStore.allVendors.length === 0) {
    await vendorStore.loadVendors()
  }
  
  if (!subscriptionStore.activeSubscription) {
    try {
      await subscriptionStore.setActiveSubscription(String(route.params.id), 'merchant')
    } catch (error) {
      // Silently fail if no subscription found - this is expected for free tier users
      console.log('No active subscription found for merchant')
    }
  }
})

// Menu refs for dropdown actions
const eventMenu = ref()

// Fetch review data for this merchant
await reviewStore.loadReviewsForBusiness(route.params.id as string, 'merchant')

// Review dialog state
const showWriteReviewDialog = ref(false)
const selectedEventForReview = ref<Event | null>(null)

// Create event dialog state
const showCreateEventDialog = ref(false)
const showCreateMultipleDialog = ref(false)

// Event details dialog state
const showEventDetailsDialog = ref(false)
const selectedEventForDetails = ref<Event | null>(null)

// Delete event dialog state
const showDeleteEventDialog = ref(false)
const selectedEventForDelete = ref<Event | null>(null)
const deletingEvent = ref(false)

// Menu state
const selectedEventForMenu = ref<Event | null>(null)


// Unified filter state for all events
type StatusOption = { label: string; value: string }

const eventFilters = ref({
  keyword: '',
  status: [] as StatusOption[], // Empty array shows all statuses
  sortBy: 'date-desc' // Default to newest first
})

// Filter options for all event statuses (no "All Statuses" option - use clear filters to show all)
const statusOptions = ref<StatusOption[]>([
  { label: 'Open', value: 'open' },
  { label: 'Booked', value: 'booked' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Closed', value: 'closed' }
])

const statusFilterSuggestions = ref<StatusOption[]>([])

const searchStatusFilter = (event: { query: string }) => {
  const q = (event.query || '').trim().toLowerCase()
  const list = statusOptions.value
  statusFilterSuggestions.value = q
    ? list.filter((o) => o.label.toLowerCase().includes(q))
    : [...list]
}

const sortOptions = ref([
  { label: 'Date (Newest First)', value: 'date-desc' },
  { label: 'Date (Oldest First)', value: 'date-asc' },
  { label: 'Food Truck (A-Z)', value: 'vendor-asc' },
  { label: 'Food Truck (Z-A)', value: 'vendor-desc' }
])

// Get all events for this merchant
// Check if user can create recurring events (premium feature)
const canCreateRecurringEvents = computed(() => {
  return subscriptionStore.canCreateRecurringEvents
})

const canCreateDateRangeEvents = computed(() => {
  return subscriptionStore.hasFeature('createDateRangeEvents')
})

// Get all events for this merchant using store getter
const allEvents = computed(() => {
  const events = eventStore.getEventsByMerchantId(String(route.params.id))
  return events || []
})

// Helper function to filter events by keyword
const filterByKeyword = (events: Event[], keyword: string): Event[] => {
  if (!keyword) return events
  const searchTerm = keyword.toLowerCase()
  return events.filter((event: Event) => {
    const vendorName = getVendorProp(event.vendor || '', 'vendor_name').toLowerCase()
    const cuisines = getVendorCuisines(event.vendor).join(' ').toLowerCase()
    const location = event.location_address?.toLowerCase() || ''
    return vendorName.includes(searchTerm) || cuisines.includes(searchTerm) || location.includes(searchTerm)
  })
}

// Helper function to sort events
const sortEvents = (events: Event[], sortBy: string): Event[] => {
  return [...events].sort((a: Event, b: Event) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'vendor-asc':
        return getVendorProp(a.vendor || '', 'vendor_name').localeCompare(getVendorProp(b.vendor || '', 'vendor_name'))
      case 'vendor-desc':
        return getVendorProp(b.vendor || '', 'vendor_name').localeCompare(getVendorProp(a.vendor || '', 'vendor_name'))
      default:
        return new Date(b.start).getTime() - new Date(a.start).getTime()
    }
  })
}

// Helper function to filter and sort events
const filterAndSortEvents = (events: Event[], filters: { keyword: string; status: StatusOption[]; sortBy: string }): Event[] => {
  if (!events || events.length === 0) return []
  
  let filtered = filterByKeyword(events, filters.keyword)
  // Only filter by status if statuses are selected (empty array shows all statuses)
  if (filters.status && filters.status.length > 0) {
    const statusValues = filters.status.map((s) => s.value)
    filtered = filtered.filter((event: Event) => statusValues.includes(event.status))
  }
  return sortEvents(filtered, filters.sortBy)
}

// Pending requests - events with pending_requests that include vendor IDs
const pendingRequests = computed(() => {
  const now = new Date()
  return (allEvents.value || []).filter((event: Event) => {
    return event.status === 'open' && 
           event.pending_requests && 
           event.pending_requests.length > 0 &&
           new Date(event.start) > now
  })
})

// Filtered events with search, status filter, and sorting
const filteredEvents = computed(() => {
  return filterAndSortEvents(allEvents.value, eventFilters.value)
})

// Event count computed properties
const openEventsCount = computed(() => 
  filteredEvents.value.filter((event: Event) => event.status === 'open').length
)

const bookedEventsCount = computed(() => 
  filteredEvents.value.filter((event: Event) => event.status === 'booked').length
)

const completedEventsCount = computed(() => 
  filteredEvents.value.filter((event: Event) => event.status === 'completed').length
)

const cancelledEventsCount = computed(() => 
  filteredEvents.value.filter((event: Event) => event.status === 'cancelled').length
)

const closedEventsCount = computed(() => 
  filteredEvents.value.filter((event: Event) => event.status === 'closed').length
)

// Helper functions
const getVendorProp = (vendorId: string | null, prop: string): string => {
  if (!vendorId) return ''
  return vendorStore.getVendorProp(vendorId, prop)
}

const getVendorCuisines = (vendorId: string | null): string[] => {
  if (!vendorId) return []
  const vendor = vendorStore.allVendors.find((v: Vendor) => v.id === vendorId)
  return (vendor?.cuisine as string[]) || []
}



const hasReview = (event: Event): boolean => {
  const sentReviews = reviewStore.getSentReviews
  return sentReviews.some((review: any) => review.event_id === event.id)
}


// Methods
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

const viewRecurringEvents = () => {
  navigateTo(`/merchant/${route.params.id}/recurring-events`)
}

const approveRequest = async (event: Event, vendorId: string) => {
  loadingApproval.value = `${event.id}-${vendorId}`
  
  try {
    await eventStore.updateEvent(event.id, {
      status: 'booked',
      vendor: vendorId,
      pending_requests: null,
      updated_at: new Date().toISOString()
    })
    
    // Create timeline item for event booked
    const timelineStore = useTimelineStore()
    await timelineStore.createTimelineItem({
      owner_id: event.merchant || '',
      other_ids: [event.id, vendorId],
      title: 'Event Booked',
      description: `Approved ${getVendorProp(vendorId, 'vendor_name')} for event on ${new Date(event.start).toLocaleDateString()}`,
      type: 'event_booked'
    })
    
    // Create notification for vendor
    const vendorUserIds = await userStore.getUserIdsFromBusiness(vendorId, 'vendor')
    
    for (const vendorUserId of vendorUserIds) {
      try {
        await notificationStore.createNotification({
          recipient_id: vendorUserId,
          sender_id: currentUser.value?.id || null,
          sender_business_id: route.params.id as string,
          sender_business_type: 'merchant',
          action_type: 'event_request_approved',
          entity_type: 'event',
          entity_id: event.id,
          title: 'Event Request Approved',
          message: `${merchant.value?.merchant_name || 'A merchant'} approved your request for the event on ${new Date(event.start).toLocaleDateString()}`,
          metadata: {
            event_id: event.id,
            merchant_id: route.params.id as string,
            merchant_name: merchant.value?.merchant_name,
            event_date: event.start
          }
        })
      } catch (notifError) {
        console.error('Failed to create notification for vendor user:', vendorUserId, notifError)
      }
    }
    
    showToast('success', 'Request Approved', `Approved ${getVendorProp(vendorId, 'vendor_name')} for the event. Event is now booked!`)
  } catch (error) {
    console.error('Error approving request:', error)
    showToast('error', 'Error', 'Failed to approve request. Please try again.')
  } finally {
    loadingApproval.value = null
  }
}

const rejectRequest = async (event: Event, vendorId: string) => {
  loadingRejection.value = `${event.id}-${vendorId}`
  try {
    // Remove the specific vendor from pending_requests
    const currentRequests = event.pending_requests || []
    const updatedRequests = currentRequests.filter((id: string) => id !== vendorId)
    
    await eventStore.updateEvent(event.id, {
      pending_requests: updatedRequests.length > 0 ? updatedRequests : null,
      updated_at: new Date().toISOString()
    })
    
    showToast('info', 'Request Rejected', `Rejected ${getVendorProp(vendorId, 'vendor_name')} for the event`)
  } catch (error) {
    console.error('Error rejecting request:', error)
    showToast('error', 'Error', 'Failed to reject request. Please try again.')
  } finally {
    loadingRejection.value = null
  }
}

const viewEventDetails = (event: Event) => {
  selectedEventForDetails.value = event
  showEventDetailsDialog.value = true
}

const writeReview = (event: Event) => {
  selectedEventForReview.value = event
  showWriteReviewDialog.value = true
}

const onReviewSubmitted = () => {
  // Refresh the reviews data
  // The real-time subscription will handle updating the reviews
  console.log('Review submitted successfully')
}

const onWriteReviewFromDetails = (event: Event) => {
  // Close the details dialog and open the review dialog
  showEventDetailsDialog.value = false
  selectedEventForReview.value = event
  showWriteReviewDialog.value = true
}

const onEventCreated = () => {
  // Refresh the events data
  // The real-time subscription will handle updating the events
  console.log('Event created successfully')
}


const deleteEvent = (event: Event) => {
  selectedEventForDelete.value = event
  showDeleteEventDialog.value = true
}

const confirmDeleteEvent = async () => {
  if (!selectedEventForDelete.value) return
  
  deletingEvent.value = true
  try {
    const eventStore = useEventStore()
    await eventStore.deleteEvent(selectedEventForDelete.value.id)
    
    showToast('success', 'Event Deleted', 'Event has been successfully deleted')
  } catch (error) {
    console.error('Error deleting event:', error)
    showToast('error', 'Error', 'Failed to delete event. Please try again.')
  } finally {
    deletingEvent.value = false
    showDeleteEventDialog.value = false
    selectedEventForDelete.value = null
  }
}

const onClose = () => {
  // Toast closed functionality
  console.log('Toast closed')
}

const clearEventFilters = () => {
  eventFilters.value = {
    keyword: '',
    status: [], // Reset to empty array to show all statuses
    sortBy: 'date-desc' // Reset to newest first
  }
}

// Menu toggle functions
const toggleEventMenu = (event: MouseEvent, selectedEvent: Event) => {
  selectedEventForMenu.value = selectedEvent
  eventMenu.value?.toggle(event)
}

// Menu items for events
const getEventMenuItems = (event: Event) => {
  const items = [
    {
      label: 'View Details',
      icon: 'pi pi-eye',
      command: () => viewEventDetails(event)
    }
  ]
  
  // Add Delete option for open events
  if (event.status === 'open') {
    items.push({
      label: 'Delete Event',
      icon: 'pi pi-trash',
      command: () => deleteEvent(event)
    })
  }
  
  // Add cancel option if event is open or booked
  if (event.status === 'open' || event.status === 'booked') {
    items.push({
      label: 'Cancel Event',
      icon: 'pi pi-times',
      command: () => cancelEvent(event)
    })
  }
  
  // Add review option if no review exists and event has a vendor (for completed events)
  if ((event.status === 'completed' || event.status === 'closed') && !hasReview(event) && event.vendor) {
    items.push({
      label: 'Write Review',
      icon: 'pi pi-star',
      command: () => writeReview(event)
    })
  }
  
  return items
}

useSeoMeta({ title: () => `Events | ${merchant.value?.merchant_name || 'Merchant'}` })
</script>

<style scoped>
/* Custom styles for the events page */
:deep(.p-card) {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

:deep(.p-card .p-card-title) {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

:deep(.p-card .p-card-content) {
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
}

:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

:deep(.p-button.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style>