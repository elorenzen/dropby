<template>
  <div class="min-h-screen bg-background p-4 md:p-6">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="false" :show-list="true" :list-rows="4" />

    <div v-else>
    <!-- Header Section -->
    <div class="mb-6 md:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-text-main mb-2">
            Ratings & Reviews
          </h1>
          <p class="text-text-muted text-base md:text-lg">
            Manage and view all ratings for {{ merchant?.name || 'your business' }}
          </p>
        </div>
        <div class="flex flex-col items-start sm:items-end gap-2">
          <p class="text-xl md:text-2xl font-bold text-text-main">Your Rating:</p>
          <Tag severity="info" rounded>
            <p class="text-2xl md:text-3xl font-bold text-text-main">{{ analytics.foodTruckRating }} / 5</p>
          </Tag>
        </div>
      </div>
    </div>

    <!-- Pending Reviews Notification -->
    <Card v-if="pendingReviews.length > 0" class="mb-6 border-accent-light bg-accent-light">
      <template #content>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-accent-light flex-shrink-0 flex items-center justify-center">
              <i class="pi pi-exclamation-triangle icon-accent"></i>
            </div>
            <div>
              <h4 class="font-semibold text-accent-dark">
                {{ pendingReviews.length }} Event{{ pendingReviews.length > 1 ? 's' : '' }} Need{{ pendingReviews.length > 1 ? '' : 's' }} Review
              </h4>
              <p class="text-sm text-accent-dark">
                <template v-if="canCreatePostEventReviews">
                  Write reviews for completed events to help other merchants
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
            class="self-start sm:self-auto"
          />
        </div>
        
        <!-- Pending Reviews List -->
        <div v-if="showPendingReviews" class="mt-4 space-y-2">
          <ReviewCard
            v-for="event in pendingReviews"
            :key="event.id"
            :avatar="getVendorProp(event.vendor || '', 'avatar_url')"
            :name="getVendorProp(event.vendor || '', 'vendor_name')"
            :event-date="getEventProp(event.id, 'day_id')"
            :event-time="getEventTime(event.id)"
            border-class="bg-surface-card border border-accent-light"
            :compact="true"
          >
            <template #middle>
              <p class="text-sm text-text-muted line-clamp-2">{{ getVendorProp(event.vendor || '', 'vendor_description') || 'No description available' }}</p>
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
            :avatar="review.vendor_avatar"
            :name="review.vendor_name"
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
            :avatar="review.vendor_avatar"
            :name="review.vendor_name"
            :event-date="review.event_id ? getEventProp(review.event_id, 'day_id') : null"
            :event-time="review.event_id ? getEventTime(review.event_id) : 'N/A'"
            :comment="review.comment"
            :rating="review.rating"
            :created-at="review.created_at"
          />
        </div>
      </template>
    </Card>

    <Dialog 
        :visible="openWriteReviewDialog" 
        @update:visible="openWriteReviewDialog = $event"
        modal 
        :style="{ width: '90vw', maxWidth: '500px' }"
        :closable="true"
        :closeOnEscape="true"
        class="review-dialog"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <i class="pi pi-star icon-primary"></i>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-text-main">Write Review</h3>
                    <p class="text-sm text-text-muted">Share your experience with this vendor</p>
                </div>
            </div>
        </template>

        <div class="space-y-6">
            <Message
              v-if="!canCreatePostEventReviews"
              severity="warn"
              :closable="false"
              class="w-full"
            >
              Post-event reviews are available on Pro and Premium. Upgrade your plan to write reviews after completed events.
            </Message>
            <!-- Event Information -->
            <div v-if="selectedEvent" class="bg-surface-section rounded-lg p-4 border border-surface-border">
                <div class="flex items-center gap-3">
                    <NuxtImg 
                        :src="getVendorProp(selectedEvent.vendor || '', 'avatar_url')" 
                        :alt="getVendorProp(selectedEvent.vendor || '', 'vendor_name')" 
                        class="w-12 h-12 rounded-full"
                    />
                    <div class="flex-1">
                        <h4 class="font-semibold text-text-main">{{ getVendorProp(selectedEvent.vendor || '', 'vendor_name') }}</h4>
                        <p class="text-sm text-text-muted">Event Date: {{ selectedEvent ? (getEventProp(selectedEvent.id, 'day_id') ? new Date(getEventProp(selectedEvent.id, 'day_id')).toLocaleDateString() : 'N/A') : 'N/A' }}</p>
                        <p class="text-xs text-text-muted">Time: {{ selectedEvent ? getEventTime(selectedEvent.id) : 'N/A' }}</p>
                    </div>
                </div>
            </div>

            <!-- Rating Section -->
            <div class="space-y-3">
                <label class="block text-sm font-medium text-text-main">Rating *</label>
                <div class="flex items-center gap-2">
                    <Rating 
                        v-model="rating" 
                        :cancel="false" 
                        class="text-2xl"
                        :pt="{
                            onIcon: { class: 'text-accent' },
                            offIcon: { class: 'text-md-gray dark:text-md-gray' }
                        }"
                    />
                    <span v-if="rating > 0" class="text-sm text-text-muted ml-2">{{ rating }} star{{ rating > 1 ? 's' : '' }}</span>
                </div>
                <p v-if="rating === 0" class="text-xs text-error">Please select a rating</p>
            </div>

            <!-- Review Text -->
            <div class="space-y-3">
                <label for="review" class="block text-sm font-medium text-text-main">Review *</label>
                <Textarea 
                    id="review" 
                    v-model="review" 
                    rows="6" 
                    placeholder="Share your experience with this vendor. What went well? What could be improved?"
                    class="w-full resize-none"
                    :class="{ 'border-red-500': review.length === 0 && showValidation }"
                />
                <div class="flex justify-between items-center">
                    <p v-if="review.length === 0 && showValidation" class="text-xs text-error">Please write a review</p>
                    <p class="text-xs text-text-muted">{{ review.length }}/500 characters</p>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <Button 
                    label="Cancel" 
                    severity="secondary" 
                    outlined
                    @click="closeReviewDialog" 
                />
                <Button 
                    label="Submit Review" 
                    :loading="submittingReview" 
                    :disabled="!canSubmit"
                    @click="submitReview"
                    class="min-w-[120px]"
                />
            </div>
        </template>
    </Dialog>
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
const user = useSupabaseUser()
import { v4 as uuidv4 } from 'uuid'
const vendorStore = useVendorStore()
const merchantStore = useMerchantStore()

// Load vendors if store is empty
if (vendorStore.allVendors.length === 0) {
  await vendorStore.loadVendors()
}

const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))

const eventStore = useEventStore()
if (eventStore.allEvents.length === 0) {
  await eventStore.loadEvents()
}

const reviewStore = useReviewStore()
const subscriptionStore = useSubscriptionStore()

const canCreatePostEventReviews = computed(() => subscriptionStore.canCreatePostEventReviews)

// Transform database reviews to display format
const transformReviewForDisplay = (review: any, isReceived: boolean = true): DisplayReview => {
  // For received reviews: sender_id is the vendor who wrote the review
  // For sent reviews: recipient_id is the vendor who received the review
  const vendorId = isReceived ? review.sender_id : review.recipient_id
  
  return {
    id: review.id,
    vendor_avatar: getVendorProp(vendorId, 'avatar_url'),
    vendor_name: getVendorProp(vendorId, 'vendor_name'),
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
const completedMerchantEvents = ref<Event[]>(events.value.filter((event: Event) => event.merchant === (route.params.id as string) && event.status === 'completed'))
const pendingReviews = computed(() => completedMerchantEvents.value.filter((event: Event) => {
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

// Analytics data - food truck rating from real data, user rating hardcoded
const analytics = computed(() => {
  // Calculate food truck rating from received reviews
  const foodTruckReviews = receivedReviews.value
  const foodTruckRating = foodTruckReviews.length > 0 
    ? Math.round((foodTruckReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / foodTruckReviews.length) * 10) / 10
    : 0

  return {
    foodTruckRating,
    foodTruckReviews: foodTruckReviews.length
  }
})

const review = ref('')
const rating = ref(0)
const loading = ref(true)
const showValidation = ref(false)

const openWriteReviewDialog = ref(false)
const selectedEvent = ref<Event | null>(null)

// Pending reviews state
const showPendingReviews = ref(false)

// Delete review state
const showDeleteDialog = ref(false)
const deletingReview = ref(false)
const selectedReviewForDelete = ref<DisplayReview | null>(null)

// Computed properties
const canSubmit = computed(() => {
  return (
    canCreatePostEventReviews.value &&
    review.value.trim().length > 0 &&
    rating.value > 0
  )
})

const submittingReview = ref(false)

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

const getVendorProp = (vendorId: string, prop: string): string => {
  return vendorStore.getVendorProp(vendorId, prop)
}

const getEventProp = (eventId: string, prop: string): string => {
  return eventStore.getEventProp(eventId, prop)
}

const getEventTime = (eventId: string): string => {
  const start = getEventProp(eventId, 'start')
  const end = getEventProp(eventId, 'end')
  if (!start || !end) return 'N/A'
  return `${new Date(start).toLocaleTimeString()} - ${new Date(end).toLocaleTimeString()}`
}




// Methods
const closeReviewDialog = () => {
    openWriteReviewDialog.value = false
    review.value = ''
    rating.value = 0
    showValidation.value = false
    selectedEvent.value = null
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
        const reviewStore = useReviewStore()
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

const submitReview = async () => {
    showValidation.value = true

    if (!canCreatePostEventReviews.value) {
        showToast(
            'warn',
            'Plan required',
            'Post-event reviews are available on Pro and Premium.'
        )
        return
    }

    if (!canSubmit.value) {
        showToast('error', 'Validation Error', 'Please provide both a rating and review text')
        return
    }

    try {
        submittingReview.value = true

        // Validate required data before creating review
        if (!user.value?.id || !selectedEvent.value?.vendor || !selectedEvent.value?.id) {
            throw new Error('Missing required data for review creation')
        }

        await reviewStore.createReview({
            id: uuidv4(),
            created_at: new Date().toISOString(),
            author_id: user.value.id,
            sender_id: route.params.id as string,
            recipient_id: selectedEvent.value.vendor,
            content: review.value,
            rating: rating.value,
            event_id: selectedEvent.value.id,
        })

        closeReviewDialog()
        showToast('success', 'Review Submitted', 'Your review has been submitted successfully')
    } catch (error: unknown) {
        console.error('Error submitting review:', error)
        const message =
            error instanceof Error ? error.message : 'Failed to submit review. Please try again.'
        showToast('error', 'Error', message)
    } finally {
        submittingReview.value = false
    }
}

onMounted(async () => {
  if (!subscriptionStore.activeSubscription) {
    try {
      await subscriptionStore.setActiveSubscription(String(route.params.id), 'merchant')
    } catch {
      console.log('No active subscription found for merchant')
    }
  }

  await reviewStore.loadReviewsForUser(route.params.id as string)
  loading.value = false

  console.log('Pending reviews:', pendingReviews.value)
  console.log('Sent reviews:', sentReviews.value)
})

useSeoMeta({ title: () => `Ratings & Reviews | ${merchant.value?.merchant_name || 'Merchant'}` })
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
