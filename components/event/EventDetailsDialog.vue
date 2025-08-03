<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :style="{ width: '90vw', maxWidth: '900px' }"
  >
    <div v-if="event" class="space-y-8">
      <!-- Header Section -->
      <div class="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-text-main mb-3 leading-tight">
            {{ getMerchantName(event.merchant) }} | {{ getVendorName(event.vendor) }}
          </h2>
          <div class="flex items-center gap-6 text-base">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-text-muted"></i>
              <span class="text-text-muted">{{ formatFullDate(event.start) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-clock text-text-muted"></i>
              <span class="text-text-muted">{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
            </div>
            <Badge :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" />
          </div>
        </div>
        <Button 
          icon="pi pi-times" 
          text 
          size="large"
          @click="$emit('update:visible', false)"
          class="ml-4"
        />
      </div>

      <!-- Content Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Image Section -->
        <div class="relative">
          <div class="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg">
            <NuxtImg
              :src="getMerchantImage(event.merchant)"
              :alt="getMerchantName(event.merchant)"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="absolute top-4 right-4">
            <Badge :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" />
          </div>
        </div>

        <!-- Information Section -->
        <div class="space-y-8">
          <!-- Event Information -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 class="font-semibold text-xl text-text-main mb-4 flex items-center gap-2">
              <i class="pi pi-info-circle text-primary"></i>
              Event Information
            </h3>
            <div class="space-y-4 text-base">
              <div class="flex items-start gap-4">
                <div class="w-20 flex-shrink-0">
                  <span class="text-text-muted font-medium">Date:</span>
                </div>
                <div class="flex-1">
                  <span class="text-text-main">{{ formatFullDate(event.start) }}</span>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-20 flex-shrink-0">
                  <span class="text-text-muted font-medium">Time:</span>
                </div>
                <div class="flex-1">
                  <span class="text-text-main">{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-20 flex-shrink-0">
                  <span class="text-text-muted font-medium">Location:</span>
                </div>
                <div class="flex-1">
                  <span class="text-text-main">{{ event.location_address || 'TBD' }}</span>
                </div>
              </div>
              <div v-if="event.notes" class="flex items-start gap-4">
                <div class="w-20 flex-shrink-0">
                  <span class="text-text-muted font-medium">Notes:</span>
                </div>
                <div class="flex-1">
                  <span class="text-text-main">{{ event.notes }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cuisine Types -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 class="font-semibold text-xl text-text-main mb-4 flex items-center gap-2">
              <i class="pi pi-tag text-primary"></i>
              Cuisine Types
            </h4>
            <div class="flex flex-wrap gap-3">
              <Tag 
                v-for="cuisine in getVendorCuisines(event.vendor)" 
                :key="cuisine" 
                :value="cuisine" 
                severity="info"
                class="text-sm"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-6">
            <!-- Primary Action -->
            <div class="w-full">
              <Button 
                label="Get Directions" 
                icon="pi pi-map" 
                @click="getDirections(event)"
                class="w-full h-14 text-lg font-semibold"
                size="large"
              />
            </div>
            
            <!-- Secondary Actions -->
            <div class="grid grid-cols-2 gap-4">
              <Button 
                label="Share Event" 
                icon="pi pi-share-alt" 
                outlined
                @click="shareEvent(event)"
                class="h-12 text-base"
                size="large"
              />
              <Button 
                label="Add to Calendar" 
                icon="pi pi-calendar-plus" 
                outlined
                @click="addToCalendar(event)"
                class="h-12 text-base"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
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
  phone?: string
  email?: string
  website?: string
  cuisines?: string[]
}

// Props
interface Props {
  visible: boolean
  event: Event | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// Store data
const { merchants, vendors } = storeToRefs(useMerchantStore())

// Helper functions
const getMerchantName = (merchantId: string) => {
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant?.merchant_name || 'Unknown Merchant'
}

const getVendorName = (vendorId: string) => {
  const vendor = vendors.value.find(v => v.id === vendorId)
  return vendor?.vendor_name || 'Unknown Vendor'
}

const getMerchantImage = (merchantId: string) => {
  const merchant = merchants.value.find(m => m.id === merchantId)
  return merchant?.avatar_url || '/images/default-merchant.jpg'
}

const getVendorCuisines = (vendorId: string) => {
  const vendor = vendors.value.find(v => v.id === vendorId)
  return vendor?.cuisines || []
}

const getEventStatus = (event: Event) => {
  const now = new Date()
  const eventDate = new Date(event.start)
  
  if (event.status === 'cancelled') return 'CANCELLED'
  if (eventDate < now) return 'COMPLETED'
  if (event.status === 'booked') return 'UPCOMING'
  return 'PENDING'
}

const getEventStatusSeverity = (event: Event) => {
  const status = getEventStatus(event)
  switch (status) {
    case 'UPCOMING': return 'success'
    case 'COMPLETED': return 'info'
    case 'CANCELLED': return 'danger'
    default: return 'warning'
  }
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

// Action functions
const getDirections = (event: Event) => {
  if (event.location_coordinates) {
    const [lat, lng] = event.location_coordinates.split(',').map(Number)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  } else if (event.location_address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_address)}`
    window.open(url, '_blank')
  }
}

const shareEvent = (event: Event) => {
  const eventUrl = `${window.location.origin}/viewer/events`
  const eventText = `Check out this food truck event: ${getMerchantName(event.merchant)} | ${getVendorName(event.vendor)} on ${formatFullDate(event.start)}`
  
  if (navigator.share) {
    navigator.share({
      title: 'Food Truck Event',
      text: eventText,
      url: eventUrl
    })
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(`${eventText}\n${eventUrl}`)
    // You could add a toast notification here
  }
}

const addToCalendar = (event: Event) => {
  const startDate = new Date(event.start)
  const endDate = new Date(event.end)
  
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${getMerchantName(event.merchant)} | ${getVendorName(event.vendor)}`)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.notes || '')}&location=${encodeURIComponent(event.location_address || '')}`
  
  window.open(calendarUrl, '_blank')
}
</script> 