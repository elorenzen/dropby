<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Ratings & Reviews
          </h1>
          <p class="text-text-muted text-lg">
            Manage and view all ratings for {{ merchant?.name || 'your business' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Button 
            icon="pi pi-arrow-left" 
            @click="navigateToDashboard"
            outlined 
            label="Back to Dashboard"
          />
        </div>
      </div>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Average Food Truck Rating</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.foodTruckRating }}</p>
              <div class="flex items-center mt-1">
                <Rating v-model="analytics.foodTruckRating" readonly :cancel="false" />
                <span class="text-text-muted text-sm ml-2">({{ analytics.foodTruckReviews }} reviews)</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900">
              <i class="pi pi-truck text-orange-600 dark:text-orange-400"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Average User Rating</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.userRating }}</p>
              <div class="flex items-center mt-1">
                <Rating v-model="analytics.userRating" readonly :cancel="false" />
                <span class="text-text-muted text-sm ml-2">({{ analytics.userReviews }} reviews)</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
              <i class="pi pi-users text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Pending Reviews Notification -->
    <Card v-if="pendingReviews.length > 0" class="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-orange-600 dark:text-orange-400"></i>
            </div>
            <div>
              <h4 class="font-semibold text-orange-800 dark:text-orange-200">
                {{ pendingReviews.length }} Event{{ pendingReviews.length > 1 ? 's' : '' }} Need{{ pendingReviews.length > 1 ? '' : 's' }} Review
              </h4>
              <p class="text-sm text-orange-600 dark:text-orange-400">
                Write reviews for completed events to help other merchants
              </p>
            </div>
          </div>
          <Button 
            @click="showPendingReviews = !showPendingReviews"
            :label="showPendingReviews ? 'Hide' : 'View Events'"
            severity="warning"
            outlined
          />
        </div>
        
        <!-- Pending Reviews List -->
        <div v-if="showPendingReviews" class="mt-4 space-y-3">
          <div v-for="event in pendingReviews" :key="event.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
                <NuxtImg 
                  :src="getVendorProp(event.vendor, 'avatar_url')" 
                  :alt="getVendorProp(event.vendor, 'vendor_name')" 
                  class="w-12 h-12 rounded-full"
                />
                <div class="min-w-0">
                  <p class="font-semibold truncate">{{ getVendorProp(event.vendor, 'vendor_name') }}</p>
                  <p class="text-sm text-text-muted truncate">Event Date: {{ new Date(event.day_id).toLocaleDateString() }}</p>
                  <p class="text-xs text-text-muted">Event Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
                </div>
              </div>
              <Button 
                @click="writeReview(event)"
                label="Write Review"
                severity="warning"
                size="small"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Sent Reviews Card -->
    <Card class="mb-6">
      <template #title>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Sent Reviews</h3>
          <Badge :value="sentReviews.length" severity="info" />
        </div>
      </template>
      <template #content>
        <div class="space-y-3">
          <div v-for="review in sentReviews" :key="review.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="flex items-start gap-4">
              <!-- Left: Event Data -->
              <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
                <NuxtImg 
                  :src="review.vendor_avatar" 
                  :alt="review.vendor_name" 
                  class="w-12 h-12 rounded-full"
                />
                <div class="min-w-0">
                  <p class="font-semibold truncate">{{ review.vendor_name }}</p>
                  <p class="text-sm text-text-muted">{{ review.cuisine_type }}</p>
                  <p class="text-sm text-text-muted truncate">Event: {{ review.event_title }}</p>
                  <p class="text-xs text-text-muted">{{ review.event_date ? new Date(review.event_date).toLocaleDateString() : 'N/A' }}</p>
                </div>
              </div>
              
              <!-- Middle: Review Content -->
              <div class="flex-1 min-w-0 border-l border-r border-gray-200 dark:border-gray-700 px-4">
                <p class="text-sm leading-relaxed italic">"{{ review.comment }}"</p>
              </div>
              
              <!-- Right: Review Metadata -->
              <div class="flex flex-col items-end gap-2 min-w-0 flex-shrink-0">
                <Rating v-model="review.rating" readonly :cancel="false" />
                <p class="text-xs text-text-muted text-right">Reviewed on {{ new Date(review.created_at).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Received Reviews -->
    <Card>
      <template #title>
        <h3 class="text-xl font-semibold">Received Reviews</h3>
      </template>
      <template #content>
        <Tabs :value="activeTabIndex.toString()">
          <TabList>
            <Tab value="0">Food Truck Reviews</Tab>
            <Tab value="1">User Reviews</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="space-y-3">
                <div v-for="review in foodTruckReviews" :key="review.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-start gap-4">
                    <!-- Left: Vendor Data -->
                    <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
                      <NuxtImg 
                        :src="review.vendor_avatar" 
                        :alt="review.vendor_name" 
                        class="w-12 h-12 rounded-full"
                      />
                      <div class="min-w-0">
                        <p class="font-semibold truncate text-text-main">{{ review.vendor_name }}</p>
                        <p class="text-sm text-text-muted">{{ review.cuisine_type }}</p>
                        <p class="text-sm text-text-muted">Event: {{ review.event_title }}</p>
                        <p class="text-xs text-text-muted">{{ review.event_date ? new Date(review.event_date).toLocaleDateString() : 'N/A' }}</p>
                      </div>
                    </div>
                    
                    <!-- Middle: Review Content -->
                    <div class="flex-1 min-w-0 border-l border-r border-gray-200 dark:border-gray-700 px-4">
                      <p class="text-sm leading-relaxed italic">"{{ review.comment }}"</p>
                    </div>
                    
                    <!-- Right: Review Metadata -->
                    <div class="flex flex-col items-end gap-2 min-w-0 flex-shrink-0">
                      <Rating v-model="review.rating" readonly :cancel="false" />
                      <p class="text-xs text-text-muted text-right">Reviewed on {{ new Date(review.created_at).toLocaleDateString() }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="1">
              <div class="space-y-3">
                <div v-for="review in userReviews" :key="review.id" class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-start gap-4">
                    <!-- Left: User Data -->
                    <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
                      <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <i class="pi pi-user text-gray-600"></i>
                      </div>
                      <div class="min-w-0">
                        <p class="font-semibold truncate text-text-main">{{ review.user_name }}</p>
                        <p class="text-sm text-text-muted truncate">{{ review.user_email }}</p>
                        <p class="text-sm text-text-muted">Event: {{ review.event_title }}</p>
                        <p class="text-xs text-text-muted">{{ review.event_date ? new Date(review.event_date).toLocaleDateString() : 'N/A' }}</p>
                      </div>
                    </div>
                    
                    <!-- Middle: Review Content -->
                    <div class="flex-1 min-w-0 border-l border-r border-gray-200 dark:border-gray-700 px-4">
                      <p class="text-sm leading-relaxed italic">"{{ review.comment }}"</p>
                    </div>
                    
                    <!-- Right: Review Metadata -->
                    <div class="flex flex-col items-end gap-2 min-w-0 flex-shrink-0">
                      <Rating v-model="review.rating" readonly :cancel="false" />
                      <p class="text-xs text-text-muted text-right">Reviewed on {{ new Date(review.created_at).toLocaleDateString() }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

interface Event {
  id: string
  vendor: string
  day_id: string
  start: string
  end: string
  status: string
  merchant: string
}

interface Review {
  id: string
  vendor_avatar?: string
  vendor_name?: string
  cuisine_type?: string
  event_title?: string
  event_date?: string
  comment?: string
  rating: number
  created_at: string
  event_id?: string
  author_id?: string
  sender_id?: string
  recipient_id?: string
  content?: string
  user_name?: string
  user_email?: string
}

const route = useRoute()
const vendorStore = useVendorStore()
const merchantStore = useMerchantStore()
const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))

const reviewStore = useReviewStore()
const receivedReviews = ref<Review[]>(reviewStore.getReceivedReviews)
const sentReviews = ref<Review[]>(reviewStore.getSentReviews)

const eventStore = useEventStore()
const events = ref<Event[]>(eventStore.getAllEvents)
const completedMerchantEvents = ref<Event[]>(events.value.filter((event: Event) => event.merchant === route.params.id && event.status === 'completed'))
const pendingReviews = ref<Event[]>(completedMerchantEvents.value.filter((event: Event) => {
  // Check if this event's id is NOT in the sentReviews array
  return !sentReviews.value.some((review: Review) => review.event_id === event.id)
}))

// Analytics data
const analytics = ref({
  foodTruckRating: 4.3,
  foodTruckReviews: 12,
  userRating: 4.1,
  userReviews: 8
})

// Tab state
const activeTabIndex = ref(0)

// Pending reviews state
const showPendingReviews = ref(false)

const getVendorProp = (vendorId: string, prop: string): string => {
  const allVendors = vendorStore.getAllVendors
  const vendor = allVendors.find((v: any) => v.id === vendorId)
  return vendor?.[prop] || ''
}

// Hard-coded review data
const foodTruckReviews = ref<Review[]>([
  {
    id: '1',
    vendor_name: "Taco Truck Deluxe",
    vendor_avatar: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center",
    cuisine_type: "Mexican",
    rating: 5,
    comment: "Excellent service and delicious food. The tacos were fresh and flavorful. Highly recommend!",
    event_title: "Taco Tuesday Event",
    event_date: "2024-01-15",
    created_at: "2024-01-16"
  },
  {
    id: '2',
    vendor_name: "Burger Barn",
    vendor_avatar: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop&crop=center",
    cuisine_type: "American",
    rating: 4,
    comment: "Great burgers and friendly staff. The event went smoothly.",
    event_title: "Weekend BBQ Bash",
    event_date: "2024-01-10",
    created_at: "2024-01-11"
  },
  {
    id: '3',
    vendor_name: "Pizza Express",
    vendor_avatar: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop&crop=center",
    cuisine_type: "Italian",
    rating: 4,
    comment: "Good pizza, but arrived a bit late. Overall satisfied with the service.",
    event_title: "Pizza Party Night",
    event_date: "2024-01-05",
    created_at: "2024-01-06"
  }
])

const userReviews = ref<Review[]>([
  {
    id: '1',
    user_name: "John Smith",
    user_email: "john.smith@email.com",
    rating: 5,
    comment: "Amazing venue and great food truck selection! The atmosphere was perfect for our event.",
    event_title: "Corporate Lunch Event",
    event_date: "2024-01-15",
    created_at: "2024-01-16"
  },
  {
    id: '2',
    user_name: "Sarah Johnson",
    user_email: "sarah.j@email.com",
    rating: 4,
    comment: "Really enjoyed the food truck event. The variety was great and everything tasted delicious.",
    event_title: "Birthday Celebration",
    event_date: "2024-01-10",
    created_at: "2024-01-11"
  },
  {
    id: '3',
    user_name: "Mike Davis",
    user_email: "mike.davis@email.com",
    rating: 3,
    comment: "The event was okay, but the food trucks were a bit slow with service.",
    event_title: "Team Building Event",
    event_date: "2024-01-05",
    created_at: "2024-01-06"
  }
])

// Methods
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

const writeReview = (event: Event) => {
  // TODO: Implement review writing functionality
  console.log('Writing review for event:', event)
  // This could open a modal or navigate to a review form
}

onMounted(() => {
  console.log(pendingReviews.value)
})

useSeoMeta({ title: () => `${merchant.value?.name || 'Merchant'} - Ratings & Reviews` })
</script>

<style scoped>
/* Remove background from PrimeVue Tabs */
:deep(.p-tabs) {
  background: transparent !important;
}

:deep(.p-tablist) {
  background: transparent !important;
}

:deep(.p-tablist-content) {
  background: transparent !important;
}

:deep(.p-tablist-tab-list) {
  background: transparent !important;
}

:deep(.p-tabpanels) {
  background: transparent !important;
}

:deep(.p-tabpanel) {
  background: transparent !important;
}
</style>
