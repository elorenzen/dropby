<template>
  <div class="page-content">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="false" :show-list="true" :list-rows="6" />

    <div v-else class="section">
      <div class="text-center mb-8">
        <h1 class="font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-accent to-error bg-clip-text text-transparent">
          Find Amazing Food Trucks
        </h1>
        <p class="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
          Discover where your favorite food trucks are located. 
          Find food trucks near you and never miss out on amazing food experiences!
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
              placeholder="Search by vendor name..."
              class="w-full pl-10 pr-4"
              size="small"
              @input="onSearchInput"
            />
          </div>
        </template>

        <template #filters>
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">Filter by Cuisine</label>
            <MultiSelect 
              v-model="selectedCuisines" 
              :options="cuisineOptions" 
              placeholder="All cuisines" 
              class="w-full"
              :showClear="true"
              display="chip"
              size="small"
            />
          </div>
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
          Showing {{ filteredVendors.length }} of {{ vendors.length }} vendors
          <span v-if="searchQuery || selectedCuisines.length > 0 || (isAuthenticated && minRating)" class="text-primary">
            (filtered)
          </span>
        </template>
      </SearchAndFilter>

      <!-- Vendors List with Expansion Panels -->
      <div v-if="filteredVendors.length > 0" class="space-y-4">
        <Accordion :multiple="true" :activeIndex="expandedPanels">
          <AccordionTab v-for="vendor in filteredVendors" :key="vendor.id">
            <template #header>
              <div class="flex items-center justify-between w-full pr-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <NuxtImg
                    :src="vendor.avatar_url || ''"
                    width="60"
                    height="60"
                    loading="lazy"
                    fit="inside"
                    class="rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <h3 class="font-semibold text-lg text-text-main truncate">{{ vendor.vendor_name }}</h3>
                    <div v-if="isAuthenticated" class="flex items-center gap-2 mt-1">
                      <div class="flex items-center gap-0.5">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          :class="[
                            'pi',
                            star <= Math.floor(getVendorRating(vendor.id)) ? 'pi-star-fill text-accent' : 
                            star === Math.ceil(getVendorRating(vendor.id)) && getVendorRating(vendor.id) % 1 >= 0.5 ? 'pi-star-half text-accent' :
                            'pi-star text-text-muted'
                          ]"
                        ></i>
                      </div>
                      <span class="text-sm text-text-muted">({{ getVendorReviewCount(vendor.id) }})</span>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-2">
                      <Badge
                        v-for="(cuisine, index) in vendor.cuisine?.slice(0, 3)"
                        :key="`${cuisine}-${index}`"
                        :value="cuisine"
                        severity="secondary"
                        size="small"
                      />
                      <Badge
                        v-if="vendor.cuisine && vendor.cuisine.length > 3"
                        :value="`+${vendor.cuisine.length - 3} more`"
                        severity="info"
                        size="small"
                      />
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    v-if="vendorEventsMap[vendor.id]?.length > 0"
                    :value="`${vendorEventsMap[vendor.id]?.length} event${vendorEventsMap[vendor.id]?.length !== 1 ? 's' : ''}`"
                    severity="info"
                  />
                  <Button 
                    label="View Profile" 
                    icon="pi pi-external-link"
                    outlined
                    size="small"
                    @click.stop="navigateTo(`/vendor/${vendor.id}/profile`)"
                  />
                </div>
              </div>
            </template>

            <div class="vendor-details-content">
              <!-- Vendor Description -->
              <div class="mb-6">
                <h4 class="font-semibold mb-2 text-text-main">About</h4>
                <p class="text-text-muted">{{ vendor.vendor_description || 'No description available.' }}</p>
              </div>

              <!-- Upcoming Events -->
              <div v-if="vendorEventsMap[vendor.id] && vendorEventsMap[vendor.id].length > 0">
                <h4 class="font-semibold mb-4 text-text-main">Upcoming Events</h4>
                <div class="space-y-3">
                  <Card 
                    v-for="event in vendorEventsMap[vendor.id]" 
                    :key="event.id"
                    class="event-card"
                  >
                    <template #content>
                      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-calendar text-primary"></i>
                            <span class="font-semibold text-text-main">
                              {{ formatDate(event.start, { format: 'long' }) }}
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
                          <div v-if="getMerchantProp(event.merchant, 'merchant_name')" class="flex items-center gap-3">
                            <i class="pi pi-building text-primary"></i>
                            <span class="text-text-muted">At {{ getMerchantProp(event.merchant, 'merchant_name') || 'Unknown Establishment' }}</span>
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
        <p class="text-xl text-text-muted">No vendors found matching your criteria</p>
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
import { formatDate, formatTime } from '~/utils/dates'
import { getEventStatusSeverity } from '~/utils/events'
import type { Vendor, Event, Merchant } from '~/types'
import PageSkeleton from '~/components/skeleton/PageSkeleton.vue'

definePageMeta({
  alias: '/food-trucks'
})

const vendorStore = useVendorStore()
const eventStore = useEventStore()
const merchantStore = useMerchantStore()

// Helper functions
const getMerchantProp = (merchantId: string | null, prop: string): string => {
  if (!merchantId) return ''
  return merchantStore.getMerchantProp(merchantId, prop)
}
const reviewStore = useReviewStore()
const { isAuthenticated } = useAuth()

// Loading state
const loading = ref(true)

// Reactive references to store data
const vendors = computed(() => vendorStore.getAllVendors)
const events = computed(() => eventStore.getAllEvents)
const merchants = computed(() => merchantStore.getAllMerchants)

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      vendorStore.allVendors.length === 0 ? vendorStore.loadVendors() : Promise.resolve(),
      eventStore.allEvents.length === 0 ? eventStore.loadEvents() : Promise.resolve(),
      merchantStore.allMerchants.length === 0 ? merchantStore.loadMerchants() : Promise.resolve(),
      reviewStore.allReviews.length === 0 ? reviewStore.loadAllReviews() : Promise.resolve()
    ])
  } finally {
    loading.value = false
  }
})

// Search state
const searchQuery = ref('')
const sortBy = ref('name')
const selectedCuisines = ref<string[]>([])
const minRating = ref<number | null>(null)
const expandedPanels = ref<number[]>([])

// Sort options
const sortOptions = computed(() => {
  const baseOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Name (Z-A)', value: 'name-desc' },
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

// Get unique cuisines from all vendors
const cuisineOptions = computed(() => {
  const cuisines = new Set<string>()
  vendors.value.forEach((vendor: Vendor) => {
    if (vendor.cuisine) {
      vendor.cuisine.forEach((c: string) => cuisines.add(c))
    }
  })
  return Array.from(cuisines).sort()
})

// Rating options
const ratingOptions = [
  { label: 'Any rating', value: null },
  { label: '4+ stars', value: 4 },
  { label: '3+ stars', value: 3 },
  { label: '2+ stars', value: 2 },
  { label: '1+ stars', value: 1 }
]

// Map vendors to their events
const vendorEventsMap = computed(() => {
  const map: Record<string, Event[]> = {}
  const now = new Date()
  
  vendors.value.forEach((vendor: Vendor) => {
    const vendorEvents = events.value.filter((event: Event) => {
      if (event.vendor !== vendor.id) return false
      if (event.status !== 'booked' && event.status !== 'open') return false
      const eventStart = new Date(event.start)
      return eventStart >= now
    }).sort((a: Event, b: Event) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    )
    map[vendor.id] = vendorEvents
  })
  
  return map
})

// Filtered vendors
const filteredVendors = computed(() => {
  let filtered = [...vendors.value]

  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter((vendor: Vendor) => 
      vendor.vendor_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Cuisine filter
  if (selectedCuisines.value.length > 0) {
    filtered = filtered.filter((vendor: Vendor) => 
      vendor.cuisine?.some((c: string) => selectedCuisines.value.includes(c))
    )
  }

  // Rating filter (only if authenticated)
  if (isAuthenticated.value && minRating.value !== null) {
    filtered = filtered.filter((vendor: Vendor) => 
      getVendorRating(vendor.id) >= minRating.value!
    )
  }

  // Sort
  filtered.sort((a: Vendor, b: Vendor) => {
    switch (sortBy.value) {
      case 'name':
        return (a.vendor_name || '').localeCompare(b.vendor_name || '')
      case 'name-desc':
        return (b.vendor_name || '').localeCompare(a.vendor_name || '')
      case 'rating-desc':
        return isAuthenticated.value ? getVendorRating(b.id) - getVendorRating(a.id) : 0
      case 'rating-asc':
        return isAuthenticated.value ? getVendorRating(a.id) - getVendorRating(b.id) : 0
      case 'events-desc':
        return (vendorEventsMap.value[b.id]?.length || 0) - (vendorEventsMap.value[a.id]?.length || 0)
      case 'events-asc':
        return (vendorEventsMap.value[a.id]?.length || 0) - (vendorEventsMap.value[b.id]?.length || 0)
      default:
        return 0
    }
  })

  return filtered
})

// Helper functions
const getVendorRating = (vendorId: string): number => {
  return reviewStore.getAverageRatingForBusiness(vendorId)
}

const getVendorReviewCount = (vendorId: string): number => {
  return reviewStore.getReviewsForBusiness(vendorId).length
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
  selectedCuisines.value = []
  minRating.value = null
  sortBy.value = 'name'
}

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedCuisines.value.length > 0 || (isAuthenticated.value && minRating.value !== null))
})
</script>

<style scoped>
.section {
  width: 100%;
}


.vendor-details-content {
  padding: 1rem 0;
}

.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

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
