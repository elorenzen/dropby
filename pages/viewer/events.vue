<template>
  <div class="page-content">
    <div class="section">
      <!-- Header Section -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 class="font-bold" style="font-size: 2rem; margin-bottom: 1rem;">Upcoming Food Truck Events</h1>
        <p style="font-size: 1.2rem; color: var(--text-color-secondary); max-width: 600px; margin: 0 auto;">
          Discover where your favorite food trucks will be serving next. 
          Find events near you and never miss out on amazing food!
        </p>
      </div>

      <!-- Stats Section -->
      <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;">
        <Card style="text-align: center; min-width: 180px;">
          <template #content>
            <div class="font-bold" style="font-size: 2rem; color: #FF8906; margin-bottom: 0.5rem;">{{ totalEvents }}</div>
            <div>Available Events</div>
          </template>
        </Card>
        <Card style="text-align: center; min-width: 180px;">
          <template #content>
            <div class="font-bold" style="font-size: 2rem; color: #2196F3; margin-bottom: 0.5rem;">{{ totalMerchants }}</div>
            <div>Participating Establishments</div>
          </template>
        </Card>
        <Card style="text-align: center; min-width: 180px;">
          <template #content>
            <div class="font-bold" style="font-size: 2rem; color: #4CAF50; margin-bottom: 0.5rem;">{{ totalVendors }}</div>
            <div>Food Truck Vendors</div>
          </template>
        </Card>
      </div>

      <!-- Advanced Search and Filter Section -->
      <Card style="margin-bottom: 2rem;">
        <template #content>
          <div style="margin-bottom: 1rem; font-weight: bold; font-size: 1.1rem;">Search & Filter Events</div>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
            <div style="flex: 1 1 200px; min-width: 200px;">
              <label>Location</label>
              <InputText v-model="filters.location" placeholder="City, zip code, or address" class="w-full" />
            </div>
            <div style="flex: 1 1 200px; min-width: 200px;">
              <label>Date Range</label>
              <Calendar v-model="filters.dateRange" selectionMode="range" placeholder="Select date range" class="w-full" :showIcon="true" />
            </div>
            <div style="flex: 1 1 200px; min-width: 200px;">
              <label>Cuisine Type</label>
              <MultiSelect v-model="filters.cuisines" :options="cuisineOptions" placeholder="Select cuisines" class="w-full" :showClear="true" />
            </div>
            <div style="flex: 1 1 200px; min-width: 200px;">
              <label>Sort By</label>
              <Dropdown v-model="filters.sortBy" :options="sortOptions" placeholder="Sort by" class="w-full" />
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <Button label="Clear Filters" outlined @click="clearFilters" />
            <div style="font-size: 0.95rem; color: var(--text-color-secondary);">
              Showing {{ filteredEvents.length }} of {{ totalEvents }} events
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Events List -->
    <div v-if="filteredEvents.length > 0" style="display: flex; flex-direction: column; gap: 2rem;">
      <Card v-for="event in filteredEvents" :key="event.id" style="box-shadow: var(--card-shadow);">
        <template #content>
          <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start;">
            <!-- Event Image -->
            <div style="flex: 1 1 250px; min-width: 250px; max-width: 350px;">
              <div style="position: relative;">
                <!-- Establishment Image (Background) -->
                <div style="position: relative;">
                  <NuxtImg
                    :src="getMerchantImage(event.merchant)"
                    :alt="getMerchantName(event.merchant)"
                    style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px;"
                    loading="lazy"
                  />
                  <!-- Event Status Badge -->
                  <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                    <Badge :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" />
                  </div>
                </div>
                <!-- Food Truck Avatar (Overlay) -->
                <div style="position: absolute; bottom: -20px; right: -20px; z-index: 20;">
                  <NuxtImg
                    :src="getVendorImage(event.vendor)"
                    :alt="getVendorName(event.vendor)"
                    style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #ff9800; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <!-- Event Details -->
            <div style="flex: 2 1 350px; min-width: 250px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                  <div class="font-bold" style="font-size: 1.2rem; margin-bottom: 0.5rem;">{{ getMerchantName(event.merchant) }} | {{ getVendorName(event.vendor) }}</div>
                  <div style="color: var(--text-color-secondary); margin-bottom: 0.5rem;">
                    <i class="pi pi-map-marker" style="margin-right: 0.5rem;"></i>
                    <span>{{ event.location_address || 'Location TBD' }}</span>
                  </div>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <Badge v-if="getDistance(event.location_coordinates)" :value="getDistance(event.location_coordinates)" severity="secondary" />
                    <Button @click="openEventDetails(event)" outlined>
                      <template #icon>
                        <BaseIcon name="eye" color="#ff9800" size="20" />
                      </template>
                    </Button>
                  </div>
                </div>
                
              </div>
              <div style="display: flex; gap: 2rem; margin-bottom: 1rem;">
                <div style="color: var(--text-color-secondary);">
                  <i class="pi pi-calendar" style="margin-right: 0.5rem;"></i>
                  <span>{{ formatDate(event.start) }}</span>
                </div>
                <div style="color: var(--text-color-secondary);">
                  <i class="pi pi-clock" style="margin-right: 0.5rem;"></i>
                  <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <Badge v-if="getVendorCuisine(event.vendor)" :value="getVendorCuisine(event.vendor)" severity="info" />
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <Button v-if="isAuthenticated && userType === 'vendor' && event.status === 'open'" label="Request Event" outlined @click="requestEvent(event)">
                    <template #icon>
                      <BaseIcon name="send" color="#ff9800" size="20" />
                    </template>
                  </Button>
                  <Button label="Get Directions" icon="pi pi-map" outlined @click="getDirections(event)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- No Events Found -->
    <div v-else-if="!loading" style="text-align: center; padding: 3rem 0;">
      <div style="color: #888; margin-bottom: 1rem;">
        <i class="pi pi-search" style="font-size: 3rem;"></i>
      </div>
      <div class="font-bold" style="font-size: 1.2rem; margin-bottom: 0.5rem;">No events found</div>
      <p style="color: #888; margin-bottom: 1rem;">Try adjusting your search criteria or check back later for new events.</p>
      <Button label="Clear All Filters" @click="clearFilters" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" style="text-align: center; padding: 3rem 0;">
      <ProgressSpinner />
      <p style="margin-top: 1rem; color: var(--text-color-secondary);">Loading events...</p>
    </div>

    <!-- Event Details Dialog -->
    <Dialog v-model:visible="showEventDialog" modal :header="selectedEvent ? `${getMerchantName(selectedEvent.merchant)} | ${getVendorName(selectedEvent.vendor)}` : 'Event Details'" :style="{ width: '60rem' }">
      <div v-if="selectedEvent" style="display: flex; flex-direction: column; gap: 2rem;">
        <div style="display: flex; flex-wrap: wrap; gap: 2rem;">
          <div style="flex: 1 1 300px; min-width: 250px;">
            <h4 class="font-bold" style="margin-bottom: 1rem;">Event Information</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div><span class="font-bold">Date:</span> <span>{{ formatFullDate(selectedEvent.start) }}</span></div>
              <div><span class="font-bold">Time:</span> <span>{{ formatTime(selectedEvent.start) }} - {{ formatTime(selectedEvent.end) }}</span></div>
              <div><span class="font-bold">Location:</span> <span>{{ selectedEvent.location_address || 'TBD' }}</span></div>
              <div v-if="selectedEvent.notes"><span class="font-bold">Notes:</span> <span>{{ selectedEvent.notes }}</span></div>
            </div>
          </div>
          <div v-if="selectedMerchant" style="flex: 1 1 300px; min-width: 250px;">
            <h4 class="font-bold" style="margin-bottom: 1rem;">Establishment</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div><span class="font-bold">Name:</span> <span>{{ selectedMerchant.merchant_name }}</span></div>
              <div v-if="selectedMerchant.merchant_description"><span class="font-bold">Description:</span> <span>{{ selectedMerchant.merchant_description }}</span></div>
              <div v-if="selectedMerchant.phone"><span class="font-bold">Phone:</span> <span>{{ selectedMerchant.phone }}</span></div>
              <div v-if="selectedMerchant.email"><span class="font-bold">Email:</span> <span>{{ selectedMerchant.email }}</span></div>
              <div v-if="selectedMerchant.website"><span class="font-bold">Website:</span> <a :href="selectedMerchant.website" target="_blank">Visit Website</a></div>
            </div>
          </div>
          <div v-if="selectedVendor" style="flex: 1 1 300px; min-width: 250px;">
            <h4 class="font-bold" style="margin-bottom: 1rem;">Food Truck</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div><span class="font-bold">Name:</span> <span>{{ selectedVendor.vendor_name }}</span></div>
              <div v-if="selectedVendor.vendor_description"><span class="font-bold">Description:</span> <span>{{ selectedVendor.vendor_description }}</span></div>
              <div v-if="selectedVendor.phone"><span class="font-bold">Phone:</span> <span>{{ selectedVendor.phone }}</span></div>
              <div v-if="selectedVendor.email"><span class="font-bold">Email:</span> <span>{{ selectedVendor.email }}</span></div>
              <div v-if="selectedVendor.website"><span class="font-bold">Website:</span> <a :href="selectedVendor.website" target="_blank">Visit Website</a></div>
            </div>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 1rem;">
          <Button v-if="isAuthenticated && userType === 'vendor' && selectedEvent.status === 'open'" label="Request This Event" icon="pi pi-send" @click="requestEvent(selectedEvent)" />
          <Button label="Get Directions" icon="pi pi-map" outlined @click="getDirections(selectedEvent)" />
          <Button label="Close" outlined @click="showEventDialog = false" />
        </div>
      </div>
    </Dialog>

    <!-- Call to Action -->
    <div v-if="!isAuthenticated" style="background: linear-gradient(90deg, #FF8906 0%, #FFB86B 100%); border-radius: 12px; padding: 2rem; margin-top: 3rem; text-align: center; color: #fff;">
      <h3 class="font-bold" style="font-size: 1.5rem; margin-bottom: 1rem;">Join the DropBy Community</h3>
      <p style="font-size: 1.1rem; margin-bottom: 2rem;">Are you a food truck owner or establishment looking to connect?</p>
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px; margin: 0 auto;">
        <Button label="Sign Up as Food Truck Vendor" severity="contrast" style="font-size: 1.1rem;" @click="navigateToSignup('vendor')" />
        <Button label="Sign Up as Establishment" severity="contrast" outlined style="font-size: 1.1rem;" @click="navigateToSignup('merchant')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '~/components/BaseIcon.vue'
const supabase = useSupabaseClient()
const { isAuthenticated, userType } = useAuth()

// Reactive data
const events = ref([])
const merchants = ref([])
const vendors = ref([])
const loading = ref(true)
const showEventDialog = ref(false)
const selectedEvent = ref(null)
const selectedMerchant = ref(null)
const selectedVendor = ref(null) // Added for vendor details in dialog
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
    // Show booked events that are currently happening or haven't started yet
    if (event.status !== 'booked') return false
    
    const now = new Date()
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    
    // Show events that haven't started yet OR are currently happening (started but not ended)
    if (eventStart > now || (eventStart <= now && eventEnd > now)) {
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
    }
    
    return false
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

const getVendorName = (vendorId: string) => {
  const vendor = vendors.value.find(v => v.id === vendorId)
  return vendor ? vendor.vendor_name : 'Unknown Food Truck'
}

const getVendorImage = (vendorId: string) => {
  const vendor = vendors.value.find(v => v.id === vendorId)
  return vendor?.avatar_url || 'https://placehold.co/400x300?text=Food+Truck'
}

const getVendorCuisine = (vendorId: string) => {
  const vendor = vendors.value.find(v => v.id === vendorId)
  return vendor?.cuisine_type || null
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'open':
      return 'AVAILABLE'
    case 'booked':
      return 'CONFIRMED'
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
  selectedVendor.value = vendors.value.find(v => v.id === event.vendor) // Set selectedVendor
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