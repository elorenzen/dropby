<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="false" :show-list="true" :list-rows="4" />

    <div v-else>
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Ratings & Reviews
          </h1>
          <p class="text-text-muted text-lg">
            Manage and view all ratings for {{ vendor?.vendor_name || 'your food truck' }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <p class="text-2xl font-bold text-text-main">Your Rating:</p>
          <Tag severity="info" rounded>
              <p class="text-3xl font-bold text-text-main">{{ analytics.establishmentRating }} / 5</p>
          </Tag>
        </div>
      </div>
    </div>

    <!-- Pending Reviews Notification -->
    <Card v-if="pendingReviews.length > 0" class="mb-6 border-accent-light bg-accent-light">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
              <i class="pi pi-exclamation-triangle icon-accent"></i>
            </div>
            <div>
              <h4 class="font-semibold text-accent-dark">
                {{ pendingReviews.length }} Event{{ pendingReviews.length > 1 ? 's' : '' }} Need{{ pendingReviews.length > 1 ? '' : 's' }} Review
              </h4>
              <p class="text-sm text-accent-dark">
                <template v-if="canCreatePostEventReviews">
                  Write reviews for completed events to help other vendors
                </template>
                <template v-else>
                  Post-event reviews are a Pro and Premium feature. You can still read reviews you receive.
                </template>
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
        <div v-if="showPendingReviews" class="mt-4 space-y-2">
          <ReviewCard
            v-for="event in pendingReviews"
            :key="event.id"
            :avatar="getMerchantProp(event.merchant || '', 'avatar_url')"
            :name="getMerchantProp(event.merchant || '', 'merchant_name')"
            :event-date="getEventProp(event.id, 'day_id')"
            :event-time="getEventTime(event.id)"
            border-class="bg-surface-card border border-accent-light"
            :compact="true"
          >
            <template #middle>
              <p class="text-sm text-text-muted line-clamp-2">{{ getMerchantProp(event.merchant || '', 'merchant_description') || 'No description available' }}</p>
            </template>
            <template #actions>
              <Button 
                :disabled="!canCreatePostEventReviews"
                @click="openWriteReviewForEvent(event)"
                label="Write Review"
                severity="warning"
                size="small"
              />
            </template>
          </ReviewCard>
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
          <ReviewCard
            v-for="review in sentReviews"
            :key="review.id"
            :avatar="review.merchant_avatar"
            :name="review.merchant_name"
            :event-date="review.event_id ? getEventProp(review.event_id, 'day_id') : null"
            :event-time="review.event_id ? getEventTime(review.event_id) : 'N/A'"
            :comment="review.comment"
            :rating="review.rating"
            :created-at="review.created_at"
          >
            <template #actions>
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                text 
                size="small"
                @click="openDeleteDialog(review)"
                class="text-error hover:text-error-dark"
              />
            </template>
          </ReviewCard>
        </div>
      </template>
    </Card>

    <!-- Received Reviews -->
    <Card>
      <template #title>
        <h3 class="text-xl font-semibold">Received Reviews</h3>
      </template>
      <template #content>
        <div class="space-y-3">
          <ReviewCard
            v-for="review in receivedReviews"
            :key="review.id"
            :avatar="review.merchant_avatar"
            :name="review.merchant_name"
            :event-date="review.event_id ? getEventProp(review.event_id, 'day_id') : null"
            :event-time="review.event_id ? getEventTime(review.event_id) : 'N/A'"
            :comment="review.comment"
            :rating="review.rating"
            :created-at="review.created_at"
          />
        </div>
      </template>
    </Card>

    <!-- Write Review Dialog -->
    <WriteReview
      :visible="openWriteReviewDialog"
      :event="selectedEvent"
      :is-vendor="true"
      :sender-id="vendorId"
      :recipient-id="selectedEvent?.merchant || ''"
      @update:visible="openWriteReviewDialog = $event"
      @review-submitted="onReviewSubmitted"
    />
    <Toast group="main" position="bottom-center" />
    
    <!-- Delete Review Dialog -->
    <DeleteDialog
      :visible="showDeleteDialog"
      item-type="Review"
      :loading="deletingReview"
      @delete-cancel="closeDeleteDialog"
      @delete-confirm="confirmDeleteReview"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import PageSkeleton from '~/components/skeleton/PageSkeleton.vue'
import ReviewCard from '~/components/ReviewCard.vue'
const { showToast } = useToast()
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const vendorId = computed(() => String(route.params.id))
const vendorStore = useVendorStore()
const merchantStore = useMerchantStore()

if (merchantStore.allMerchants.length === 0) {
  await merchantStore.loadMerchants()
}

const vendor = ref<any>(await vendorStore.getVendorById(route.params.id))

const eventStore = useEventStore()
if (eventStore.allEvents.length === 0) {
  await eventStore.loadEvents()
}

const reviewStore = useReviewStore()
const subscriptionStore = useSubscriptionStore()

const canCreatePostEventReviews = computed(() => subscriptionStore.canCreatePostEventReviews)

const openWriteReviewForEvent = (event: Event) => {
  if (!canCreatePostEventReviews.value) {
    showToast(
      'warn',
      'Plan required',
      'Post-event reviews are available on Pro and Premium.'
    )
    return
  }
  selectedEvent.value = event
  openWriteReviewDialog.value = true
}

const getMerchantProp = (merchantId: string, prop: string): string => {
  return merchantStore.getMerchantProp(merchantId, prop)
}

const getEventProp = (eventId: string, prop: string): string => {
  return eventStore.getEventProp(eventId, prop)
}

// Transform database reviews to display format
const transformReviewForDisplay = (review: any, isReceived: boolean = true): DisplayReview => {
  // For received reviews: sender_id is the merchant who wrote the review
  // For sent reviews: recipient_id is the merchant who received the review
  const merchantId = isReceived ? review.sender_id : review.recipient_id
  
  return {
    id: review.id,
    merchant_avatar: getMerchantProp(merchantId, 'avatar_url'),
    merchant_name: getMerchantProp(merchantId, 'merchant_name'),
    event_date: getEventProp(review.event_id, 'day_id'),
    comment: review.content,
    rating: review.rating,
    created_at: review.created_at,
    event_id: review.event_id,
    author_id: review.author_id,
    sender_id: review.sender_id,
    recipient_id: review.recipient_id,
    content: review.content
  } as DisplayReview
}

const receivedReviews = computed<DisplayReview[]>(() => reviewStore.getReceivedReviews.map((r: any) => transformReviewForDisplay(r, true)))
const sentReviews = computed<DisplayReview[]>(() => reviewStore.getSentReviews.map((r: any) => transformReviewForDisplay(r, false)))

const events = computed<Event[]>(() => eventStore.getAllEvents)
const loading = ref(true)
const completedVendorEvents = ref<Event[]>(events.value.filter((event: Event) => event.vendor === (route.params.id as string) && event.status === 'completed'))
const pendingReviews = computed(() => completedVendorEvents.value.filter((event: Event) => {
  // Check if this event's id is NOT in the sentReviews array
  return !sentReviews.value.some((review: Review) => review.event_id === event.id)
}))

import type { Event, Review } from '~/types'

// Extended Review type for display with merchant/vendor data
interface DisplayReview extends Review {
  merchant_avatar?: string
  merchant_name?: string
  vendor_avatar?: string
  vendor_name?: string
  comment?: string
  event_date?: string
}

// Analytics data
const analytics = computed(() => ({
  establishmentRating: receivedReviews.value.length > 0 ? receivedReviews.value.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.value.length : 0,
  establishmentReviews: receivedReviews.value.length
}))

const openWriteReviewDialog = ref(false)
const selectedEvent = ref<Event | null>(null)

// Pending reviews state
const showPendingReviews = ref(false)

// Delete review state
const showDeleteDialog = ref(false)
const deletingReview = ref(false)
const selectedReviewForDelete = ref<DisplayReview | null>(null)

const getEventTime = (eventId: string): string => {
  const start = getEventProp(eventId, 'start')
  const end = getEventProp(eventId, 'end')
  if (!start || !end) return 'N/A'
  return `${new Date(start).toLocaleTimeString()} - ${new Date(end).toLocaleTimeString()}`
}



// Methods

const onReviewSubmitted = () => {
  // Refresh the reviews data
  // The real-time subscription will handle updating the reviews
  console.log('Review submitted successfully')
}

const openDeleteDialog = (review: DisplayReview) => {
    selectedReviewForDelete.value = review
    showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
    showDeleteDialog.value = false
    selectedReviewForDelete.value = null
}

const confirmDeleteReview = async () => {
    if (!selectedReviewForDelete.value) return
    
    deletingReview.value = true
    try {
        await reviewStore.deleteReview(selectedReviewForDelete.value.id)
        
        closeDeleteDialog()
        showToast('success', 'Review Deleted', 'Your review has been deleted successfully')
        
    } catch (error: any) {
        console.error('Error deleting review:', error)
        showToast('error', 'Error', 'Failed to delete review. Please try again.')
    } finally {
        deletingReview.value = false
    }
}

onMounted(async () => {
  if (!subscriptionStore.activeSubscription) {
    try {
      await subscriptionStore.setActiveSubscription(String(route.params.id), 'vendor')
    } catch {
      console.log('No active subscription found for vendor')
    }
  }

  await reviewStore.loadReviewsForUser(route.params.id as string)
  loading.value = false

  console.log('Pending reviews:', pendingReviews.value)
  console.log('Sent reviews:', sentReviews.value)
})

useSeoMeta({ title: () => `Ratings & Reviews | ${vendor.value?.vendor_name || 'Vendor'}` })
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

/* Review Dialog Styles */
:deep(.review-dialog .p-dialog-header) {
  border-bottom: 1px solid rgb(229 231 235);
  padding: 1.5rem;
}

:deep(.review-dialog .p-dialog-content) {
  padding: 1.5rem;
}

:deep(.review-dialog .p-dialog-footer) {
  border-top: 1px solid rgb(229 231 235);
  padding: 1rem 1.5rem;
}

:deep(.review-dialog .p-rating .p-rating-item .p-rating-icon) {
  font-size: 1.5rem;
}

:deep(.review-dialog .p-textarea) {
  border-radius: 0.5rem;
  border: 1px solid rgb(209 213 219);
  transition: border-color 0.2s ease;
}

:deep(.review-dialog .p-textarea:focus) {
  border-color: rgb(249 115 22);
  box-shadow: 0 0 0 3px rgb(254 215 170);
}

:deep(.review-dialog .p-textarea.border-red-500) {
  border-color: rgb(239 68 68);
  box-shadow: 0 0 0 3px rgb(254 202 202);
}
</style>
