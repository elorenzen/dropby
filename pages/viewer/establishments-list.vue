<template>
  <div class="page-content">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="false" :show-list="true" :list-rows="6" />

    <div v-else class="section">
      <div class="text-center mb-8">
        <h1 class="font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-accent to-error bg-clip-text text-transparent">
          Find Amazing Bars & Taprooms
        </h1>
        <p class="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
          Discover where your favorite bars and taprooms are located. 
          Find bars and taprooms near you and never miss out on amazing experiences!
        </p>
      </div>

      <!-- Search and Filter Section -->
      <SearchAndFilter
        class="mb-8"
        :has-active-filters="hasActiveFilters"
        @clear-filters="clearAllFilters"
      >
        <template #search-bar>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-search text-color-secondary"></i>
            </div>
            <InputText 
              v-model="searchQuery" 
              placeholder="Search by merchant name..."
              class="w-full pl-10 pr-4"
              size="small"
              @input="onSearchInput"
            />
          </div>
        </template>

        <template #filters>
          <div v-if="isAuthenticated">
            <label class="block text-sm font-medium text-text-main mb-2">Filter by Rating</label>
            <Select 
              v-model="minRating" 
              :options="ratingOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Minimum rating"
              class="w-full"
              size="small"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Distance</label>
            <Select 
              v-model="maxDistance" 
              :options="distanceOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Max distance"
              class="w-full"
              size="small"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Location</label>
            <Button
              v-if="!locationPermission"
              label="Enable Location"
              icon="pi pi-map-marker"
              outlined
              @click="requestLocation"
              class="w-full"
              size="small"
            />
            <div v-else class="text-sm text-text-muted w-full text-center py-2">
              <i class="pi pi-check-circle text-success"></i> Location enabled
            </div>
          </div>
        </template>

        <template #sort-by>
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Sort By</label>
            <Select 
              v-model="sortBy" 
              :options="sortOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Sort by"
              class="w-full"
              size="small"
            />
          </div>
        </template>

        <template #results-count>
          Showing {{ filteredMerchants.length }} of {{ merchantsWithDistance.length }} establishments
          <span v-if="searchQuery || (isAuthenticated && minRating) || maxDistance" class="text-primary">
            (filtered)
          </span>
        </template>
      </SearchAndFilter>

      <!-- Merchants List with Expansion Panels -->
      <div v-if="filteredMerchants.length > 0" class="space-y-4">
        <Accordion :multiple="true" :activeIndex="expandedPanels">
          <AccordionTab v-for="merchant in filteredMerchants" :key="merchant.id">
            <template #header>
              <div class="flex items-center justify-between w-full pr-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <NuxtImg
                    :src="merchant.avatar_url || ''"
                    width="60"
                    height="60"
                    loading="lazy"
                    fit="inside"
                    class="rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <h3 class="font-bold text-xl md:text-2xl text-text-main mb-2 leading-tight break-words">{{ merchant.merchant_name }}</h3>
                    <div v-if="isAuthenticated" class="flex items-center gap-2 mt-1">
                      <div class="flex items-center gap-0.5">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          :class="[
                            'pi',
                            star <= Math.floor(getMerchantRating(merchant.id)) ? 'pi-star-fill text-accent' : 
                            star === Math.ceil(getMerchantRating(merchant.id)) && getMerchantRating(merchant.id) % 1 >= 0.5 ? 'pi-star-half text-accent' :
                            'pi-star text-text-muted'
                          ]"
                        ></i>
                      </div>
                      <span class="text-sm text-text-muted">({{ getMerchantReviewCount(merchant.id) }})</span>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <i class="pi pi-map-marker text-text-muted text-sm"></i>
                      <span class="text-sm text-text-muted truncate">
                        {{ merchant.formatted_address || 'Location not specified' }}
                      </span>
                      <Badge 
                        v-if="merchant.distance" 
                        :value="`${merchant.distance} mi`" 
                        severity="info"
                        size="small"
                      />
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    v-if="merchantEventsMap[merchant.id]?.length > 0"
                    :value="`${merchantEventsMap[merchant.id]?.length} event${merchantEventsMap[merchant.id]?.length !== 1 ? 's' : ''}`"
                    severity="info"
                  />
                  <Button 
                    label="View Profile" 
                    icon="pi pi-external-link"
                    outlined
                    size="small"
                    @click.stop="navigateTo(`/merchant/${merchant.id}/profile`)"
                  />
                </div>
              </div>
            </template>

            <div class="merchant-details-content">
              <!-- Merchant Description -->
              <div class="mb-6">
                <h4 class="font-semibold mb-2 text-text-main">About</h4>
                <p class="text-text-muted">{{ merchant.merchant_description || 'No description available.' }}</p>
              </div>

              <!-- Location Info -->
              <div v-if="merchant.formatted_address" class="mb-6">
                <h4 class="font-semibold mb-2 text-text-main">Location</h4>
                <div class="flex items-start gap-3">
                  <i class="pi pi-map-marker text-primary mt-1"></i>
                  <div>
                    <p class="text-text-muted">{{ merchant.formatted_address }}</p>
                    <Button
                      v-if="merchant.address_url"
                      label="View on Map"
                      icon="pi pi-external-link"
                      text
                      size="small"
                      @click="openMapUrl(merchant.address_url)"
                      class="mt-2"
                    />
                  </div>
                </div>
              </div>

              <!-- Upcoming Events -->
              <div v-if="merchantEventsMap[merchant.id] && merchantEventsMap[merchant.id].length > 0">
                <h4 class="font-semibold mb-4 text-text-main">Upcoming Events</h4>
                <div class="space-y-3">
                  <Card 
                    v-for="event in merchantEventsMap[merchant.id]" 
                    :key="event.id"
                    class="event-card"
                  >
                    <template #content>
                      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-calendar text-primary"></i>
                            <span class="font-semibold text-text-main">
                              {{ formatDate(event.start) }}
                            </span>
                          </div>
                          <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-clock text-primary"></i>
                            <span class="text-text-muted">
                              {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
                            </span>
                          </div>
                          <div v-if="event.location_address" class="flex items-center gap-3 mb-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span class="text-text-muted">{{ event.location_address }}</span>
                          </div>
                          <div v-if="getVendorName(event.vendor)" class="flex items-center gap-3">
                            <i class="pi pi-truck text-primary"></i>
                            <span class="text-text-muted">Featuring {{ getVendorName(event.vendor) }}</span>
                          </div>
                        </div>
                        <div class="flex flex-col gap-2">
                          <Tag 
                            :value="event.status.toUpperCase()" 
                            :severity="getEventStatusSeverity(event.status)"
                          />
                          <Button 
                            label="View Event" 
                            icon="pi pi-eye"
                            outlined
                            size="small"
                            @click="navigateTo(`/viewer/events`)"
                          />
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
              <div v-else class="text-center py-8 text-text-muted">
                <i class="pi pi-calendar-times text-4xl mb-2"></i>
                <p>No upcoming events scheduled</p>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </div>

      <div v-else class="text-center py-12">
        <i class="pi pi-search text-6xl text-text-muted mb-4"></i>
        <p class="text-xl text-text-muted">No establishments found matching your criteria</p>
        <Button 
          label="Clear Filters" 
          outlined 
          class="mt-4"
          @click="clearAllFilters"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Merchant, Event, Vendor } from '~/types'
import PageSkeleton from '~/components/skeleton/PageSkeleton.vue'

type MerchantWithDistance = Merchant & {
  distance?: number
}

definePageMeta({
  alias: '/establishments'
})

const merchStore = useMerchantStore()
const eventStore = useEventStore()
const vendorStore = useVendorStore()
const reviewStore = useReviewStore()
const { isAuthenticated } = useAuth()

const loading = ref(true)
const merchants = computed(() => merchStore.getAllMerchants)
const events = computed(() => eventStore.getAllEvents)
const vendors = computed(() => vendorStore.getAllVendors)

onMounted(async () => {
  try {
    await Promise.all([
      merchStore.allMerchants.length === 0 ? merchStore.loadMerchants() : Promise.resolve(),
      eventStore.allEvents.length === 0 ? eventStore.loadEvents() : Promise.resolve(),
      vendorStore.allVendors.length === 0 ? vendorStore.loadVendors() : Promise.resolve(),
      reviewStore.allReviews.length === 0 ? reviewStore.loadAllReviews() : Promise.resolve()
    ])
  } finally {
    loading.value = false
  }
})

// Search state
const searchQuery = ref('')
const sortBy = ref('name')
const minRating = ref<number | null>(null)
const maxDistance = ref<number | null>(null)
const expandedPanels = ref<number[]>([])

// Location services
const userLocation = ref<{lat: number, lng: number} | null>(null)
const locationPermission = ref<boolean>(false)

// Sort options
const sortOptions = computed(() => {
  const baseOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Distance (Nearest)', value: 'distance-asc' },
    { label: 'Distance (Farthest)', value: 'distance-desc' },
    { label: 'Most Events', value: 'events-desc' },
    { label: 'Least Events', value: 'events-asc' }
  ]
  
  if (isAuthenticated.value) {
    baseOptions.splice(2, 0, 
      { label: 'Rating (High to Low)', value: 'rating-desc' },
      { label: 'Rating (Low to High)', value: 'rating-asc' }
    )
  }
  
  return baseOptions
})

// Rating options
const ratingOptions = [
  { label: 'Any rating', value: null },
  { label: '4+ stars', value: 4 },
  { label: '3+ stars', value: 3 },
  { label: '2+ stars', value: 2 },
  { label: '1+ stars', value: 1 }
]

// Distance options
const distanceOptions = [
  { label: 'Any distance', value: null },
  { label: 'Within 5 miles', value: 5 },
  { label: 'Within 10 miles', value: 10 },
  { label: 'Within 25 miles', value: 25 },
  { label: 'Within 50 miles', value: 50 }
]

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}

// Get user location on component mount
onMounted(async () => {
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })
      
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      locationPermission.value = true
    } catch (error) {
      console.log('Location permission denied or unavailable')
      locationPermission.value = false
    }
  }
})

// Request location permission
const requestLocation = async () => {
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })
      
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      locationPermission.value = true
    } catch (error) {
      console.log('Location permission denied or unavailable')
      locationPermission.value = false
    }
  }
}

// Add distance to merchants if location is available
const merchantsWithDistance = computed((): MerchantWithDistance[] => {
  if (!userLocation.value || !locationPermission.value) {
    return merchants.value as MerchantWithDistance[]
  }
  
  return merchants.value.map((merchant: Merchant): MerchantWithDistance => {
    if (merchant.coordinates) {
      try {
        const coords = typeof merchant.coordinates === 'string' 
          ? JSON.parse(merchant.coordinates) 
          : merchant.coordinates
        if (coords.lat && coords.lng) {
          const distance = calculateDistance(
            userLocation.value!.lat,
            userLocation.value!.lng,
            coords.lat,
            coords.lng
          )
          return { ...merchant, distance }
        }
      } catch (e) {
        // Invalid coordinates format
      }
    }
    return merchant as MerchantWithDistance
  })
})

// Map merchants to their events
const merchantEventsMap = computed(() => {
  const map: Record<string, Event[]> = {}
  const now = new Date()
  
  merchants.value.forEach((merchant: Merchant) => {
    const merchantEvents = events.value.filter((event: Event) => {
      if (event.merchant !== merchant.id) return false
      if (event.status !== 'booked' && event.status !== 'open') return false
      const eventStart = new Date(event.start)
      return eventStart >= now
    }).sort((a: Event, b: Event) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    )
    map[merchant.id] = merchantEvents
  })
  
  return map
})

// Filtered merchants
const filteredMerchants = computed((): MerchantWithDistance[] => {
  let filtered = [...merchantsWithDistance.value]

  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter((merchant: MerchantWithDistance) => 
      merchant.merchant_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Rating filter (only if authenticated)
  if (isAuthenticated.value && minRating.value !== null) {
    filtered = filtered.filter((merchant: MerchantWithDistance) => 
      getMerchantRating(merchant.id) >= minRating.value!
    )
  }

  // Distance filter
  if (maxDistance.value !== null && userLocation.value && locationPermission.value) {
    filtered = filtered.filter((merchant: MerchantWithDistance) => {
      if (!merchant.distance) return false
      return merchant.distance <= maxDistance.value!
    })
  }

  // Sort
  filtered.sort((a: MerchantWithDistance, b: MerchantWithDistance) => {
    switch (sortBy.value) {
      case 'name':
        return (a.merchant_name || '').localeCompare(b.merchant_name || '')
      case 'name-desc':
        return (b.merchant_name || '').localeCompare(a.merchant_name || '')
      case 'rating-desc':
        return isAuthenticated.value ? getMerchantRating(b.id) - getMerchantRating(a.id) : 0
      case 'rating-asc':
        return isAuthenticated.value ? getMerchantRating(a.id) - getMerchantRating(b.id) : 0
      case 'distance-asc':
        if (!a.distance && !b.distance) return 0
        if (!a.distance) return 1
        if (!b.distance) return -1
        return a.distance - b.distance
      case 'distance-desc':
        if (!a.distance && !b.distance) return 0
        if (!a.distance) return 1
        if (!b.distance) return -1
        return b.distance - a.distance
      case 'events-desc':
        return (merchantEventsMap.value[b.id]?.length || 0) - (merchantEventsMap.value[a.id]?.length || 0)
      case 'events-asc':
        return (merchantEventsMap.value[a.id]?.length || 0) - (merchantEventsMap.value[b.id]?.length || 0)
      default:
        return 0
    }
  })

  return filtered
})

// Helper functions
const getMerchantRating = (merchantId: string): number => {
  return reviewStore.getAverageRatingForBusiness(merchantId)
}

const getMerchantReviewCount = (merchantId: string): number => {
  return reviewStore.getReviewsForBusiness(merchantId).length
}

const getVendorName = (vendorId: string | null): string => {
  if (!vendorId) return ''
  const vendor = vendors.value.find((v: Vendor) => v.id === vendorId)
  return vendor?.vendor_name || 'Unknown Vendor'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

const getEventStatusSeverity = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'booked':
      return 'success'
    case 'open':
      return 'info'
    case 'completed':
      return 'secondary'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

// Search functions
const onSearchInput = () => {
  // Handled by v-model
}

const clearSearch = () => {
  searchQuery.value = ''
}

const clearAllFilters = () => {
  searchQuery.value = ''
  minRating.value = null
  maxDistance.value = null
  sortBy.value = 'name'
}

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || (isAuthenticated.value && minRating.value !== null) || maxDistance.value !== null)
})

const openMapUrl = (url: string | null) => {
  if (import.meta.client && url) {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.section {
  width: 100%;
}


.merchant-details-content {
  padding: 1rem 0;
}

.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Force dark theme on accordion root only - don't affect other components */
/* Custom card-like accordion styling */
:deep(.p-accordion),
:deep([data-pc-name="accordion"]) {
  background: transparent !important;
  border: none !important;
}

/* Transform accordion tabs into cards */
:deep(.p-accordion .p-accordion-tab),
:deep([data-pc-name="accordion"] [data-pc-name="accordiontab"]) {
  margin-bottom: 1rem;
  background: var(--p-surface-card) !important;
  border: 1px solid var(--p-surface-border) !important;
  border-radius: 1.25rem !important;
  box-shadow: var(--card-shadow) !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.p-accordion .p-accordion-tab:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 40px 0 rgba(0,0,0,0.55) !important;
  border-color: var(--p-primary-color) !important;
}

/* Custom header styling for card appearance */
:deep(.p-accordion .p-accordion-header) {
  padding: 1.25rem 1.5rem !important;
  border-bottom: 1px solid var(--p-surface-border) !important;
  border-radius: 1.25rem 1.25rem 0 0 !important;
}

/* Remove default link styling - PrimeVue handles colors */
:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}

:deep(.p-accordion .p-accordion-header .p-accordion-header-link:focus) {
  box-shadow: none !important;
}

/* Custom content styling */
:deep(.p-accordion .p-accordion-content) {
  padding: 1.5rem !important;
  border-top: 1px solid var(--p-surface-border) !important;
  border-radius: 0 0 1.25rem 1.25rem !important;
}

/* Override inline styles that might conflict */
:deep(.p-accordion .p-accordion-tab[style*="background"]),
:deep(.p-accordion .p-accordion-header[style*="background"]),
:deep(.p-accordion .p-accordion-content[style*="background"]) {
  background: var(--p-surface-card) !important;
  background-color: var(--p-surface-card) !important;
}

:deep(.p-rating) {
  font-size: 0.875rem;
}
</style>
