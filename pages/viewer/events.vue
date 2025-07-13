<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Upcoming Food Truck Events</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Discover where your favorite food trucks will be serving next. 
        Find events near you and never miss out on amazing food!
      </p>
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card class="text-center">
        <template #content>
          <div class="text-3xl font-bold text-orange-500 mb-2">{{ totalEvents }}</div>
          <div class="text-gray-600">Available Events</div>
        </template>
      </Card>
      <Card class="text-center">
        <template #content>
          <div class="text-3xl font-bold text-blue-500 mb-2">{{ totalMerchants }}</div>
          <div class="text-gray-600">Participating Establishments</div>
        </template>
      </Card>
      <Card class="text-center">
        <template #content>
          <div class="text-3xl font-bold text-green-500 mb-2">{{ totalVendors }}</div>
          <div class="text-gray-600">Food Truck Vendors</div>
        </template>
      </Card>
    </div>

    <!-- Advanced Search and Filter Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-lg font-semibold mb-4">Search & Filter Events</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Location Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <InputText 
            v-model="filters.location" 
            placeholder="City, zip code, or address"
            class="w-full"
          />
        </div>
        
        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <Calendar 
            v-model="filters.dateRange" 
            selectionMode="range"
            placeholder="Select date range"
            class="w-full"
            :showIcon="true"
          />
        </div>
        
        <!-- Cuisine Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
          <MultiSelect 
            v-model="filters.cuisines" 
            :options="cuisineOptions"
            placeholder="Select cuisines"
            class="w-full"
            :showClear="true"
          />
        </div>
        
        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <Dropdown 
            v-model="filters.sortBy" 
            :options="sortOptions"
            placeholder="Sort by"
            class="w-full"
          />
        </div>
      </div>
      
      <div class="flex justify-between items-center mt-4">
        <Button 
          label="Clear Filters" 
          outlined
          @click="clearFilters"
        />
        <div class="text-sm text-gray-600">
          Showing {{ filteredEvents.length }} of {{ totalEvents }} events
        </div>
      </div>
    </div>

    <!-- Events List -->
    <div v-if="filteredEvents.length > 0" class="space-y-6">
      <Card 
        v-for="event in filteredEvents" 
        :key="event.id"
        class="hover:shadow-lg transition-shadow duration-300"
      >
        <template #content>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Event Image -->
            <div class="lg:col-span-1">
              <div class="relative">
                <NuxtImg
                  :src="getMerchantImage(event.merchant)"
                  :alt="getMerchantName(event.merchant)"
                  class="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                />
                <div class="absolute top-2 right-2">
                  <Tag :value="getStatusDisplay(event.status)" :severity="getStatusSeverity(event.status)" />
                </div>
              </div>
            </div>
            
            <!-- Event Details -->
            <div class="lg:col-span-2">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    {{ getMerchantName(event.merchant) }}
                  </h3>
                  <div class="flex items-center text-gray-600 mb-2">
                    <i class="pi pi-map-marker mr-2"></i>
                    <span>{{ event.location_address || 'Location TBD' }}</span>
                  </div>
                </div>
                <Button 
                  label="View Details" 
                  icon="pi pi-external-link"
                  outlined
                  @click="openEventDetails(event)"
                />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="flex items-center text-gray-600">
                  <i class="pi pi-calendar mr-2"></i>
                  <span>{{ formatDate(event.start) }}</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <i class="pi pi-clock mr-2"></i>
                  <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                </div>
              </div>
              
              <div v-if="event.notes" class="mb-4">
                <p class="text-gray-600">{{ event.notes }}</p>
              </div>
              
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <Badge 
                    v-if="getMerchantCuisine(event.merchant)"
                    :value="getMerchantCuisine(event.merchant)"
                    severity="info"
                  />
                  <Badge 
                    v-if="getDistance(event.location_coordinates)"
                    :value="getDistance(event.location_coordinates)"
                    severity="secondary"
                  />
                </div>
                
                <div class="flex space-x-2">
                  <Button 
                    v-if="event.status === 'open'"
                    label="Request Event" 
                    icon="pi pi-send"
                    @click="requestEvent(event)"
                  />
                  <Button 
                    label="Get Directions" 
                    icon="pi pi-map"
                    outlined
                    @click="getDirections(event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- No Events Found -->
    <div v-else-if="!loading" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <i class="pi pi-search text-6xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
      <p class="text-gray-500 mb-4">Try adjusting your search criteria or check back later for new events.</p>
      <Button 
        label="Clear All Filters" 
        @click="clearFilters"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <ProgressSpinner />
      <p class="mt-4 text-gray-600">Loading events...</p>
    </div>

    <!-- Event Details Dialog -->
    <Dialog 
      v-model:visible="showEventDialog" 
      modal 
      :header="selectedEvent ? getMerchantName(selectedEvent.merchant) : 'Event Details'"
      :style="{ width: '60rem' }"
    >
      <div v-if="selectedEvent" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-3">Event Information</h4>
            <div class="space-y-3">
              <div>
                <span class="font-medium">Date:</span>
                <span class="ml-2">{{ formatFullDate(selectedEvent.start) }}</span>
              </div>
              <div>
                <span class="font-medium">Time:</span>
                <span class="ml-2">{{ formatTime(selectedEvent.start) }} - {{ formatTime(selectedEvent.end) }}</span>
              </div>
              <div>
                <span class="font-medium">Location:</span>
                <span class="ml-2">{{ selectedEvent.location_address || 'TBD' }}</span>
              </div>
              <div v-if="selectedEvent.notes">
                <span class="font-medium">Notes:</span>
                <p class="ml-2 mt-1 text-gray-600">{{ selectedEvent.notes }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="selectedMerchant">
            <h4 class="font-semibold mb-3">Establishment</h4>
            <div class="space-y-3">
              <div>
                <span class="font-medium">Name:</span>
                <span class="ml-2">{{ selectedMerchant.merchant_name }}</span>
              </div>
              <div v-if="selectedMerchant.merchant_description">
                <span class="font-medium">Description:</span>
                <p class="ml-2 mt-1 text-gray-600">{{ selectedMerchant.merchant_description }}</p>
              </div>
              <div v-if="selectedMerchant.phone">
                <span class="font-medium">Phone:</span>
                <span class="ml-2">{{ selectedMerchant.phone }}</span>
              </div>
              <div v-if="selectedMerchant.email">
                <span class="font-medium">Email:</span>
                <span class="ml-2">{{ selectedMerchant.email }}</span>
              </div>
              <div v-if="selectedMerchant.website">
                <span class="font-medium">Website:</span>
                <a :href="selectedMerchant.website" target="_blank" class="ml-2 text-blue-600 hover:underline">
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2">
          <Button 
            v-if="selectedEvent.status === 'open'"
            label="Request This Event" 
            icon="pi pi-send"
            @click="requestEvent(selectedEvent)"
          />
          <Button 
            label="Get Directions" 
            icon="pi pi-map"
            outlined
            @click="getDirections(selectedEvent)"
          />
          <Button 
            label="Close" 
            outlined
            @click="showEventDialog = false"
          />
        </div>
      </div>
    </Dialog>

    <!-- Call to Action -->
    <div v-if="!isAuthenticated" class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 mt-12 text-white text-center">
      <h3 class="text-2xl font-semibold mb-4">Join the DropBy Community</h3>
      <p class="text-lg mb-6">Are you a food truck owner or establishment looking to connect?</p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          label="Sign Up as Food Truck Vendor" 
          severity="contrast"
          size="large"
          @click="navigateToSignup('vendor')"
        />
        <Button 
          label="Sign Up as Establishment" 
          severity="contrast"
          outlined
          size="large"
          @click="navigateToSignup('merchant')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const { isAuthenticated } = useAuth()

// Reactive data
const events = ref([])
const merchants = ref([])
const vendors = ref([])
const loading = ref(true)
const showEventDialog = ref(false)
const selectedEvent = ref(null)
const selectedMerchant = ref(null)
const userLocation = ref(null)

// Filters
const filters = ref({
  location: '',
  dateRange: null,
  cuisines: [],
  sortBy: 'date'
})

// Options
const cuisineOptions = ref([
  'American', 'Mexican', 'Italian', 'Asian', 'Mediterranean', 
  'BBQ', 'Seafood', 'Vegetarian', 'Desserts', 'Coffee', 'Other'
])

const sortOptions = ref([
  { label: 'Date (Earliest)', value: 'date' },
  { label: 'Date (Latest)', value: 'date-desc' },
  { label: 'Distance', value: 'distance' },
  { label: 'Establishment Name', value: 'name' }
])

// Computed properties
const totalEvents = computed(() => events.value.length)
const totalMerchants = computed(() => merchants.value.length)
const totalVendors = computed(() => vendors.value.length)

const filteredEvents = computed(() => {
  let filtered = events.value.filter(event => {
    // Only show open events to public
    if (event.status !== 'open') return false
    
    // Filter by location
    if (filters.value.location && event.location_address) {
      const location = event.location_address.toLowerCase()
      const search = filters.value.location.toLowerCase()
      if (!location.includes(search)) return false
    }
    
    // Filter by date range
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const eventDate = new Date(event.start)
      const startDate = new Date(filters.value.dateRange[0])
      const endDate = new Date(filters.value.dateRange[1])
      if (eventDate < startDate || eventDate > endDate) return false
    }
    
    return true
  })
  
  // Sort events
  filtered.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'date':
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      case 'date-desc':
        return new Date(b.start).getTime() - new Date(a.start).getTime()
      case 'name':
        return getMerchantName(a.merchant).localeCompare(getMerchantName(b.merchant))
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
    // Load events
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'open')
      .gte('start', new Date().toISOString())
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
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant ? merchant.merchant_name : 'Unknown Establishment'
}

const getMerchantImage = (merchantId: string) => {
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant?.avatar_url || 'https://placehold.co/400x300?text=Establishment'
}

const getMerchantCuisine = (merchantId: string) => {
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant?.cuisine_type || null
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'open':
      return 'AVAILABLE'
    case 'booked':
      return 'BOOKED'
    case 'closed':
      return 'CLOSED'
    default:
      return status.toUpperCase()
  }
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'open':
      return 'success'
    case 'booked':
      return 'info'
    case 'closed':
      return 'secondary'
    default:
      return 'info'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatFullDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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

const getDistance = (coordinates: string) => {
  if (!coordinates || !userLocation.value) return null
  
  try {
    const coords = JSON.parse(coordinates)
    const distance = calculateDistance(
      userLocation.value.lat,
      userLocation.value.lng,
      coords.lat,
      coords.lng
    )
    return `${distance.toFixed(1)}mi`
  } catch (error) {
    return null
  }
}

const getDistanceFromUser = (coordinates: string) => {
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

const openEventDetails = (event: any) => {
  selectedEvent.value = event
  selectedMerchant.value = merchants.value.find(m => m.id === event.merchant)
  showEventDialog.value = true
}

const requestEvent = (event: any) => {
  if (!isAuthenticated.value) {
    navigateTo('/get-started')
    return
  }
  navigateTo('/vendor/dashboard')
}

const getDirections = (event: any) => {
  if (event.location_address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_address)}`
    window.open(url, '_blank')
  }
}

const clearFilters = () => {
  filters.value = {
    location: '',
    dateRange: null,
    cuisines: [],
    sortBy: 'date'
  }
}

const navigateToSignup = (type: string) => {
  navigateTo(`/get-started?type=${type}`)
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

// Load data on mount
onMounted(() => {
  loadEvents()
  getUserLocation()
})
</script> 