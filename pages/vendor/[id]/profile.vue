<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner />
    </div>

    <!-- Not Found State -->
    <div v-else-if="!vendor" class="flex flex-col items-center justify-center min-h-screen">
      <i class="pi pi-exclamation-circle text-6xl text-text-muted mb-4"></i>
      <h2 class="text-2xl font-bold text-text-main mb-2">Vendor Not Found</h2>
      <p class="text-text-muted">This vendor profile doesn't exist or has been removed.</p>
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
                  v-if="vendor.avatar_url"
                  :src="vendor.avatar_url"
                  :alt="vendor.vendor_name || 'Vendor'"
                  class="rounded-lg max-w-full max-h-full object-contain"
                />
                <i v-else class="pi pi-truck text-8xl text-text-muted"></i>
              </div>
            </div>

            <!-- Business Info -->
            <div class="flex-1">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 class="text-4xl font-bold text-text-main mb-2">
                    {{ vendor.vendor_name }}
                  </h1>
                  <div class="flex items-center gap-4 mb-3">
                    <Rating 
                      :model-value="vendor.average_merchant_rating || 0" 
                      :readonly="true" 
                      :cancel="false"
                      class="mr-2"
                    />
                    <span class="text-text-muted">
                      {{ vendor.average_merchant_rating ? vendor.average_merchant_rating.toFixed(1) : 'No ratings yet' }}
                    </span>
                  </div>
                  <p v-if="vendor.formatted_address" class="text-text-muted">
                    <i class="pi pi-map-marker mr-2"></i>
                    {{ vendor.formatted_address }}
                  </p>
                  <div v-if="vendor.cuisine && vendor.cuisine.length > 0" class="flex flex-wrap gap-2 mt-3">
                    <Badge 
                      v-for="(cuisine, index) in vendor.cuisine" 
                      :key="index" 
                      :value="cuisine"
                      severity="info"
                    />
                  </div>
                </div>
                
                <!-- Compliance Badge -->
                <Badge 
                  v-if="vendor.compliance_verified" 
                  value="Verified" 
                  severity="success"
                  class="mt-2 md:mt-0"
                />
              </div>

              <!-- Description -->
              <p v-if="vendor.vendor_description" class="text-text-main text-lg mb-4">
                {{ vendor.vendor_description }}
              </p>

              <!-- Contact Information -->
              <div class="flex flex-wrap gap-4">
                <Button
                  v-if="vendor.website"
                  :label="getDomainName(vendor.website)"
                  icon="pi pi-globe"
                  outlined
                  size="small"
                  @click="openLink(vendor.website)"
                />
                <Button
                  v-if="vendor.instagram"
                  label="Instagram"
                  icon="pi pi-instagram"
                  outlined
                  size="small"
                  @click="openLink(vendor.instagram)"
                />
                <Button
                  v-if="vendor.email"
                  label="Email"
                  icon="pi pi-envelope"
                  outlined
                  size="small"
                  @click="openLink(`mailto:${vendor.email}`)"
                />
                <Button
                  v-if="vendor.phone"
                  label="Call"
                  icon="pi pi-phone"
                  outlined
                  size="small"
                  @click="openLink(`tel:${vendor.phone}`)"
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
              <i class="pi pi-map-marker text-3xl text-primary mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Service Radius</p>
              <p class="text-2xl font-bold text-text-main">
                {{ vendor.service_radius || 'N/A' }} miles
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

        <Card class="info-card">
          <template #content>
            <div class="text-center">
              <i class="pi pi-shopping-bag text-3xl text-success mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Menu Items</p>
              <p class="text-2xl font-bold text-text-main">{{ menuItems.length }}</p>
            </div>
          </template>
        </Card>

        <Card class="info-card">
          <template #content>
            <div class="text-center">
              <i class="pi pi-star text-3xl text-warning mb-2"></i>
              <p class="text-text-muted text-sm font-medium mb-1">Average Rating</p>
              <p class="text-2xl font-bold text-text-main">
                {{ vendor.average_merchant_rating || 'N/A' }}
              </p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Menu Section -->
      <Card v-if="menuItems.length > 0">
        <template #title>
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">Menu</h2>
            <div class="flex items-center gap-3">
              <Button
                :icon="menuLayout === 'grid' ? 'pi pi-list' : 'pi pi-th-large'"
                :label="menuLayout === 'grid' ? 'List View' : 'Grid View'"
                outlined
                size="small"
                @click="toggleMenuLayout"
              />
              <Badge :value="`${menuItems.length} Items`" severity="info" />
            </div>
          </div>
        </template>
        <template #content>
          <!-- Grid View -->
          <div v-if="menuLayout === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card
              v-for="item in menuItems"
              :key="item.id"
              class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              @click="viewMenuItem(item)"
            >
              <template #header>
                <div class="relative">
                  <NuxtImg 
                    v-if="item.image_url"
                    :src="item.image_url" 
                    :alt="item.name || 'Menu item'" 
                    class="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                  <div v-else class="w-full h-48 bg-surface-border flex items-center justify-center">
                    <i class="pi pi-image text-5xl text-text-muted"></i>
                  </div>
                  <div class="absolute top-2 right-2 flex gap-2">
                    <Tag 
                      :value="item.type || 'N/A'" 
                      severity="info" 
                      class="text-xs"
                    />
                    <Badge 
                      v-if="item.special" 
                      value="Special" 
                      severity="warning"
                    />
                  </div>
                </div>
              </template>
              <template #title>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-text-main truncate">{{ item.name || '' }}</h3>
                  <span class="text-xl font-bold text-accent">{{ item.price?.toFixed(2) ? `$${item.price.toFixed(2)}` : 'Free' }}</span>
                </div>
              </template>
              <template #content>
                <p class="text-text-muted text-sm line-clamp-3">{{ item.description || 'No description provided' }}</p>
              </template>
            </Card>
          </div>

          <!-- List View -->
          <div v-else>
            <DataTable :value="menuItems" tableStyle="width: 100%" class="p-datatable-sm">
              <Column header="Item">
                <template #body="{ data }">
                  <div class="flex items-center gap-3">
                    <NuxtImg 
                      v-if="data.image_url"
                      :src="data.image_url" 
                      :alt="data.name" 
                      class="w-16 h-16 rounded object-cover"
                    />
                    <div v-else class="w-16 h-16 rounded bg-surface-border flex items-center justify-center">
                      <i class="pi pi-image text-2xl text-text-muted"></i>
                    </div>
                    <div>
                      <div class="font-semibold">{{ data.name }}</div>
                      <div class="text-sm text-text-muted line-clamp-2">{{ data.description || 'No description' }}</div>
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="type" header="Type" sortable>
                <template #body="{ data }">
                  <Tag :value="data.type || 'N/A'" severity="secondary" />
                  <Badge 
                    v-if="data.special" 
                    value="Special" 
                    severity="warning"
                    class="ml-2"
                  />
                </template>
              </Column>
              <Column field="price" header="Price" sortable>
                <template #body="{ data }">
                  <span class="font-bold text-accent">{{ data.price?.toFixed(2) ? `$${data.price.toFixed(2)}` : 'Free' }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>

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
                  <div v-if="canSeeEventValue(event) && event.event_value" class="text-2xl font-bold text-primary mb-2">
                    ${{ event.event_value }}
                  </div>
                  <Tag v-if="event.merchant && getMerchantName(event.merchant)" :value="getMerchantName(event.merchant)" severity="info" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Menu Item Detail Dialog -->
      <Dialog 
        v-model="menuItemDialogVisible" 
        :header="selectedMenuItem?.name || 'Menu Item Details'"
        :style="{ width: '50vw' }"
        :modal="true"
        :closable="true"
      >
        <div v-if="selectedMenuItem" class="menu-item-detail">
          <div class="mb-4">
            <NuxtImg
              v-if="selectedMenuItem.image_url"
              :src="selectedMenuItem.image_url"
              :alt="selectedMenuItem.name || 'Menu item'"
              width="600"
              height="400"
              class="w-full h-64 object-cover rounded-lg"
            />
            <div v-else class="w-full h-64 bg-surface-border rounded-lg flex items-center justify-center">
              <i class="pi pi-image text-6xl text-text-muted"></i>
            </div>
          </div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-3xl font-bold text-primary">
              ${{ selectedMenuItem.price?.toFixed(2) }}
            </span>
            <Tag :value="selectedMenuItem.type || 'N/A'" />
          </div>
          <p class="text-text-muted mb-3">{{ selectedMenuItem.description || '' }}</p>
          <Badge 
            v-if="selectedMenuItem.special" 
            value="Special Item" 
            severity="warning"
          />
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Vendor, Event, MenuItem } from '~/types'

const route = useRoute()
const supabase = useSupabaseClient()
const vendorStore = useVendorStore()
const menuStore = useMenuStore()
const { isAuthenticated, currentUser } = useAuth()

// State
const loading = ref(true)
const vendor = ref<Vendor | null>(null)
const bookedEvents = ref<Event[]>([])
const menuItems = ref<MenuItem[]>([])
const menuItemDialogVisible = ref(false)
const selectedMenuItem = ref<MenuItem | null>(null)
const menuLayout = ref<'grid' | 'list'>('grid')

// SEO
useSeoMeta({
  title: () => vendor.value ? `${vendor.value.vendor_name} - Vendor Profile` : 'Vendor Profile',
  description: () => vendor.value?.vendor_description || 'View vendor profile on DropBy'
})

// Load vendor data
const loadVendorData = async () => {
  try {
    loading.value = true
    
    // Get vendor from store
    const vendorData = await vendorStore.getVendorById(route.params.id as string)
    vendor.value = vendorData || null

    if (vendor.value) {
      // Load menu items for this vendor
      await menuStore.loadMenuItems(vendor.value.id)
      menuItems.value = menuStore.getMenuItemsByVendor(vendor.value.id)

      // Load booked events for this vendor
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('vendor', route.params.id)
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
    console.error('Error loading vendor data:', error)
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

const getMerchantName = (merchantId: string) => {
  const merchantStore = useMerchantStore()
  const merchant = merchantStore.getAllMerchants.find((m: any) => m.id === merchantId)
  return merchant?.merchant_name || null
}

const toggleMenuLayout = () => {
  menuLayout.value = menuLayout.value === 'grid' ? 'list' : 'grid'
}

const canSeeEventValue = (event: Event) => {
  if (!isAuthenticated.value || !currentUser.value) return false
  
  const user = currentUser.value
  // If user is the vendor on the event
  if (user.type === 'vendor' && user.associated_vendor_id === event.vendor) return true
  // If user is the merchant on the event
  if (user.type === 'merchant' && user.associated_merchant_id === event.merchant) return true
  
  return false
}

const viewMenuItem = (item: MenuItem) => {
  selectedMenuItem.value = item
  menuItemDialogVisible.value = true
}

// Load data on mount
onMounted(() => {
  loadVendorData()
})
</script>

<style scoped>
.profile-header {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.info-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2);
  border-color: var(--accent-color);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
