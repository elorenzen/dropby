<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :style="{ width: '90vw', maxWidth: '500px' }"
    :closable="true"
    :closeOnEscape="true"
    class="review-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
          <i class="pi pi-star text-orange-600 dark:text-orange-400"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-text-main">Write Review</h3>
          <p class="text-sm text-text-muted">{{ isVendor ? 'Share your experience with this establishment' : 'Share your experience with this food truck' }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Event Information -->
      <div v-if="event" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <NuxtImg 
            :src="getRecipientAvatar()" 
            :alt="getRecipientName()" 
            class="w-12 h-12 rounded-full"
          />
          <div class="flex-1">
            <h4 class="font-semibold text-text-main">{{ getRecipientName() }}</h4>
            <p class="text-sm text-text-muted">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
            <p class="text-xs text-text-muted">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
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
              onIcon: { class: 'text-orange-500' },
              offIcon: { class: 'text-gray-300 dark:text-gray-600' }
            }"
          />
          <span v-if="rating > 0" class="text-sm text-text-muted ml-2">{{ rating }} star{{ rating > 1 ? 's' : '' }}</span>
        </div>
        <p v-if="rating === 0" class="text-xs text-red-500">Please select a rating</p>
      </div>

      <!-- Review Text -->
      <div class="space-y-3">
        <label for="review" class="block text-sm font-medium text-text-main">Review *</label>
        <Textarea 
          id="review" 
          v-model="review" 
          rows="6" 
          :placeholder="isVendor ? 'Share your experience with this establishment. What went well? What could be improved?' : 'Share your experience with this food truck. What went well? What could be improved?'"
          class="w-full resize-none"
          :class="{ 'border-red-500': review.length === 0 && showValidation }"
        />
        <div class="flex justify-between items-center">
          <p v-if="review.length === 0 && showValidation" class="text-xs text-red-500">Please write a review</p>
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
          @click="closeDialog" 
        />
        <Button 
          label="Submit Review" 
          :loading="loading" 
          :disabled="!canSubmit"
          @click="submitReview"
          class="min-w-[120px]"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

interface Props {
  visible: boolean
  event: any
  isVendor?: boolean
  senderId: string
  recipientId: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'review-submitted'): void
}

const props = withDefaults(defineProps<Props>(), {
  isVendor: false
})

const emit = defineEmits<Emits>()

const user = useSupabaseUser()
const toast = useToast()
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const reviewStore = useReviewStore()
const timelineStore = useTimelineStore()

// Reactive data
const review = ref('')
const rating = ref(0)
const loading = ref(false)
const showValidation = ref(false)

// Computed properties
const canSubmit = computed(() => {
  return review.value.trim().length > 0 && rating.value > 0
})

// Helper functions
const getRecipientName = (): string => {
  if (props.isVendor) {
    // Vendor is reviewing a merchant
    const merchant = merchantStore.getAllMerchants.find((m: any) => m.id === props.recipientId)
    return merchant?.merchant_name || 'Unknown Establishment'
  } else {
    // Merchant is reviewing a vendor
    const vendor = vendorStore.getAllVendors.find((v: any) => v.id === props.recipientId)
    return vendor?.vendor_name || 'Unknown Food Truck'
  }
}

const getRecipientAvatar = (): string => {
  if (props.isVendor) {
    // Vendor is reviewing a merchant
    const merchant = merchantStore.getAllMerchants.find((m: any) => m.id === props.recipientId)
    return merchant?.avatar_url || 'https://placehold.co/400x300?text=Establishment'
  } else {
    // Merchant is reviewing a vendor
    const vendor = vendorStore.getAllVendors.find((v: any) => v.id === props.recipientId)
    return vendor?.avatar_url || 'https://placehold.co/400x300?text=Food+Truck'
  }
}

const addTimelineEvent = async (timelineObj: any) => {
  try {
    await timelineStore.createTimelineItem({
      id: uuidv4(),
      owner_id: timelineObj.ownerId,
      title: timelineObj.title,
      description: timelineObj.description,
      type: timelineObj.type
    })
  } catch (error) {
    console.error('Timeline Event Creation Error:', error)
  }
}

// Methods
const closeDialog = () => {
  review.value = ''
  rating.value = 0
  showValidation.value = false
  emit('update:visible', false)
}

const submitReview = async () => {
  showValidation.value = true
  
  if (!canSubmit.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please provide both a rating and review text',
      life: 3000
    })
    return
  }

  try {
    loading.value = true
    await reviewStore.createReview({
      id: uuidv4(),
      created_at: new Date().toISOString(),
      author_id: user.value?.id,
      sender_id: props.senderId,
      recipient_id: props.recipientId,
      content: review.value,
      rating: rating.value,
      event_id: props.event?.id,
    })
    
    // Add timeline event for successful review submission
    await addTimelineEvent({
      ownerId: props.senderId,
      title: 'Review Submitted',
      description: `Submitted a ${rating.value}-star review for ${getRecipientName()}`,
      type: 'rating'
    })
    
    closeDialog()
    emit('review-submitted')
    
    toast.add({
      severity: 'success',
      summary: 'Review Submitted',
      detail: 'Your review has been submitted successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to submit review. Please try again.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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