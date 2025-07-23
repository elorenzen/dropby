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
                {{ pendingRequests.length }} request{{ pendingRequests.length !== 1 ? 's' : '' }} awaiting your response
              </p>
            </div>
          </div>
          <Badge :value="pendingRequests.length" severity="warning" />
        </div>
      </template>
      <template #content>
        <div v-if="pendingRequests.length > 0" class="space-y-4">
          <div v-for="event in pendingRequests" :key="event.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <NuxtImg 
                  :src="getVendorProp(event.vendor_id || '', 'avatar_url')" 
                  :alt="getVendorProp(event.vendor_id || '', 'vendor_name')" 
                  class="w-12 h-12 rounded-full"
                />
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-text-main truncate">{{ getVendorProp(event.vendor_id || '', 'vendor_name') }}</p>
                  <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                  <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <Tag v-for="cuisine in getVendorCuisines(event.vendor_id || '')" :key="cuisine" :value="cuisine" severity="info" size="small" />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button 
                  @click="approveRequest(event)"
                  label="Approve"
                  severity="success"
                  size="small"
                  :loading="loadingApproval === event.id"
                />
                <Button 
                  @click="rejectRequest(event)"
                  label="Reject"
                  severity="danger"
                  outlined
                  size="small"
                  :loading="loadingRejection === event.id"
                />
              </div>
            </div>
          </div>
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
              <p class="text-sm text-text-muted">{{ currentUpcomingEvents.length }} event{{ currentUpcomingEvents.length !== 1 ? 's' : '' }} scheduled</p>
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
        <div v-if="currentUpcomingEvents.length > 0" class="space-y-4">
          <div v-for="event in currentUpcomingEvents" :key="event.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <!-- Show vendor info if event has a vendor -->
                <template v-if="event.vendor">
                  <NuxtImg 
                    :src="getVendorProp(event.vendor, 'avatar_url')" 
                    :alt="getVendorProp(event.vendor, 'vendor_name')" 
                    class="w-12 h-12 rounded-full"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-text-main truncate mb-1">{{ getVendorProp(event.vendor, 'vendor_name') }}</p>
                    <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                    <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <Tag v-for="cuisine in getVendorCuisines(event.vendor)" :key="cuisine" :value="cuisine" severity="info" size="small" />
                    </div>
                  </div>
                </template>
                
                <!-- Show no vendor message if event is open -->
                <template v-else>
                  <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <i class="pi pi-truck text-gray-400 dark:text-gray-500"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-text-main truncate mb-1">No Food Truck Booked</p>
                    <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                    <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                    <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">Waiting for food truck requests</p>
                  </div>
                </template>
              </div>
              <div class="flex flex-col items-end gap-2">
                <Tag :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" size="small" />
                <div class="flex items-center gap-2">
                  <Button 
                    @click="viewEventDetails(event)"
                    label="View Details"
                    severity="secondary"
                    outlined
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
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
              <p class="text-sm text-text-muted">{{ filteredPastEvents.length }} completed event{{ filteredPastEvents.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <!-- Filters Section -->
        <div class="mb-6">
          <div class="flex items-center gap-4">
            <!-- Search Bar -->
            <div class="flex-1">
              <span class="p-input-icon-left w-full">
                <InputText 
                  v-model="pastEventsFilters.keyword" 
                  placeholder="Search by food truck name, cuisine, or location..."
                  class="w-full"
                />
              </span>
            </div>
            
            <!-- Status Filter -->
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-text-main">Status:</label>
              <Dropdown 
                v-model="pastEventsFilters.status" 
                :options="statusOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="All Statuses"
                class="w-40"
              />
            </div>
            
            <!-- Sort By -->
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-text-main">Sort by:</label>
              <Dropdown 
                v-model="pastEventsFilters.sortBy" 
                :options="sortOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Sort by"
                class="w-48"
              />
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
          <div v-for="event in filteredPastEvents" :key="event.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <NuxtImg 
                  :src="getVendorProp(event.vendor, 'avatar_url')" 
                  :alt="getVendorProp(event.vendor, 'vendor_name')" 
                  class="w-12 h-12 rounded-full"
                />
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-text-main truncate mb-1">{{ getVendorProp(event.vendor, 'vendor_name') }}</p>
                  <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
                  <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <Tag :value="event.status.toUpperCase()" :severity="event.status === 'completed' ? 'success' : 'secondary'" size="small" />
                <div class="flex items-center gap-2">
                  <Button 
                    @click="viewEventDetails(event)"
                    label="View Details"
                    severity="secondary"
                    outlined
                    size="small"
                  />
                  <Button 
                    v-if="!hasReview(event)"
                    @click="writeReview(event)"
                    label="Write Review"
                    severity="warning"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
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

    <Toast group="main" position="bottom-center" />
    
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
  </div>
</template>

<script setup lang="ts">
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

const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
const loadingApproval = ref<string | null>(null)
const loadingRejection = ref<string | null>(null)

// Business hours parsing
const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
businessHours.value = businessHours.value.map((day: any) => JSON.parse(day))

// Review dialog state
const showWriteReviewDialog = ref(false)
const selectedEventForReview = ref<Event | null>(null)

// Create event dialog state
const showCreateEventDialog = ref(false)

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

// Filter options
const statusOptions = ref([
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Closed', value: 'closed' }
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
  }).map((event: Event) => {
    // Create separate entries for each pending request
    return event.pending_requests!.map((vendorId: string) => ({
      ...event,
      vendor_id: vendorId
    }))
  }).flat()
})

// Current and upcoming events - all events that haven't ended yet
const currentUpcomingEvents = computed(() => {
  const now = new Date()
  return allEvents.value.filter((event: Event) => {
    return new Date(event.end) > now
  }).sort((a: Event, b: Event) => new Date(a.start).getTime() - new Date(b.start).getTime())
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

// Methods
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

const approveRequest = async (event: Event & { vendor_id: string }) => {
  loadingApproval.value = event.id
  try {
    const { error } = await supabase
      .from('events')
      .update({
        status: 'booked',
        vendor: event.vendor_id,
        pending_requests: null,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', event.id)
    
    if (error) throw error
    
    toast.add({
      severity: 'success',
      summary: 'Request Approved',
      detail: `Approved ${getVendorProp(event.vendor_id, 'vendor_name')} for the event`,
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

const rejectRequest = async (event: Event & { vendor_id: string }) => {
  loadingRejection.value = event.id
  try {
    // Remove the specific vendor from pending_requests
    const currentRequests = event.pending_requests || []
    const updatedRequests = currentRequests.filter((id: string) => id !== event.vendor_id)
    
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
      detail: `Rejected ${getVendorProp(event.vendor_id, 'vendor_name')} for the event`,
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
  // Navigate to event details page or open modal
  console.log('View event details:', event)
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

const onEventCreated = () => {
  // Refresh the events data
  // The real-time subscription will handle updating the events
  console.log('Event created successfully')
}

const clearPastEventsFilters = () => {
  pastEventsFilters.value = {
    keyword: '',
    status: '',
    sortBy: 'date-desc'
  }
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