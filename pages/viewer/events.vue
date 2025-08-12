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
      </div>

      <!-- Map and Events Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <!-- Map Section (70% width) -->
        <div class="lg:col-span-7">
          <div class="relative">
            <!-- Map Container -->
            <div 
              ref="mapContainer" 
              class="w-full h-96 md:h-[600px] rounded-lg border border-gray-200 dark:border-gray-700"
            ></div>
            
            <!-- Map Controls Overlay -->
            <div class="absolute top-4 right-4 z-10">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2">
                <Button 
                  icon="pi pi-plus"
                  size="small"
                  text
                  @click="zoomIn"
                  class="w-8 h-8"
                />
                <Button 
                  icon="pi pi-minus"
                  size="small"
                  text
                  @click="zoomOut"
                  class="w-8 h-8"
                />
              </div>
            </div>
            
            <!-- Event Info Panel -->
            <div 
              v-if="selectedMapEvent"
              class="absolute bottom-4 left-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-semibold text-text-main">{{ getMerchantName(selectedMapEvent.merchant) }}</h4>
                  <p class="text-sm text-text-muted">{{ getVendorName(selectedMapEvent.vendor) }}</p>
                </div>
                <Button 
                  icon="pi pi-times"
                  size="small"
                  text
                  @click="selectedMapEvent = null"
                />
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar text-gray-400"></i>
                  <span>{{ formatDate(selectedMapEvent.start) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-clock text-gray-400"></i>
                  <span>{{ formatTime(selectedMapEvent.start) }} - {{ formatTime(selectedMapEvent.end) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-map-marker text-gray-400"></i>
                  <span>{{ selectedMapEvent.location_address || 'Location TBD' }}</span>
                </div>
              </div>
              
              <div class="flex gap-2 mt-3">
                <Button 
                  label="View Details" 
                  size="small"
                  @click="openEventDetails(selectedMapEvent)"
                />
                <Button 
                  label="Get Directions" 
                  size="small"
                  outlined
                  @click="getDirections(selectedMapEvent)"
                />
              </div>
            </div>
          </div>
          
          <!-- Map Legend -->
          <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Available Events</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span>Booked Events</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Completed Events</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Events List Section (30% width) -->
        <div class="lg:col-span-3">
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-text-main">Events List</h3>
              <p class="text-sm text-text-muted">{{ filteredEvents.length }} events found</p>
            </div>
            
            <div class="h-[600px] overflow-y-auto">
              <div 
                v-for="event in filteredEvents" 
                :key="event.id" 
                class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                :class="{ 'bg-orange-50 dark:bg-orange-900/20': selectedMapEvent?.id === event.id }"
                @click="selectEventOnMap(event)"
              >
                <div class="space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium text-text-main text-sm">{{ getMerchantName(event.merchant) }}</h4>
                      <p class="text-xs text-text-muted">{{ getVendorName(event.vendor) }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <Badge :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" size="small" />
                      <div class="flex items-center gap-1 text-xs text-text-muted">
                        <i class="pi pi-eye"></i>
                        <span>{{ event.view_count || 0 }} views</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-1 text-xs text-text-muted">
                    <div class="flex items-center gap-1">
                      <i class="pi pi-calendar"></i>
                      <span>{{ formatDate(event.start) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="pi pi-clock"></i>
                      <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="pi pi-map-marker"></i>
                      <span class="truncate">{{ event.location_address || 'Location TBD' }}</span>
                    </div>
                  </div>
                  
                  <div class="flex flex-wrap gap-1">
                    <Tag 
                      v-for="cuisine in getVendorCuisines(event.vendor).slice(0, 2)" 
                      :key="cuisine" 
                      :value="cuisine" 
                      severity="info" 
                      size="small"
                    />
                    <span v-if="getVendorCuisines(event.vendor).length > 2" class="text-xs text-text-muted">
                      +{{ getVendorCuisines(event.vendor).length - 2 }} more
                    </span>
                  </div>
                  
                  <div class="flex gap-2 pt-2">
                    <Button 
                      label="Details" 
                      size="small"
                      outlined
                      @click.stop="openEventDetails(event)"
                      class="flex-1"
                    />
                    <Button 
                      label="Directions" 
                      icon="pi pi-map" 
                      size="small"
                      outlined
                      @click.stop="getDirections(event)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import type { Event, Merchant, Vendor } from '~/types'

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
const selectedMapEvent = ref<Event | null>(null)

// Map state
const mapContainer = ref<HTMLElement>()
const map = ref<any>()
const markers = ref<any[]>([])

const viewMode = ref<'grid' | 'list' | 'map'>('grid')

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
  { label: 'Most Viewed', value: 'views' },
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
      case 'views':
        return (b.view_count || 0) - (a.view_count || 0)
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

const getDirections = (event: Event) => {
  if (event.location_address) {
    const address = encodeURIComponent(event.location_address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
  }
}

const showAllEvents = () => {
  // Clear filters to show all events
  clearFilters()
}

const selectEventOnMap = (event: Event) => {
  selectedMapEvent.value = event
  
  // Center map on the selected event if it has coordinates
  if (event.location_coordinates && map.value) {
    try {
      const coordinates = JSON.parse(event.location_coordinates)
      if (coordinates.lat && coordinates.lng) {
        map.value.setCenter({ lat: coordinates.lat, lng: coordinates.lng })
        map.value.setZoom(15)
      }
    } catch (error) {
      console.error('Invalid coordinates for event:', event.id)
    }
  }
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

// Map methods
const initializeMap = async () => {
  if (!mapContainer.value) {
    console.error('Map container not found!')
    return
  }
  
  try {
    const { Loader } = await import('@googlemaps/js-api-loader')
    const loader = new Loader({
      apiKey: useRuntimeConfig().public.gMapKey,
      version: 'weekly',
      libraries: ['places']
    })
    
    const google = await loader.load()
    
    // Create map
    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: 34.0522, lng: -118.2437 }, // Default to Los Angeles
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    })
    
    // Add event markers
    addEventMarkers()
    
    // Fit map to show all events
    if (filteredEvents.value.length > 0) {
      fitAllEvents()
    }
    
  } catch (error) {
    console.error('Failed to load Google Maps:', error)
  }
}

const addEventMarkers = () => {
  if (!map.value) return
  
  // Clear existing markers
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []
  
  filteredEvents.value.forEach(event => {
    // Get coordinates from event location_coordinates
    let coordinates = null
    
    if (event.location_coordinates) {
      try {
        coordinates = JSON.parse(event.location_coordinates)
      } catch (error) {
        console.error('Invalid coordinates for event:', event.id)
        return
      }
    }
    
    // If no coordinates, skip this event
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      console.log('No coordinates for event:', event.id)
      return
    }
    
    const marker = new google.maps.Marker({
      position: { lat: coordinates.lat, lng: coordinates.lng },
      map: map.value,
      title: getMerchantName(event.merchant),
      icon: getMarkerIcon(event.status),
      animation: google.maps.Animation.DROP
    })
    
    // Add click listener
    marker.addListener('click', () => {
      selectedMapEvent.value = event
    })
    
    markers.value.push(marker)
  })
}

const getMarkerIcon = (status: string) => {
  const colors = {
    open: '#10B981', // green
    booked: '#F59E0B', // orange
    completed: '#EF4444' // red
  }
  
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: colors[status as keyof typeof colors] || '#6B7280',
    fillOpacity: 0.8,
    strokeColor: '#FFFFFF',
    strokeWeight: 2
  }
}

const zoomIn = () => {
  if (map.value) {
    map.value.setZoom((map.value.getZoom() || 10) + 1)
  }
}

const zoomOut = () => {
  if (map.value) {
    map.value.setZoom((map.value.getZoom() || 10) - 1)
  }
}

const fitAllEvents = () => {
  if (!map.value || filteredEvents.value.length === 0) return
  
  const bounds = new google.maps.LatLngBounds()
  
  filteredEvents.value.forEach(event => {
    if (event.location_coordinates) {
      try {
        const coordinates = JSON.parse(event.location_coordinates)
        if (coordinates.lat && coordinates.lng) {
          bounds.extend({ lat: coordinates.lat, lng: coordinates.lng })
        }
      } catch (error) {
        console.error('Invalid coordinates for event:', event.id)
      }
    }
  })
  
  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds)
  }
}

onMounted(async () => {
  await loadEvents()
  getUserLocation()
  
  await nextTick()
  
  setTimeout(() => {
    initializeMap()
  }, 100)
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