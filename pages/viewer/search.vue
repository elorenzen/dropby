<template>
  <div class="page-content">
    <div class="section">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Find Food Trucks Near You</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing food trucks and events happening at local establishments. 
          From tacos to gourmet burgers, find your next favorite meal!
        </p>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Location Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <InputText 
              v-model="searchLocation" 
              placeholder="Enter city or zip code"
              class="w-full"
              @input="filterEvents"
            />
          </div>
          
          <!-- Date Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <DatePicker 
              v-model="selectedDate" 
              placeholder="Select date"
              class="w-full"
              @update:model-value="filterEvents"
            />
          </div>
          
          <!-- Cuisine Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
            <Dropdown 
              v-model="selectedCuisine" 
              :options="cuisineOptions"
              placeholder="All cuisines"
              class="w-full"
              @change="filterEvents"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <!-- Events Grid -->
      <div v-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="event in filteredEvents" 
          :key="event.id"
          class="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          @click="openEventDetails(event)"
        >
          <template #header>
            <div class="relative">
              <NuxtImg
                :src="getMerchantImage(event.merchant)"
                :alt="getMerchantName(event.merchant)"
                class="w-full h-48 object-cover rounded-t-lg"
                loading="lazy"
              />
              <div class="absolute top-2 right-2">
                <Tag :value="getStatusDisplay(event.status)" :severity="getStatusSeverity(event.status)" />
              </div>
            </div>
          </template>
          
          <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">{{ getMerchantName(event.merchant) }}</h3>
            </div>
          </template>
          
          <template #content>
            <div class="space-y-3">
              <div class="flex items-center text-gray-600">
                <i class="pi pi-calendar mr-2"></i>
                <span>{{ formatDate(event.start) }}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <i class="pi pi-clock mr-2"></i>
                <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
              </div>
              <div class="flex items-center text-gray-600">
                <i class="pi pi-map-marker mr-2"></i>
                <span>{{ event.location_address || 'Location TBD' }}</span>
              </div>
              <div v-if="event.notes" class="text-gray-600 text-sm">
                <p class="line-clamp-2">{{ event.notes }}</p>
              </div>
            </div>
          </template>
          
          <template #footer>
            <div class="flex justify-between items-center">
              <Button 
                label="View Details" 
                icon="pi pi-external-link"
                outlined
                @click.stop="openEventDetails(event)"
              />
              <Button 
                v-if="event.status === 'open'"
                label="Request Event" 
                icon="pi pi-send"
                @click.stop="requestEvent(event)"
                class="ml-2"
              />
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
        <p class="text-gray-500">Try adjusting your search criteria or check back later for new events.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <ProgressSpinner />
        <p class="mt-4 text-gray-600">Loading events...</p>
      </div>
    </div>

    <!-- Event Details Dialog -->
    <Dialog 
      v-model:visible="showEventDialog" 
      modal 
      :header="selectedEvent ? getMerchantName(selectedEvent.merchant) : 'Event Details'"
      :style="{ width: '50rem' }"
    >
      <div v-if="selectedEvent" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-3">Event Information</h4>
            <div class="space-y-2">
              <div>
                <span class="font-medium">Date:</span>
                <span class="ml-2">{{ formatDate(selectedEvent.start) }}</span>
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
            <div class="space-y-2">
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
            label="Close" 
            outlined
            @click="showEventDialog = false"
          />
        </div>
      </div>
    </Dialog>

    <!-- Sign Up Prompt -->
    <div v-if="!isAuthenticated" class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mt-8 text-white text-center">
      <h3 class="text-xl font-semibold mb-2">Want to request events?</h3>
      <p class="mb-4">Sign up as a food truck vendor to start requesting events at these amazing locations!</p>
      <div class="flex justify-center gap-4">
        <Button 
          label="Sign Up as Vendor" 
          severity="contrast"
          @click="navigateToSignup('vendor')"
        />
        <Button 
          label="Sign Up as Establishment" 
          severity="contrast"
          outlined
          @click="navigateToSignup('merchant')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  alias: '/search'
})

const supabase = useSupabaseClient()
const { isAuthenticated } = useAuth()

// Reactive data
const events = ref([])
const merchants = ref([])
const vendors = ref([])
const loading = ref(true)
const searchLocation = ref('')
const selectedDate = ref(null)
const selectedCuisine = ref(null)
const showEventDialog = ref(false)
const selectedEvent = ref(null)
const selectedMerchant = ref(null)

// Cuisine options for filter
const cuisineOptions = ref([
  'American', 'Mexican', 'Italian', 'Asian', 'Mediterranean', 
  'BBQ', 'Seafood', 'Vegetarian', 'Desserts', 'Coffee', 'Other'
])

// Computed filtered events
const filteredEvents = computed(() => {
  let filtered = events.value.filter(event => {
    // Filter by status - only show open events to public
    if (event.status !== 'open') return false
    
    // Filter by location
    if (searchLocation.value && event.location_address) {
      const location = event.location_address.toLowerCase()
      const search = searchLocation.value.toLowerCase()
      if (!location.includes(search)) return false
    }
    
    // Filter by date
    if (selectedDate.value) {
      const eventDate = new Date(event.start).toDateString()
      const filterDate = new Date(selectedDate.value).toDateString()
      if (eventDate !== filterDate) return false
    }
    
    return true
  })
  
  // Sort by date (earliest first)
  return filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
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
    
    // Load vendors for cuisine filtering
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

const filterEvents = () => {
  // Filtering is handled by computed property
}

const getMerchantName = (merchantId) => {
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant ? merchant.merchant_name : 'Unknown Establishment'
}

const getMerchantImage = (merchantId) => {
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant?.avatar_url || 'https://placehold.co/400x300?text=Establishment'
}

const getStatusDisplay = (status) => {
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

const getStatusSeverity = (status) => {
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const openEventDetails = (event) => {
  selectedEvent.value = event
  selectedMerchant.value = merchants.value.find(m => m.id === event.merchant)
  showEventDialog.value = true
}

const requestEvent = (event) => {
  if (!isAuthenticated.value) {
    // Redirect to signup/login
    navigateTo('/get-started')
    return
  }
  
  // For authenticated users, redirect to their dashboard
  navigateTo('/vendor/dashboard')
}

const navigateToSignup = (type) => {
  navigateTo(`/get-started?type=${type}`)
}

// Load data on mount
onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>