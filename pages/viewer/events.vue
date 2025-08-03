<template>
  <div class="page-content">
    <div class="section">
      <div class="text-center mb-8">
        <h1 class="font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Find Amazing Food Truck Events
        </h1>
        <p class="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
          Discover where your favorite food trucks will be serving next. 
          Find events near you and never miss out on amazing food experiences!
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card class="stat-card hover:scale-105 transition-transform duration-200">
          <template #content>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{{ totalEvents }}</div>
              <div class="text-text-muted">Available Events</div>
              <div class="text-xs text-text-muted mt-1">Updated in real-time</div>
            </div>
          </template>
        </Card>
        <Card class="stat-card hover:scale-105 transition-transform duration-200">
          <template #content>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-blue-500 mb-2">{{ totalMerchants }}</div>
              <div class="text-text-muted">Participating Establishments</div>
              <div class="text-xs text-text-muted mt-1">Restaurants & venues</div>
            </div>
          </template>
        </Card>
        <Card class="stat-card hover:scale-105 transition-transform duration-200">
          <template #content>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-green-500 mb-2">{{ totalVendors }}</div>
              <div class="text-text-muted">Food Truck Vendors</div>
              <div class="text-xs text-text-muted mt-1">Diverse cuisines</div>
            </div>
          </template>
        </Card>
      </div>

      <Card class="mb-8">
        <template #content>
          <div class="space-y-6">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
              </div>
              <InputText 
                v-model="filters.keyword" 
                placeholder="Search events, food trucks, cuisines, or locations..."
                class="w-full pl-10 pr-4 py-3 text-lg"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-text-main mb-2">Cuisine Type</label>
                <MultiSelect 
                  v-model="filters.cuisines" 
                  :options="cuisineOptions" 
                  placeholder="All cuisines" 
                  class="w-full"
                  :showClear="true"
                  display="chip"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-main mb-2">Date Range</label>
                <Calendar 
                  v-model="filters.dateRange" 
                  selectionMode="range" 
                  placeholder="Select dates"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-main mb-2">Distance</label>
                <Dropdown 
                  v-model="filters.distance" 
                  :options="distanceOptions" 
                  optionLabel="label" 
                  optionValue="value" 
                  placeholder="Any distance"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-main mb-2">Sort By</label>
                <Dropdown 
                  v-model="filters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value" 
                  placeholder="Sort by"
                  class="w-full"
                />
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="text-sm text-text-muted">
                Showing {{ filteredEvents.length }} of {{ totalEvents }} events
                <span v-if="filters.keyword || filters.cuisines.length > 0 || filters.dateRange" class="text-blue-600 dark:text-blue-400">
                  (filtered)
                </span>
              </div>
              <div class="flex gap-2">
                <Button 
                  label="Clear Filters" 
                  outlined 
                  @click="clearFilters"
                  :disabled="!hasActiveFilters"
                />
                <Button 
                  label="Save Search" 
                  severity="secondary"
                  outlined
                  @click="saveSearch"
                  :disabled="!hasActiveFilters"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div v-if="filteredEvents.length > 0" class="space-y-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-text-main">Events Near You</h2>
        <div class="flex gap-2">
          <Button 
            :icon="viewMode === 'grid' ? 'pi pi-list' : 'pi pi-th-large'"
            @click="toggleViewMode"
            outlined
            size="small"
            :label="viewMode === 'grid' ? 'List View' : 'Grid View'"
          />
        </div>
      </div>

      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="event in filteredEvents" 
          :key="event.id" 
          class="event-card hover:shadow-lg transition-all duration-200 cursor-pointer"
          @click="openEventDetails(event)"
        >
          <template #content>
            <div class="relative">
              <div class="relative mb-4">
                <div class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <NuxtImg
                    :src="getMerchantImage(event.merchant)"
                    :alt="getMerchantName(event.merchant)"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="absolute top-3 right-3">
                  <Badge :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" />
                </div>
                <div class="absolute -bottom-4 -right-4">
                  <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
                    <NuxtImg
                      :src="getVendorImage(event.vendor)"
                      :alt="getVendorName(event.vendor)"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <h3 class="font-semibold text-lg text-text-main mb-1">
                    {{ getMerchantName(event.merchant) }}
                  </h3>
                  <p class="text-text-muted text-sm">{{ getVendorName(event.vendor) }}</p>
                </div>

                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-gray-400"></i>
                    <span>{{ formatDate(event.start) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-clock text-gray-400"></i>
                    <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-map-marker text-gray-400"></i>
                    <span>{{ event.location_address || 'Location TBD' }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap gap-1">
                  <Tag 
                    v-for="cuisine in getVendorCuisines(event.vendor)" 
                    :key="cuisine" 
                    :value="cuisine" 
                    severity="info" 
                    size="small"
                  />
                </div>

                <div class="flex gap-2 pt-2">
                  <Button 
                    label="Details" 
                    outlined 
                    size="small"
                    @click.stop="openEventDetails(event)"
                    class="flex-1"
                  />
                  <Button 
                    label="Directions" 
                    icon="pi pi-map" 
                    outlined 
                    size="small"
                    @click.stop="openEventDetails(event)"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div v-else class="space-y-4">
        <Card 
          v-for="event in filteredEvents" 
          :key="event.id" 
          class="event-card hover:shadow-lg transition-all duration-200"
        >
          <template #content>
            <div class="flex flex-col md:flex-row gap-4">
              <div class="relative md:w-1/3">
                <div class="w-full h-48 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <NuxtImg
                    :src="getMerchantImage(event.merchant)"
                    :alt="getMerchantName(event.merchant)"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="absolute top-3 right-3">
                  <Badge :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" />
                </div>
              </div>

              <div class="flex-1 space-y-4">
                <div>
                  <h3 class="font-semibold text-xl text-text-main mb-2">
                    {{ getMerchantName(event.merchant) }} | {{ getVendorName(event.vendor) }}
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-muted">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-calendar"></i>
                      <span>{{ formatDate(event.start) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-clock"></i>
                      <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ event.location_address || 'Location TBD' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-star"></i>
                      <span>4.5 ★ (24 reviews)</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Tag 
                    v-for="cuisine in getVendorCuisines(event.vendor)" 
                    :key="cuisine" 
                    :value="cuisine" 
                    severity="info"
                  />
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                  <Button 
                    label="View Details" 
                    @click="openEventDetails(event)"
                    class="flex-1"
                  />
                  <Button 
                    label="Get Directions" 
                    icon="pi pi-map" 
                    outlined
                    @click="openEventDetails(event)"
                  />
                  <Button 
                    label="Share Event" 
                    icon="pi pi-share-alt" 
                    outlined
                    @click="openEventDetails(event)"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div v-else-if="!loading" class="text-center py-12">
      <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-search text-4xl text-gray-400"></i>
      </div>
      <h3 class="text-2xl font-semibold text-text-main mb-2">No events found</h3>
      <p class="text-text-muted mb-6 max-w-md mx-auto">
        Try adjusting your search criteria or check back later for new events in your area.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button label="Clear All Filters" @click="clearFilters" />
        <Button label="Browse All Events" @click="browseAllEvents" outlined />
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <ProgressSpinner size="large" />
      <p class="mt-4 text-text-muted">Loading events...</p>
    </div>

    <EventDetailsDialog 
      :visible="showEventDialog" 
      :event="selectedEvent"
      @update:visible="showEventDialog = $event"
    />
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '~/components/BaseIcon.vue'

interface Event {
  id: string
  merchant: string
  vendor: string
  start: string
  end: string
  status: string
  location_address?: string
  location_coordinates?: string
  notes?: string
}

interface Merchant {
  id: string
  merchant_name: string
  merchant_description?: string
  avatar_url?: string
  phone?: string
  email?: string
  website?: string
}

interface Vendor {
  id: string
  vendor_name: string
  vendor_description?: string
  avatar_url?: string
  cuisine?: string[]
  phone?: string
  email?: string
  website?: string
}

interface UserLocation {
  lat: number
  lng: number
}

const supabase = useSupabaseClient()
const { isAuthenticated, userType } = useAuth()

const events = ref<Event[]>([])
const merchants = ref<Merchant[]>([])
const vendors = ref<Vendor[]>([])
const loading = ref(true)
const showEventDialog = ref(false)
const selectedEvent = ref<Event | null>(null)
const selectedMerchant = ref<Merchant | null>(null)
const selectedVendor = ref<Vendor | null>(null)
const userLocation = ref<UserLocation | null>(null)

const viewMode = ref<'grid' | 'list'>('grid')

const filters = ref({
  keyword: '',
  cuisines: [] as string[],
  dateRange: null as any,
  distance: null as any,
  sortBy: 'date'
})

// Options
const cuisineOptions = ref([
  'Alcohol', 'American', 'Asian fusion', 'Bakery', 'Breaksfast', 
  'Coffee', 'Comfort food', 'Dessert', 'Healthy food', 'Ice cream', 
  'Italian', 'Latin', 'Mediterranean', 'Mexican', 'Pizza', 
  'Sandwich', 'Seafood', 'Snacks', 'Tacos', 'Vegan'
])

const sortOptions = ref([
  { label: 'Distance (Closest)', value: 'distance' },
  { label: 'Establishment Name (A-Z)', value: 'merchant' },
  { label: 'Food Truck Name (A-Z)', value: 'vendor' },
  { label: 'Date (Earliest)', value: 'date' },
  { label: 'Date (Latest)', value: 'date-desc' }
])

const distanceOptions = ref([
  { label: 'Any distance', value: null },
  { label: 'Within 5 miles', value: 5 },
  { label: 'Within 10 miles', value: 10 },
  { label: 'Within 25 miles', value: 25 },
  { label: 'Within 50 miles', value: 50 }
])

// Computed properties
const totalEvents = computed(() => events.value.length)
const totalMerchants = computed(() => merchants.value.length)
const totalVendors = computed(() => vendors.value.length)

const filteredEvents = computed(() => {
  let filtered = events.value.filter((event: Event) => {
    // Show booked events that are currently happening or haven't started yet
    if (event.status !== 'booked') return false
    
    const now = new Date()
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    
    // Show events that haven't started yet OR are currently happening (started but not ended)
    if (eventStart > now || (eventStart <= now && eventEnd > now)) {
      // Filter by keyword search
      if (filters.value.keyword) {
        const keyword = filters.value.keyword.toLowerCase()
        const eventName = getMerchantName(event.merchant).toLowerCase()
        const eventLocation = event.location_address?.toLowerCase() || ''
        const eventVendor = getVendorName(event.vendor).toLowerCase()

        if (!eventName.includes(keyword) && !eventLocation.includes(keyword) && !eventVendor.includes(keyword)) {
          return false
        }
      }
      
      // Filter by cuisine type
      if (filters.value.cuisines.length > 0) {
        const vendor = vendors.value.find((v: Vendor) => v.id === event.vendor)
        if (!vendor?.cuisine || !vendor.cuisine.some((cuisine: string) => filters.value.cuisines.includes(cuisine))) {
          return false
        }
      }
      
      return true
    }
    
    return false
  })
  
  // Sort events
  filtered.sort((a: Event, b: Event) => {
    switch (filters.value.sortBy) {
      case 'date':
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'merchant':
        return getMerchantName(a.merchant).localeCompare(getMerchantName(b.merchant))
      case 'vendor':
        return getVendorName(a.vendor).localeCompare(getVendorName(b.vendor))
      case 'distance':
        if (userLocation.value) {
          const distA = getDistanceFromUser(a.location_coordinates)
          const distB = getDistanceFromUser(b.location_coordinates)
          return distA - distB
        }
        return 0
      default:
        return 0
    }
  })
  
  return filtered
})

// Methods
const loadEvents = async () => {
  loading.value = true
  try {
    // Load events - get all booked events and let frontend filtering handle the time logic
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'booked')
      .order('start', { ascending: true })
    
    if (eventData) {
      events.value = eventData
    }
    
    // Load merchants
    const { data: merchantData } = await supabase
      .from('merchants')
      .select('*')
    
    if (merchantData) {
      merchants.value = merchantData
    }
    
    // Load vendors
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*')
    
    if (vendorData) {
      vendors.value = vendorData
    }
  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    loading.value = false
  }
}

const getMerchantName = (merchantId: string) => {
  const merchant = merchants.value.find((m: Merchant) => m.id === merchantId)
  return merchant ? merchant.merchant_name : 'Unknown Establishment'
}

const getMerchantImage = (merchantId: string) => {
  const merchant = merchants.value.find((m: Merchant) => m.id === merchantId)
  return merchant?.avatar_url || 'https://placehold.co/400x300?text=Establishment'
}



const getVendorName = (vendorId: string) => {
  const vendor = vendors.value.find((v: Vendor) => v.id === vendorId)
  return vendor ? vendor.vendor_name : 'Unknown Food Truck'
}

const getVendorImage = (vendorId: string) => {
  const vendor = vendors.value.find((v: Vendor) => v.id === vendorId)
  return vendor?.avatar_url || 'https://placehold.co/400x300?text=Food+Truck'
}

const getVendorCuisine = (vendorId: string) => {
  const vendor = vendors.value.find((v: Vendor) => v.id === vendorId)
  if (!vendor?.cuisine || vendor.cuisine.length === 0) return null
  // Return the first cuisine type for display purposes
  return vendor.cuisine[0]
}

const getVendorCuisines = (vendorId: string) => {
  const vendor = vendors.value.find((v: Vendor) => v.id === vendorId)
  return vendor?.cuisine || []
}

const getEventStatus = (event: any) => {
  const now = new Date()
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  
  // Event is currently happening (started but not ended)
  if (eventStart <= now && eventEnd > now) {
    return 'LIVE'
  }
  // Event hasn't started yet
  else {
    return 'UPCOMING'
  }
}

const getEventStatusSeverity = (event: any) => {
  const now = new Date()
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  
  // Event is currently happening (started but not ended)
  if (eventStart <= now && eventEnd > now) {
    return 'danger' // Red for live events
  }
  // Event hasn't started yet
  else {
    return 'success' // Green for upcoming events
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getDistanceFromUser = (coordinates: string | undefined) => {
  if (!coordinates || !userLocation.value) return Infinity
  
  try {
    const coords = JSON.parse(coordinates)
    return calculateDistance(
      userLocation.value.lat,
      userLocation.value.lng,
      coords.lat,
      coords.lng
    )
  } catch (error) {
    return Infinity
  }
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const openEventDetails = (event: Event) => {
  selectedEvent.value = event
  selectedMerchant.value = merchants.value.find((m: Merchant) => m.id === event.merchant) || null
  selectedVendor.value = vendors.value.find((v: Vendor) => v.id === event.vendor) || null
  showEventDialog.value = true
}

const clearFilters = () => {
  filters.value = {
    keyword: '',
    cuisines: [],
    dateRange: null,
    distance: null,
    sortBy: 'date'
  }
}

const hasActiveFilters = computed(() => {
  return filters.value.keyword || 
         filters.value.cuisines.length > 0 || 
         filters.value.dateRange || 
         filters.value.distance
})

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const saveSearch = () => {
  // TODO: Implement saved searches functionality
  console.log('Save search:', filters.value)
}

const browseAllEvents = () => {
  clearFilters()
}

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      },
      (error) => {
        console.log('Geolocation error:', error)
      }
    )
  }
}

const filterEvents = () => {
  console.log('Filtering events...')
}

// Set page title
useSeoMeta({ title: 'Events' })

// Load data on mount
onMounted(() => {
  loadEvents()
  getUserLocation()
})
</script> 

<style scoped>
.cta-primary-btn {
  background-color: #1a1a1a !important;
  border: 2px solid #1a1a1a !important;
  color: #ffffff !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  width: 100% !important;
}

.cta-primary-btn:hover {
  background-color: #000000 !important;
  border-color: #000000 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
}

.cta-secondary-btn {
  background-color: transparent !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  width: 100% !important;
}

.cta-secondary-btn:hover {
  background-color: rgba(255,255,255,0.1) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}
</style> 