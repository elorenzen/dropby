<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner />
    </div>

    <!-- Not Found State -->
    <div v-else-if="!merchant" class="flex flex-col items-center justify-center min-h-screen">
      <i class="pi pi-exclamation-circle text-6xl text-text-muted mb-4"></i>
      <h2 class="text-2xl font-bold text-text-main mb-2">Merchant Not Found</h2>
      <p class="text-text-muted">This merchant profile doesn't exist or has been removed.</p>
      <Button 
        label="Go Back Home" 
        icon="pi pi-home"
        @click="navigateTo('/')"
        class="mt-4"
      />
    </div>

    <!-- Profile Content -->
    <div v-else class="max-w-7xl mx-auto space-y-6">
      <!-- Header Section -->
      <Card class="profile-header">
        <template #content>
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0 mx-auto md:mx-0">
              <div class="w-48 h-48 rounded-lg overflow-hidden bg-surface-border flex items-center justify-center p-2">
                <NuxtImg
                  v-if="merchant.avatar_url"
                  :src="merchant.avatar_url"
                  :alt="merchant.merchant_name"
                  class="rounded-lg max-w-full max-h-full object-contain"
                />
                <i v-else class="pi pi-building text-8xl text-text-muted"></i>
              </div>
            </div>

            <!-- Business Info -->
            <div class="flex-1">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 class="text-4xl font-bold text-text-main mb-2">
                    {{ merchant.merchant_name }}
                  </h1>
                  <div class="flex items-center gap-4 mb-3">
                    <Rating 
                      :model-value="merchant.average_vendor_rating || 0" 
                      :readonly="true" 
                      :cancel="false"
                      class="mr-2"
                    />
                    <span class="text-text-muted">
                      {{ merchant.average_vendor_rating ? merchant.average_vendor_rating.toFixed(1) : 'No ratings yet' }}
                    </span>
                  </div>
                  <p v-if="merchant.formatted_address" class="text-text-muted">
                    <i class="pi pi-map-marker mr-2"></i>
                    {{ merchant.formatted_address }}
                  </p>
                </div>
                
                <!-- Compliance Badge -->
                <Badge 
                  v-if="merchant.compliance_verified" 
                  value="Verified" 
                  severity="success"
                  class="mt-2 md:mt-0"
                />
              </div>

              <!-- Description -->
              <p v-if="merchant.merchant_description" class="text-text-main text-lg mb-4">
                {{ merchant.merchant_description }}
              </p>

              <!-- Contact Information -->
              <div class="flex flex-wrap gap-4">
                <Button
                  v-if="merchant.website"
                  :label="getDomainName(merchant.website)"
                  icon="pi pi-globe"
                  outlined
                  size="small"
                  @click="openLink(merchant.website)"
                />
                <Button
                  v-if="merchant.instagram"
                  label="Instagram"
                  icon="pi pi-instagram"
                  outlined
                  size="small"
                  @click="openLink(merchant.instagram)"
                />
                <Button
                  v-if="merchant.email"
                  label="Email"
                  icon="pi pi-envelope"
                  outlined
                  size="small"
                  @click="openLink(`mailto:${merchant.email}`)"
                />
                <Button
                  v-if="merchant.phone"
                  label="Call"
                  icon="pi pi-phone"
                  outlined
                  size="small"
                  @click="openLink(`tel:${merchant.phone}`)"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Business Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card class="info-card">
          <template #content>
            <div class="text-center">
              <i class="pi pi-users text-3xl text-primary mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Seating Capacity</p>
              <p class="text-2xl font-bold text-text-main">
                {{ merchant.seating_capacity || 'N/A' }}
              </p>
            </div>
          </template>
        </Card>

        <Card class="info-card">
          <template #content>
            <div class="text-center">
              <i class="pi pi-calendar text-3xl text-accent mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Total Events</p>
              <p class="text-2xl font-bold text-text-main">{{ totalEvents }}</p>
            </div>
          </template>
        </Card>

        <!-- Avg. Event Value Card -->
        <!-- COMMENTED OUT - Feature under consideration
        <Card class="info-card">
          <template #content>
            <div class="text-center">
              <i class="pi pi-dollar text-3xl text-success mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Avg. Event Value</p>
              <p class="text-2xl font-bold text-text-main">
                ${{ merchant.default_event_value || 0 }}
              </p>
            </div>
          </template>
        </Card>
        -->

        <Card class="info-card">
          <template #content>
            <div class="text-center">
              <i class="pi pi-map-marker text-3xl text-error mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Address</p>
              <p class="text-sm font-semibold text-text-main line-clamp-2">
                {{ merchant.formatted_address || 'Not specified' }}
              </p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Booked Events Section -->
      <Card>
        <template #title>
          <h2 class="text-2xl font-bold">Upcoming Events</h2>
        </template>
        <template #content>
          <div v-if="bookedEvents.length === 0" class="text-center py-8">
            <i class="pi pi-calendar-times text-6xl text-text-muted mb-4"></i>
            <p class="text-text-muted text-lg">No upcoming events scheduled</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in bookedEvents"
              :key="event.id"
              class="event-card p-4 rounded-lg border border-surface-border hover:border-primary transition-colors"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-text-main mb-2">Event</h3>
                  <p class="text-text-muted mb-1">
                    <i class="pi pi-calendar mr-2"></i>
                    {{ formatDate(event.start) }}
                  </p>
                  <p class="text-text-muted mb-1">
                    <i class="pi pi-clock mr-2"></i>
                    {{ formatTime(event.start) }}
                  </p>
                  <p v-if="event.location_address" class="text-text-muted">
                    <i class="pi pi-map-marker mr-2"></i>
                    {{ event.location_address }}
                  </p>
                  <p v-if="event.notes" class="text-text-main mt-2">{{ event.notes }}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                  <!-- COMMENTED OUT - Feature under consideration
                  <div v-if="canSeeEventValue(event) && event.event_value" class="text-2xl font-bold text-primary mb-2">
                    ${{ event.event_value }}
                  </div>
                  -->
                  <Tag v-if="event.vendor && getVendorName(event.vendor)" :value="getVendorName(event.vendor)" severity="success" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Business Hours -->
      <Card v-if="merchant.business_hours && merchant.business_hours.length > 0">
        <template #title>
          <h2 class="text-2xl font-bold">Business Hours</h2>
        </template>
        <template #content>
          <div class="space-y-2">
            <div
              v-for="(hours, index) in merchant.business_hours"
              :key="index"
              class="flex justify-between items-center py-2 border-b border-surface-border last:border-b-0"
            >
              <span class="font-semibold text-text-main">{{ hours.day }}</span>
              <span class="text-text-muted">{{ hours.open }} - {{ hours.close }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Merchant, Event } from '~/types'

const route = useRoute()
const supabase = useSupabaseClient()
const merchantStore = useMerchantStore()
const { isAuthenticated, currentUser } = useAuth()

// State
const loading = ref(true)
const merchant = ref<Merchant | null>(null)
const bookedEvents = ref<Event[]>([])

// SEO
useSeoMeta({
  title: () => merchant.value ? `${merchant.value.merchant_name} - Merchant Profile` : 'Merchant Profile',
  description: () => merchant.value?.merchant_description || 'View merchant profile on DropBy'
})

// Load merchant data
const loadMerchantData = async () => {
  try {
    loading.value = true
    
    // Get merchant from store
    const merchantData = await merchantStore.getMerchantById(route.params.id as string)
    merchant.value = merchantData || null

    if (merchant.value) {
      // Load booked events for this merchant
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('merchant', route.params.id)
        .eq('status', 'booked')
        .order('start', { ascending: true })

      if (error) {
        console.error('Error loading events:', error)
      } else {
        // Filter to only show future events
        const now = new Date()
        bookedEvents.value = (events || []).filter(event => new Date(event.start) > now)
      }
    }
  } catch (error) {
    console.error('Error loading merchant data:', error)
  } finally {
    loading.value = false
  }
}

// Computed properties
const totalEvents = computed(() => bookedEvents.value.length)

// Helper functions
const formatDate = (dateString: string) => {
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
    minute: '2-digit'
  })
}

const getStatusSeverity = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
  switch (status) {
    case 'booked':
      return 'success'
    case 'open':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const getDomainName = (url: string) => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`)
    return domain.hostname.replace('www.', '')
  } catch {
    return url
  }
}

const getVendorName = (vendorId: string) => {
  const vendorStore = useVendorStore()
  const vendor = vendorStore.getAllVendors.find((v: any) => v.id === vendorId)
  return vendor?.vendor_name || null
}

const canSeeEventValue = (event: Event) => {
  if (!isAuthenticated.value || !currentUser.value) return false
  
  const user = currentUser.value
  // If user is the merchant on the event
  if (user.type === 'merchant' && user.associated_merchant_id === event.merchant) return true
  // If user is the vendor on the event
  if (user.type === 'vendor' && user.associated_vendor_id === event.vendor) return true
  
  return false
}

// Load data on mount
onMounted(() => {
  loadMerchantData()
})
</script>

<style scoped>
.profile-header {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.info-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2);
  border-color: var(--primary-color);
}

.event-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
