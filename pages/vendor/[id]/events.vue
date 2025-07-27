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
            Find work opportunities and manage your events for {{ vendor?.vendor_name || 'your food truck' }}
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

    <!-- Pending Events Card -->
    <Card class="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <i class="pi pi-clock text-orange-600 dark:text-orange-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-orange-800 dark:text-orange-200">
                Pending Requests
              </h3>
              <p class="text-sm text-orange-600 dark:text-orange-400">
                {{ pendingEvents.length }} event{{ pendingEvents.length !== 1 ? 's' : '' }} awaiting merchant approval
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="pendingEvents.length > 0" class="space-y-4">
          <EventBaseListCard 
            v-for="event in pendingEvents" 
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
              <p class="font-semibold text-text-main truncate mb-1">{{ getMerchantProp(event.merchant, 'merchant_name') }}</p>
              <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
              <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
              <p class="text-xs text-text-muted mb-2">Location: {{ event.location_address || 'No address specified' }}</p>
              <p class="text-xs text-orange-600 dark:text-orange-400">Request sent - waiting for merchant approval</p>
            </template>
            
            <template #action-buttons>
              <Button 
                @click="withdrawRequest(event)"
                label="Withdraw"
                severity="danger"
                outlined
                size="small"
                :loading="loadingWithdrawal === event.id"
              />
            </template>
          </EventBaseListCard>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-check-circle text-orange-600 dark:text-orange-400 text-2xl"></i>
          </div>
          <p class="text-orange-600 dark:text-orange-400 font-medium">No pending requests</p>
          <p class="text-sm text-orange-500 dark:text-orange-300">Browse open events below to find work opportunities</p>
        </div>
      </template>
    </Card>

    <!-- Open Events Card -->
    <Card class="mb-6">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <i class="pi pi-calendar text-green-600 dark:text-green-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-text-main">Open Events</h3>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-text-muted">Total events: {{ filteredOpenEvents.length }}</span>
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
                    id="open-events-search-filter"
                    v-model="openEventsFilters.keyword" 
                    class="w-full"
                  />
                </span>
                <label for="open-events-search-filter">Search by merchant name, location, or cuisine...</label>
              </FloatLabel>
            </div>
            
            <!-- Date Range Filter -->
            <div class="w-48">
              <FloatLabel>
                <Dropdown 
                  id="open-events-date-filter"
                  v-model="openEventsFilters.dateRange" 
                  :options="dateRangeOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                />
                <label for="open-events-date-filter">Date Range</label>
              </FloatLabel>
            </div>
            
            <!-- Sort By -->
            <div class="w-48">
              <FloatLabel>
                <Dropdown 
                  id="open-events-sort-filter"
                  v-model="openEventsFilters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                />
                <label for="open-events-sort-filter">Sort by</label>
              </FloatLabel>
            </div>
            
            <!-- Clear Filters -->
            <Button 
              @click="clearOpenEventsFilters"
              label="Clear Filters"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </div>

        <div v-if="filteredOpenEvents.length > 0" class="space-y-4">
          <EventBaseListCard 
            v-for="event in filteredOpenEvents" 
            :key="event.id"
            :show-status-badge="false"
          >
            <template #vendor-avatar>
              <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <i class="pi pi-building text-green-600 dark:text-green-400"></i>
              </div>
            </template>
            
            <template #event-content>
              <p class="font-semibold text-text-main truncate mb-1" v-tooltip="'some shit here'">
                {{ getMerchantProp(event.merchant, 'merchant_name') }}
              </p>
              <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
              <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
              <p class="text-xs text-text-muted mb-2">Location: {{ event.location_address || 'No address specified' }}</p>
              <div class="flex items-center gap-2 mt-1">
                <Tag v-for="cuisine in getMerchantCuisines(event.merchant)" :key="cuisine" :value="cuisine" severity="info" size="small" />
              </div>
            </template>
            
            <template #action-buttons>
              <div class="flex flex-col gap-2">
                <Button 
                  @click="viewOpenEventDetails(event)"
                  label="View Details"
                  severity="secondary"
                  text
                  size="small"
                />
                <Button 
                  @click="requestEvent(event)"
                  label="Request Event"
                  severity="success"
                  size="small"
                  :loading="loadingRequest === event.id"
                  :disabled="hasRequestedEvent(event)"
                />
              </div>
            </template>
          </EventBaseListCard>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-calendar-times text-green-600 dark:text-green-400 text-2xl"></i>
          </div>
          <p class="text-green-600 dark:text-green-400 font-medium">No open events available</p>
          <p class="text-sm text-green-500 dark:text-green-300">Check back later for new opportunities</p>
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
                    id="past-events-search-filter"
                    v-model="pastEventsFilters.keyword" 
                    class="w-full"
                  />
                </span>
                <label for="past-events-search-filter">Search by merchant name...</label>
              </FloatLabel>
            </div>
            

            
            <!-- Sort By -->
            <div class="w-48">
              <FloatLabel>
                <Dropdown 
                  id="past-events-sort-filter"
                  v-model="pastEventsFilters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                />
                <label for="past-events-sort-filter">Sort by</label>
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
            :show-status-badge="false"
          >
            <template #vendor-avatar>
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <i class="pi pi-building text-gray-400 dark:text-gray-500"></i>
              </div>
            </template>
            
            <template #event-content>
              <p class="font-semibold text-text-main truncate mb-1">{{ getMerchantProp(event.merchant, 'merchant_name') }}</p>
              <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
              <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
              <p class="text-xs text-text-muted mb-2">Location: {{ event.location_address || 'No address specified' }}</p>
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

    <!-- Event Details Dialog -->
    <EventDetailsCard
      :visible="showEventDetailsDialog"
      :event="selectedEventForDetails"
      :merchant="getMerchantById(selectedEventForDetails?.merchant)"
      :get-vendor-prop="getVendorProp"
      :get-vendor-cuisines="getVendorCuisines"
      :has-review="hasReview"
      @update:visible="showEventDetailsDialog = $event"
      @write-review="onWriteReviewFromDetails"
    />

    <!-- Open Event Details Dialog -->
    <Dialog 
      :visible="showOpenEventDetailsDialog" 
      @update:visible="showOpenEventDetailsDialog = $event"
      modal 
      :header="`Event Details - ${selectedOpenEventForDetails?.merchant ? getMerchantProp(selectedOpenEventForDetails.merchant, 'merchant_name') : 'Unknown Merchant'}`" 
      :style="{ width: '50rem' }"
    >
      <div v-if="selectedOpenEventForDetails" class="space-y-6">
        <!-- Event Information -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-text-main mb-3">Event Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-text-muted">Date</p>
              <p class="text-text-main">{{ new Date(selectedOpenEventForDetails.start).toLocaleDateString() }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-text-muted">Time</p>
              <p class="text-text-main">{{ new Date(selectedOpenEventForDetails.start).toLocaleTimeString() }} - {{ new Date(selectedOpenEventForDetails.end).toLocaleTimeString() }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm font-medium text-text-muted">Location</p>
              <p class="text-text-main">{{ selectedOpenEventForDetails.location_address || 'No address specified' }}</p>
            </div>
          </div>
        </div>

        <!-- Merchant Information -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-text-main mb-3">Merchant Information</h3>
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <i class="pi pi-building text-green-600 dark:text-green-400 text-xl"></i>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-text-main text-lg">{{ getMerchantProp(selectedOpenEventForDetails.merchant, 'merchant_name') }}</h4>
              <div class="flex items-center gap-2 mt-2">
                <Tag 
                  v-for="cuisine in getMerchantCuisines(selectedOpenEventForDetails.merchant)" 
                  :key="cuisine" 
                  :value="cuisine" 
                  severity="info" 
                  size="small" 
                />
              </div>
              <p class="text-sm text-text-muted mt-2">
                {{ getMerchantProp(selectedOpenEventForDetails.merchant, 'merchant_description') || 'No description available' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Event Value Information (if available) -->
        <div v-if="selectedOpenEventForDetails.event_value" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Event Value</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-blue-700 dark:text-blue-300">Event Value:</span>
              <span class="font-semibold text-blue-800 dark:text-blue-200">${{ selectedOpenEventForDetails.event_value }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-700 dark:text-blue-300">Platform Fee (8%):</span>
              <span class="text-blue-800 dark:text-blue-200">${{ (selectedOpenEventForDetails.event_value * 0.08).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-700 dark:text-blue-300">Processing Fee:</span>
              <span class="text-blue-800 dark:text-blue-200">${{ ((selectedOpenEventForDetails.event_value * 0.029) + 0.30).toFixed(2) }}</span>
            </div>
            <div class="border-t border-blue-300 dark:border-blue-700 pt-2">
              <div class="flex justify-between font-semibold">
                <span class="text-blue-800 dark:text-blue-200">Total (Merchant Pays):</span>
                <span class="text-blue-800 dark:text-blue-200">${{ ((selectedOpenEventForDetails.event_value * 1.109) + 0.30).toFixed(2) }}</span>
              </div>
            </div>
            <div class="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-300 dark:border-blue-700">
              <p class="text-xs text-blue-800 dark:text-blue-200">
                <i class="pi pi-info-circle mr-1"></i>
                You will receive the full event value of ${{ selectedOpenEventForDetails.event_value }} after the event is completed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button 
            @click="showOpenEventDetailsDialog = false"
            label="Close"
            severity="secondary"
            outlined
          />
          <Button 
            @click="requestEventFromDialog"
            label="Request Event"
            severity="success"
            :loading="loadingRequest === selectedOpenEventForDetails?.id"
            :disabled="selectedOpenEventForDetails ? hasRequestedEvent(selectedOpenEventForDetails) : true"
          />
        </div>
      </template>
    </Dialog>

    <!-- Write Review Dialog -->
    <WriteReview
      :visible="showWriteReviewDialog"
      :event="selectedEventForReview"
      :is-vendor="true"
      :sender-id="String(route.params.id)"
      :recipient-id="selectedEventForReview?.merchant || ''"
      @update:visible="showWriteReviewDialog = $event"
      @review-submitted="onReviewSubmitted"
    />

    <!-- Menu Dropdowns -->
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
const vendorStore = useVendorStore()
const merchantStore = useMerchantStore()
const eventStore = useEventStore()
const reviewStore = useReviewStore()
const userStore = useUserStore()

const vendor = ref<any>(await vendorStore.getVendorById(route.params.id))
const loadingRequest = ref<string | null>(null)
const loadingWithdrawal = ref<string | null>(null)

// Menu refs for dropdown actions
const pastEventsMenu = ref()

// Fetch review data for this vendor
const { data: sentReviews, error: sentReviewsError } = await supabase
  .from('reviews')
  .select('*')
  .eq('sender_id', route.params.id)
  .order('created_at', { ascending: false })
await reviewStore.setSentReviews(sentReviews || [])

// Event details dialog state
const showEventDetailsDialog = ref(false)
const selectedEventForDetails = ref<Event | null>(null)

// Open event details dialog state
const showOpenEventDetailsDialog = ref(false)
const selectedOpenEventForDetails = ref<Event | null>(null)

// Write review dialog state
const showWriteReviewDialog = ref(false)
const selectedEventForReview = ref<Event | null>(null)

// Menu state
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
  location_address?: string
  event_value?: number
}

interface Merchant {
  id: string
  merchant_name?: string
  avatar_url?: string
  cuisine?: string[]
}

// Filter state for open events
const openEventsFilters = ref({
  keyword: '',
  dateRange: '',
  sortBy: 'date-asc'
})

// Filter state for past events
const pastEventsFilters = ref({
  keyword: '',
  sortBy: 'date-desc'
})

// Filter options for open events
const dateRangeOptions = ref([
  { label: 'All Dates', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Next 30 Days', value: 'next30' }
])



const sortOptions = ref([
  { label: 'Date (Newest First)', value: 'date-desc' },
  { label: 'Date (Oldest First)', value: 'date-asc' },
  { label: 'Merchant (A-Z)', value: 'merchant-asc' },
  { label: 'Merchant (Z-A)', value: 'merchant-desc' }
])

// Get all events
const allEvents = computed((): Event[] => {
  return eventStore.getAllEvents as Event[]
})

// Pending events - events where this vendor has a pending request
const pendingEvents = computed(() => {
  const now = new Date()
  return allEvents.value.filter((event: Event) => {
    return event.status === 'open' && 
           event.pending_requests && 
           event.pending_requests.includes(route.params.id as string) &&
           new Date(event.start) > now
  }).sort((a: Event, b: Event) => new Date(a.start).getTime() - new Date(b.start).getTime())
})

// Open events - all open events that this vendor hasn't requested yet
const openEvents = computed(() => {
  const now = new Date()
  return (eventStore.getAllOpenEventsForVendors as Event[]).filter((event: Event) => {
    return (!event.pending_requests || !event.pending_requests.includes(route.params.id as string))
  })
})

// Filtered open events with search, date filter, and sorting
const filteredOpenEvents = computed(() => {
  let filtered = openEvents.value

  // Filter by keyword search
  if (openEventsFilters.value.keyword) {
    const keyword = openEventsFilters.value.keyword.toLowerCase()
    filtered = filtered.filter((event: Event) => {
      const merchantName = getMerchantProp(event.merchant, 'merchant_name').toLowerCase()
      const cuisines = getMerchantCuisines(event.merchant).join(' ').toLowerCase()
      const location = event.location_address?.toLowerCase() || ''
      
      return merchantName.includes(keyword) || 
             cuisines.includes(keyword) || 
             location.includes(keyword)
    })
  }

  // Filter by date range
  if (openEventsFilters.value.dateRange) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    filtered = filtered.filter((event: Event) => {
      const eventDate = new Date(event.start)
      switch (openEventsFilters.value.dateRange) {
        case 'today':
          return eventDate.toDateString() === today.toDateString()
        case 'week':
          return eventDate >= today && eventDate <= weekFromNow
        case 'month':
          return eventDate >= today && eventDate <= monthFromNow
        case 'next30':
          return eventDate >= today && eventDate <= thirtyDaysFromNow
        default:
          return true
      }
    })
  }

  // Sort events
  filtered.sort((a: Event, b: Event) => {
    switch (openEventsFilters.value.sortBy) {
      case 'date-asc':
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'merchant-asc':
        return getMerchantProp(a.merchant, 'merchant_name').localeCompare(getMerchantProp(b.merchant, 'merchant_name'))
      case 'merchant-desc':
        return getMerchantProp(b.merchant, 'merchant_name').localeCompare(getMerchantProp(a.merchant, 'merchant_name'))
      default:
        return new Date(a.start).getTime() - new Date(b.start).getTime()
    }
  })

  return filtered
})

// Event count computed properties for open events
const openEventsCount = computed(() => {
  return filteredOpenEvents.value.length
})

// Past events - all events where this vendor was assigned
const pastEvents = computed(() => {
  return allEvents.value.filter((event: Event) => {
    return event.vendor === route.params.id
  })
})

// Filtered past events with search, status filter, and sorting
const filteredPastEvents = computed(() => {
  let filtered = pastEvents.value

  // Filter by keyword search
  if (pastEventsFilters.value.keyword) {
    const keyword = pastEventsFilters.value.keyword.toLowerCase()
    filtered = filtered.filter((event: Event) => {
      const merchantName = getMerchantProp(event.merchant, 'merchant_name').toLowerCase()
      const location = event.location_address?.toLowerCase() || ''
      
      return merchantName.includes(keyword) || 
             location.includes(keyword)
    })
  }



  // Sort events
  filtered.sort((a: Event, b: Event) => {
    switch (pastEventsFilters.value.sortBy) {
      case 'date-asc':
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'merchant-asc':
        return getMerchantProp(a.merchant, 'merchant_name').localeCompare(getMerchantProp(b.merchant, 'merchant_name'))
      case 'merchant-desc':
        return getMerchantProp(b.merchant, 'merchant_name').localeCompare(getMerchantProp(a.merchant, 'merchant_name'))
      default:
        return new Date(b.start).getTime() - new Date(a.start).getTime()
    }
  })

  return filtered
})



// Helper functions
const getMerchantProp = (merchantId: string | null, prop: string): string => {
  if (!merchantId) return ''
  const allMerchants = merchantStore.getAllMerchants as Merchant[]
  const merchant = allMerchants.find((m: Merchant) => m.id === merchantId)
  return merchant?.[prop as keyof Merchant] as string || ''
}

const getMerchantCuisines = (merchantId: string | null): string[] => {
  if (!merchantId) return []
  const allMerchants = merchantStore.getAllMerchants as Merchant[]
  const merchant = allMerchants.find((m: Merchant) => m.id === merchantId)
  return merchant?.cuisine || []
}

const getMerchantById = (merchantId: string | null): Merchant | null => {
  if (!merchantId) return null
  const allMerchants = merchantStore.getAllMerchants as Merchant[]
  return allMerchants.find((m: Merchant) => m.id === merchantId) || null
}

const getVendorProp = (vendorId: string | null, prop: string): string => {
  if (!vendorId) return ''
  const allVendors = vendorStore.getAllVendors as any[]
  const vendor = allVendors.find((v: any) => v.id === vendorId)
  return vendor?.[prop] || ''
}

const getVendorCuisines = (vendorId: string | null): string[] => {
  if (!vendorId) return []
  const allVendors = vendorStore.getAllVendors as any[]
  const vendor = allVendors.find((v: any) => v.id === vendorId)
  return vendor?.cuisine || []
}

const hasReview = (event: Event): boolean => {
  const sentReviews = reviewStore.getSentReviews
  return sentReviews.some((review: any) => review.event_id === event.id)
}

const hasRequestedEvent = (event: Event): boolean => {
  return event.pending_requests?.includes(route.params.id as string) || false
}

const viewOpenEventDetails = (event: Event) => {
  console.log('viewOpenEventDetails called with event:', event)
  selectedOpenEventForDetails.value = event
  showOpenEventDetailsDialog.value = true
  console.log('Dialog should now be open:', showOpenEventDetailsDialog.value)
}

const requestEventFromDialog = async () => {
  if (selectedOpenEventForDetails.value) {
    await requestEvent(selectedOpenEventForDetails.value)
    showOpenEventDetailsDialog.value = false
  }
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
  navigateTo(`/vendor/${route.params.id}/dashboard`)
}

const requestEvent = async (event: Event) => {
  loadingRequest.value = event.id
  try {
    // Add this vendor to the pending_requests array
    const currentRequests = event.pending_requests || []
    const updatedRequests = [...currentRequests, route.params.id as string]
    
    const { error } = await supabase
      .from('events')
      .update({
        pending_requests: updatedRequests,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id)
    
    if (error) throw error
    
    // Add timeline event for event request
    await addTimelineEvent({
      ownerId: route.params.id as string,
      title: 'Event Request Sent',
      description: `${vendor.value.vendor_name} requested event at ${getMerchantProp(event.merchant, 'merchant_name')} on ${new Date(event.start).toLocaleDateString()}`,
      type: 'event'
    })
    
    toast.add({
      severity: 'success',
      summary: 'Request Sent',
      detail: `Request sent to ${getMerchantProp(event.merchant, 'merchant_name')}`,
      life: 3000
    })
  } catch (error) {
    console.error('Error requesting event:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send request. Please try again.',
      life: 3000
    })
  } finally {
    loadingRequest.value = null
  }
}

const withdrawRequest = async (event: Event) => {
  loadingWithdrawal.value = event.id
  try {
    // Remove this vendor from the pending_requests array
    const currentRequests = event.pending_requests || []
    const updatedRequests = currentRequests.filter((id: string) => id !== route.params.id)
    
    const { error } = await supabase
      .from('events')
      .update({
        pending_requests: updatedRequests.length > 0 ? updatedRequests : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id)
    
    if (error) throw error
    
    toast.add({
      severity: 'info',
      summary: 'Request Withdrawn',
      detail: `Request withdrawn from ${getMerchantProp(event.merchant, 'merchant_name')}`,
      life: 3000
    })
  } catch (error) {
    console.error('Error withdrawing request:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to withdraw request. Please try again.',
      life: 3000
    })
  } finally {
    loadingWithdrawal.value = null
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

const onClose = () => {
  // Toast closed functionality
  console.log('Toast closed')
}

const clearOpenEventsFilters = () => {
  openEventsFilters.value = {
    keyword: '',
    dateRange: '',
    sortBy: 'date-asc'
  }
}

const clearPastEventsFilters = () => {
  pastEventsFilters.value = {
    keyword: '',
    sortBy: 'date-desc'
  }
}

// Menu toggle functions
const togglePastEventsMenu = (event: MouseEvent, selectedEvent: Event) => {
  selectedEventForPastEventsMenu.value = selectedEvent
  pastEventsMenu.value?.toggle(event)
}

// Menu items for past events
const getPastEventsMenuItems = (event: Event | {}) => {
  // Type guard to ensure event has required properties
  if (!event || typeof event !== 'object' || !('id' in event)) {
    return []
  }
  
  const items = [
    {
      label: 'View Details',
      icon: 'pi pi-eye',
      command: () => viewEventDetails(event as Event)
    }
  ]
  
  // Add review option if no review exists and event is completed
  if (!hasReview(event as Event) && (event as Event).status === 'completed') {
    items.push({
      label: 'Write Review',
      icon: 'pi pi-star',
      command: () => writeReview(event as Event)
    })
  }
  
  return items
}

useSeoMeta({ title: () => `Events | ${vendor.value?.vendor_name || 'Vendor'}` })
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