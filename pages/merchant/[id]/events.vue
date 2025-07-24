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
            icon="pi pi-arrow-left" 
            @click="navigateToDashboard"
            outlined 
            label="Back to Dashboard"
          />
        </div>
      </div>
    </div>

    <!-- Pending Event Requests Card -->
    <Card class="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <i class="pi pi-clock text-orange-600 dark:text-orange-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-orange-800 dark:text-orange-200">
                Pending Event Requests
              </h3>
              <p class="text-sm text-orange-600 dark:text-orange-400">
                {{ pendingRequests.length }} event{{ pendingRequests.length !== 1 ? 's' : '' }} with pending requests
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="pendingRequests.length > 0" class="space-y-4">
          <EventBaseListCard 
            v-for="event in pendingRequests" 
            :key="event.id"
            class="border-orange-200 dark:border-orange-800"
            :show-status-badge="false"
          >
            <template #vendor-avatar>
              <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <i class="pi pi-calendar text-orange-600 dark:text-orange-400"></i>
              </div>
            </template>
            
            <template #event-content>
              <p class="font-semibold text-text-main truncate mb-1">Event on {{ new Date(event.start).toLocaleDateString() }}</p>
              <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
              <p class="text-xs text-text-muted mb-2">Location: {{ event.location_address || 'No address specified' }}</p>
              
              <!-- Vendor Requests List -->
              <div class="space-y-3">
                <p class="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {{ event.pending_requests?.length || 0 }} vendor{{ (event.pending_requests?.length || 0) !== 1 ? 's' : '' }} requesting this event:
                </p>
                <div v-for="vendorId in event.pending_requests" :key="vendorId" class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div class="flex items-center gap-3">
                    <NuxtImg 
                      :src="getVendorProp(vendorId, 'avatar_url')" 
                      :alt="getVendorProp(vendorId, 'vendor_name')" 
                      class="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p class="font-medium text-text-main">{{ getVendorProp(vendorId, 'vendor_name') }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
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
                      severity="success"
                      size="small"
                      :loading="loadingApproval === `${event.id}-${vendorId}`"
                    />
                  </div>
                </div>
              </div>
            </template>
            
            <template #action-buttons>
              <!-- No action buttons needed here since they're per vendor -->
            </template>
          </EventBaseListCard>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-check-circle text-orange-600 dark:text-orange-400 text-2xl"></i>
          </div>
          <p class="text-orange-600 dark:text-orange-400 font-medium">No pending requests</p>
          <p class="text-sm text-orange-500 dark:text-orange-300">All event requests have been processed</p>
        </div>
      </template>
    </Card>

    <!-- Current and Upcoming Events Card -->
    <Card class="mb-6">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <i class="pi pi-calendar text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-text-main">Current & Upcoming Events</h3>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-text-muted">Total events: {{ filteredCurrentUpcomingEvents.length }} |</span>
                <span v-if="openEventsCount > 0" class="text-red-600 dark:text-red-400 font-medium">open: {{ openEventsCount }}</span>
                <span v-if="openEventsCount > 0 && bookedEventsCount > 0" class="text-text-muted">|</span>
                <span v-if="bookedEventsCount > 0" class="text-green-600 dark:text-green-400 font-medium">booked: {{ bookedEventsCount }}</span>
              </div>
            </div>
          </div>
          <Button 
            @click="showCreateEventDialog = true"
            label="Create Event"
            severity="success"
            outlined
            size="small"
          />
        </div>
      </template>
      <template #content>
        <!-- Filters Section -->
        <div class="mb-6">
          <div class="flex items-end gap-4">
            <!-- Search Bar -->
            <div class="flex-1">
              <FloatLabel>
                <span class="p-input-icon-left w-full">
                  <InputText 
                    id="current-upcoming-search-filter"
                    v-model="currentUpcomingFilters.keyword" 
                    class="w-full"
                  />
                </span>
                <label for="current-upcoming-search-filter">Search by food truck name...</label>
              </FloatLabel>
            </div>
            
            <!-- Status Filter -->
            <div class="w-40">
              <FloatLabel>
                <Dropdown 
                  id="current-upcoming-status-filter"
                  v-model="currentUpcomingFilters.status" 
                  :options="currentUpcomingStatusOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                />
                <label for="current-upcoming-status-filter">Status</label>
              </FloatLabel>
            </div>
            
            <!-- Sort By -->
            <div class="w-48">
              <FloatLabel>
                <Dropdown 
                  id="current-upcoming-sort-filter"
                  v-model="currentUpcomingFilters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                />
                <label for="current-upcoming-sort-filter">Sort by</label>
              </FloatLabel>
            </div>
            
            <!-- Clear Filters -->
            <Button 
              @click="clearCurrentUpcomingFilters"
              label="Clear Filters"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </div>

        <div v-if="filteredCurrentUpcomingEvents.length > 0" class="space-y-4">
          <EventBaseListCard 
            v-for="event in filteredCurrentUpcomingEvents" 
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
              
              <!-- Show no vendor message if event is open -->
              <template v-else>
                <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <i class="pi pi-truck text-gray-400 dark:text-gray-500"></i>
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
              
              <!-- Show no vendor message if event is open -->
              <template v-else>
                <p class="font-semibold text-text-main truncate mb-1">No Food Truck Booked</p>
                <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">Waiting for food truck requests</p>
              </template>
            </template>
            
            <template #status-badge>
              <Tag :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" size="small" />
            </template>
            
            <template #action-buttons>
              <Button 
                type="button" 
                icon="pi pi-ellipsis-v" 
                @click="(e) => toggleCurrentUpcomingMenu(e, event)" 
                aria-haspopup="true" 
                aria-controls="current_upcoming_menu"
                severity="secondary"
                outlined
                size="small"
              />
            </template>
          </EventBaseListCard>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-calendar-times text-green-600 dark:text-green-400 text-2xl"></i>
          </div>
          <p class="text-green-600 dark:text-green-400 font-medium">No upcoming events</p>
          <p class="text-sm text-green-500 dark:text-green-300">Create new events to get started</p>
        </div>
      </template>
    </Card>

    <!-- Past Events Card -->
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <i class="pi pi-history text-gray-600 dark:text-gray-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-text-main">Past Events</h3>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-text-muted">Total events: {{ filteredPastEvents.length }} |</span>
                <span v-if="completedEventsCount > 0" class="text-green-600 dark:text-green-400 font-medium">completed: {{ completedEventsCount }}</span>
                <span v-if="completedEventsCount > 0 && closedEventsCount > 0" class="text-text-muted">|</span>
                <span v-if="closedEventsCount > 0" class="text-gray-600 dark:text-gray-400 font-medium">closed: {{ closedEventsCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <!-- Filters Section -->
        <div class="mb-6">
          <div class="flex items-end gap-4">
            <!-- Search Bar -->
            <div class="flex-1">
              <FloatLabel>
                <span class="p-input-icon-left w-full">
                  <InputText 
                    id="search-filter"
                    v-model="pastEventsFilters.keyword" 
                    class="w-full"
                  />
                </span>
                <label for="search-filter">Search by food truck name...</label>
              </FloatLabel>
            </div>
            
            <!-- Status Filter -->
            <div class="w-40">
              <FloatLabel>
                              <Dropdown 
                id="status-filter"
                v-model="pastEventsFilters.status" 
                :options="pastStatusOptions" 
                optionLabel="label" 
                optionValue="value"
                class="w-full"
              />
                <label for="status-filter">Status</label>
              </FloatLabel>
            </div>
            
            <!-- Sort By -->
            <div class="w-48">
              <FloatLabel>
                <Dropdown 
                  id="sort-filter"
                  v-model="pastEventsFilters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                />
                <label for="sort-filter">Sort by</label>
              </FloatLabel>
            </div>
            
            <!-- Clear Filters -->
            <Button 
              @click="clearPastEventsFilters"
              label="Clear Filters"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </div>

        <div v-if="filteredPastEvents.length > 0" class="space-y-4">
          <EventBaseListCard 
            v-for="event in filteredPastEvents" 
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
              
              <!-- Show no vendor message if event was closed without a vendor -->
              <template v-else>
                <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <i class="pi pi-times-circle text-gray-400 dark:text-gray-500"></i>
                </div>
              </template>
            </template>
            
            <template #event-content>
              <!-- Show vendor info if event has a vendor -->
              <template v-if="event.vendor">
                <p class="font-semibold text-text-main truncate mb-1">{{ getVendorProp(event.vendor, 'vendor_name') }}</p>
                <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
              </template>
              
              <!-- Show no vendor message if event was closed without a vendor -->
              <template v-else>
                <p class="font-semibold text-text-main truncate mb-1">No Food Truck Booked</p>
                <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Event was closed without a vendor</p>
              </template>
            </template>
            
            <template #status-badge>
              <Tag :value="event.status.toUpperCase()" :severity="event.status === 'completed' ? 'success' : 'secondary'" size="small" />
            </template>
            
            <template #action-buttons>
              <Button 
                type="button" 
                icon="pi pi-ellipsis-v" 
                @click="(e) => togglePastEventsMenu(e, event)" 
                aria-haspopup="true" 
                aria-controls="past_events_menu"
                severity="secondary"
                outlined
                size="small"
              />
            </template>
          </EventBaseListCard>
        </div>
        <div v-else-if="pastEvents.length > 0" class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-search text-gray-600 dark:text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">No events match your filters</p>
          <p class="text-sm text-gray-500 dark:text-gray-300">Try adjusting your search criteria</p>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-inbox text-gray-600 dark:text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">No past events</p>
          <p class="text-sm text-gray-500 dark:text-gray-300">Completed events will appear here</p>
        </div>
      </template>
    </Card>

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
      :business-hours="businessHours"
      @update:visible="showCreateEventDialog = $event"
      @event-created="onEventCreated"
    />

    <!-- Event Details Dialog -->
    <EventDetailsCard
      :visible="showEventDetailsDialog"
      :event="selectedEventForDetails"
      :merchant="merchant"
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
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400"></i>
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
        <div v-if="selectedEventForDelete" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            @click="showDeleteEventDialog = false" 
          />
          <Button 
            label="Delete Event" 
            severity="danger"
            @click="confirmDeleteEvent"
            class="min-w-[120px]"
          />
        </div>
      </template>
    </Dialog>

    <!-- Menu Dropdowns -->
    <Menu ref="currentUpcomingMenu" id="current_upcoming_menu" :model="getCurrentUpcomingMenuItems(selectedEventForCurrentUpcomingMenu || {})" :popup="true" />
    <Menu ref="pastEventsMenu" id="past_events_menu" :model="getPastEventsMenuItems(selectedEventForPastEventsMenu || {})" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

const toast = useToast()

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

const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
const loadingApproval = ref<string | null>(null)
const loadingRejection = ref<string | null>(null)

// Menu refs for dropdown actions
const currentUpcomingMenu = ref()
const pastEventsMenu = ref()

// Fetch review data for this merchant
const { data: sentReviews, error: sentReviewsError } = await supabase
  .from('reviews')
  .select('*')
  .eq('sender_id', route.params.id)
  .order('created_at', { ascending: false })
await reviewStore.setSentReviews(sentReviews || [])

// Business hours parsing
const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

// Review dialog state
const showWriteReviewDialog = ref(false)
const selectedEventForReview = ref<Event | null>(null)

// Create event dialog state
const showCreateEventDialog = ref(false)

// Event details dialog state
const showEventDetailsDialog = ref(false)
const selectedEventForDetails = ref<Event | null>(null)

// Delete event dialog state
const showDeleteEventDialog = ref(false)
const selectedEventForDelete = ref<Event | null>(null)

// Menu state
const selectedEventForCurrentUpcomingMenu = ref<Event | null>(null)
const selectedEventForPastEventsMenu = ref<Event | null>(null)

// Define interfaces for type safety
interface Event {
  id: string
  merchant: string
  vendor: string | null
  start: string
  end: string
  status: string
  pending_requests?: string[]
  vendor_id?: string
  location_address?: string
}

interface Vendor {
  id: string
  vendor_name?: string
  avatar_url?: string
  cuisine?: string[]
}

// Filter state for past events
const pastEventsFilters = ref({
  keyword: '',
  status: '',
  sortBy: 'date-desc'
})

// Filter state for current/upcoming events
const currentUpcomingFilters = ref({
  keyword: '',
  status: '',
  sortBy: 'date-asc'
})

// Filter options for past events
const pastStatusOptions = ref([
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Closed', value: 'closed' }
])

// Filter options for current/upcoming events
const currentUpcomingStatusOptions = ref([
  { label: 'All Statuses', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'Booked', value: 'booked' }
])

const sortOptions = ref([
  { label: 'Date (Newest First)', value: 'date-desc' },
  { label: 'Date (Oldest First)', value: 'date-asc' },
  { label: 'Food Truck (A-Z)', value: 'vendor-asc' },
  { label: 'Food Truck (Z-A)', value: 'vendor-desc' }
])

// Get all events for this merchant
const allEvents = computed((): Event[] => {
  return (eventStore.getAllEvents as Event[]).filter((event: Event) => event.merchant === route.params.id)
})

// Pending requests - events with pending_requests that include vendor IDs
const pendingRequests = computed(() => {
  const now = new Date()
  return allEvents.value.filter((event: Event) => {
    return event.status === 'open' && 
           event.pending_requests && 
           event.pending_requests.length > 0 &&
           new Date(event.start) > now
  })
})

// Current and upcoming events - all events that haven't ended yet
const currentUpcomingEvents = computed(() => {
  const now = new Date()
  return allEvents.value.filter((event: Event) => {
    return new Date(event.end) > now
  }).sort((a: Event, b: Event) => new Date(a.start).getTime() - new Date(b.start).getTime())
})

// Filtered current/upcoming events with search, status filter, and sorting
const filteredCurrentUpcomingEvents = computed(() => {
  let filtered = currentUpcomingEvents.value

  // Filter by keyword search
  if (currentUpcomingFilters.value.keyword) {
    const keyword = currentUpcomingFilters.value.keyword.toLowerCase()
    filtered = filtered.filter((event: Event) => {
      const vendorName = getVendorProp(event.vendor || '', 'vendor_name').toLowerCase()
      const cuisines = getVendorCuisines(event.vendor || '').join(' ').toLowerCase()
      const location = event.location_address?.toLowerCase() || ''
      
      return vendorName.includes(keyword) || 
             cuisines.includes(keyword) || 
             location.includes(keyword)
    })
  }

  // Filter by status
  if (currentUpcomingFilters.value.status) {
    filtered = filtered.filter((event: Event) => event.status === currentUpcomingFilters.value.status)
  }

  // Sort events
  filtered.sort((a: Event, b: Event) => {
    switch (currentUpcomingFilters.value.sortBy) {
      case 'date-asc':
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'vendor-asc':
        return getVendorProp(a.vendor || '', 'vendor_name').localeCompare(getVendorProp(b.vendor || '', 'vendor_name'))
      case 'vendor-desc':
        return getVendorProp(b.vendor || '', 'vendor_name').localeCompare(getVendorProp(a.vendor || '', 'vendor_name'))
      default:
        return new Date(a.start).getTime() - new Date(b.start).getTime()
    }
  })

  return filtered
})

// Event count computed properties for current/upcoming events
const openEventsCount = computed(() => {
  return filteredCurrentUpcomingEvents.value.filter((event: Event) => event.status === 'open').length
})

const bookedEventsCount = computed(() => {
  return filteredCurrentUpcomingEvents.value.filter((event: Event) => event.status === 'booked').length
})

// Event count computed properties for past events
const completedEventsCount = computed(() => {
  return filteredPastEvents.value.filter((event: Event) => event.status === 'completed').length
})

const closedEventsCount = computed(() => {
  return filteredPastEvents.value.filter((event: Event) => event.status === 'closed').length
})

// Past events - completed or closed events
const pastEvents = computed(() => {
  return allEvents.value.filter((event: Event) => {
    return event.status === 'completed' || event.status === 'closed'
  })
})

// Filtered past events with search, status filter, and sorting
const filteredPastEvents = computed(() => {
  let filtered = pastEvents.value

  // Filter by keyword search
  if (pastEventsFilters.value.keyword) {
    const keyword = pastEventsFilters.value.keyword.toLowerCase()
    filtered = filtered.filter((event: Event) => {
      const vendorName = getVendorProp(event.vendor || '', 'vendor_name').toLowerCase()
      const cuisines = getVendorCuisines(event.vendor || '').join(' ').toLowerCase()
      const location = event.location_address?.toLowerCase() || ''
      
      return vendorName.includes(keyword) || 
             cuisines.includes(keyword) || 
             location.includes(keyword)
    })
  }

  // Filter by status
  if (pastEventsFilters.value.status) {
    filtered = filtered.filter((event: Event) => event.status === pastEventsFilters.value.status)
  }

  // Sort events
  filtered.sort((a: Event, b: Event) => {
    switch (pastEventsFilters.value.sortBy) {
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

  return filtered
})

// Helper functions
const getVendorProp = (vendorId: string | null, prop: string): string => {
  if (!vendorId) return ''
  const allVendors = vendorStore.getAllVendors as Vendor[]
  const vendor = allVendors.find((v: Vendor) => v.id === vendorId)
  return vendor?.[prop as keyof Vendor] as string || ''
}

const getVendorCuisines = (vendorId: string | null): string[] => {
  if (!vendorId) return []
  const allVendors = vendorStore.getAllVendors as Vendor[]
  const vendor = allVendors.find((v: Vendor) => v.id === vendorId)
  return vendor?.cuisine || []
}

const getEventStatus = (event: Event): string => {
  const now = new Date()
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  
  if (event.status === 'open') {
    return 'OPEN'
  } else if (event.status === 'pending') {
    return 'PENDING'
  } else if (event.status === 'booked') {
    return 'BOOKED'
  } else if (event.status === 'in-progress') {
    return 'IN-PROGRESS'
  } else if (event.status === 'completed') {
    return 'COMPLETED'
  } else if (event.status === 'closed') {
    return 'CLOSED'
  } else {
    return event.status.toUpperCase()
  }
}

const getEventStatusSeverity = (event: Event): string => {
  const now = new Date()
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  
  if (event.status === 'open') {
    return 'danger' // Open events - red
  } else if (event.status === 'pending') {
    return 'warning' // Pending events - orange
  } else if (event.status === 'booked') {
    return 'success' // Booked events - green
  } else if (event.status === 'in-progress') {
    return 'success' // In-progress events - green
  } else if (event.status === 'completed') {
    return 'info' // Completed events - blue
  } else if (event.status === 'closed') {
    return 'secondary' // Closed events - gray
  } else {
    return 'secondary' // Other statuses - gray
  }
}

const hasReview = (event: Event): boolean => {
  const sentReviews = reviewStore.getSentReviews
  return sentReviews.some((review: any) => review.event_id === event.id)
}

const addTimelineEvent = async (timelineObj: any) => {
  const { error } = await supabase.from('timeline_items').insert({
    id: uuidv4(),
    owner_id: timelineObj.ownerId,
    title: timelineObj.title,
    description: timelineObj.description,
    type: timelineObj.type
  } as any)
  if (error) {
    console.error('Timeline Event Creation Error:', error.message)
  }
}

// Methods
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

const approveRequest = async (event: Event, vendorId: string) => {
  loadingApproval.value = `${event.id}-${vendorId}`
  try {
    const { error } = await (supabase
      .from('events')
      .update({
        status: 'booked',
        vendor: vendorId,
        pending_requests: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id) as any)
    
    if (error) throw error
    
    // Add timeline event for approved request
    await addTimelineEvent({
      ownerId: route.params.id as string,
      title: 'Event Request Approved',
      description: `${merchant.value.merchant_name} approved ${getVendorProp(vendorId, 'vendor_name')} for event on ${new Date(event.start).toLocaleDateString()}`,
      type: 'event'
    })
    
    toast.add({
      severity: 'success',
      summary: 'Request Approved',
      detail: `Approved ${getVendorProp(vendorId, 'vendor_name')} for the event`,
      life: 3000
    })
  } catch (error) {
    console.error('Error approving request:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to approve request. Please try again.',
      life: 3000
    })
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
    
    const { error } = await supabase
      .from('events')
      .update({
        pending_requests: updatedRequests.length > 0 ? updatedRequests : null,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', event.id)
    
    if (error) throw error
    
    toast.add({
      severity: 'info',
      summary: 'Request Rejected',
      detail: `Rejected ${getVendorProp(vendorId, 'vendor_name')} for the event`,
      life: 3000
    })
  } catch (error) {
    console.error('Error rejecting request:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reject request. Please try again.',
      life: 3000
    })
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
  
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', selectedEventForDelete.value.id)
    
    if (error) throw error
    
    // Add timeline event for deleted event
    const user = userStore.getUser
    const userFullName = user ? `${user.first_name} ${user.last_name}` : 'Unknown User'
    await addTimelineEvent({
      ownerId: route.params.id as string,
      title: 'Event Deleted',
      description: `${userFullName} deleted event scheduled for ${new Date(selectedEventForDelete.value.start).toLocaleDateString()}`,
      type: 'event'
    })
    
    toast.add({
      severity: 'success',
      summary: 'Event Deleted',
      detail: 'Event has been successfully deleted',
      life: 3000
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete event. Please try again.',
      life: 3000
    })
  } finally {
    showDeleteEventDialog.value = false
    selectedEventForDelete.value = null
  }
}

const onClose = () => {
  // Toast closed functionality
  console.log('Toast closed')
}

const clearPastEventsFilters = () => {
  pastEventsFilters.value = {
    keyword: '',
    status: '',
    sortBy: 'date-desc'
  }
}

const clearCurrentUpcomingFilters = () => {
  currentUpcomingFilters.value = {
    keyword: '',
    status: '',
    sortBy: 'date-asc'
  }
}

// Menu toggle functions
const toggleCurrentUpcomingMenu = (event: MouseEvent, selectedEvent: Event) => {
  selectedEventForCurrentUpcomingMenu.value = selectedEvent
  currentUpcomingMenu.value?.toggle(event)
}

const togglePastEventsMenu = (event: MouseEvent, selectedEvent: Event) => {
  selectedEventForPastEventsMenu.value = selectedEvent
  pastEventsMenu.value?.toggle(event)
}

// Menu items for current and upcoming events
const getCurrentUpcomingMenuItems = (event: Event) => {
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
  
  return items
}

// Menu items for past events
const getPastEventsMenuItems = (event: Event) => {
  const items = [
    {
      label: 'View Details',
      icon: 'pi pi-eye',
      command: () => viewEventDetails(event)
    }
  ]
  
  // Add review option if no review exists and event has a vendor
  if (!hasReview(event) && event.vendor) {
    items.push({
      label: 'Write Review',
      icon: 'pi pi-star',
      command: () => writeReview(event)
    })
  }
  
  return items
}

useSeoMeta({ title: () => `${merchant.value?.merchant_name || 'Merchant'} - Events` })
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