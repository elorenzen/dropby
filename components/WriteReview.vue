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
        <div class="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
          <i class="pi pi-star text-accent"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-color">Write Review</h3>
          <p class="text-sm text-md-gray">{{ isVendor ? 'Share your experience with this establishment' : 'Share your experience with this food truck' }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Event Information -->
      <div v-if="event" class="bg-surface-section rounded-lg p-4 border border-surface-border">
        <div class="flex items-center gap-3">
          <NuxtImg 
            :src="getRecipientAvatar()" 
            :alt="getRecipientName()" 
            class="w-12 h-12 rounded-full"
          />
          <div class="flex-1">
            <h4 class="font-semibold text-color">{{ getRecipientName() }}</h4>
            <p class="text-sm text-md-gray">Event Date: {{ new Date(event.start).toLocaleDateString() }}</p>
            <p class="text-xs text-md-gray">Time: {{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
          </div>
        </div>
      </div>

      <!-- Rating Section -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-color">Rating *</label>
        <div class="flex items-center gap-2">
          <Rating 
            v-model="rating" 
            :cancel="false" 
            class="text-2xl"
            :pt="{
              onIcon: { class: 'text-accent' },
              offIcon: { class: 'text-md-gray' }
            }"
          />
          <span v-if="rating > 0" class="text-sm text-md-gray ml-2">{{ rating }} star{{ rating > 1 ? 's' : '' }}</span>
        </div>
        <p v-if="rating === 0" class="text-xs text-error">Please select a rating</p>
      </div>

      <!-- Review Text -->
      <div class="space-y-3">
        <label for="review" class="block text-sm font-medium text-color">Review *</label>
        <Textarea 
          id="review" 
          v-model="review" 
          rows="6" 
          :placeholder="isVendor ? 'Share your experience with this establishment. What went well? What could be improved?' : 'Share your experience with this food truck. What went well? What could be improved?'"
          class="w-full resize-none"
          :class="{ 'border-error': review.length === 0 && showValidation }"
        />
        <div class="flex justify-between items-center">
          <p v-if="review.length === 0 && showValidation" class="text-xs text-error">Please write a review</p>
          <p class="text-xs text-md-gray">{{ review.length }}/500 characters</p>
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
import { useToast } from '~/composables/useToast'

import type { Event } from '~/types'

interface Props {
  visible: boolean
  event: Event
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
const { showToast } = useToast()
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

const closeDialog = () => {
  review.value = ''
  rating.value = 0
  showValidation.value = false
  emit('update:visible', false)
}

const submitReview = async () => {
  showValidation.value = true
  
  if (!canSubmit.value) {
    showToast('error', 'Validation Error', 'Please provide both a rating and review text')
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
    
    closeDialog()
    emit('review-submitted')
    
    showToast('success', 'Review Submitted', 'Your review has been submitted successfully')
  } catch (error) {
    console.error('Error submitting review:', error)
    showToast('error', 'Error', 'Failed to submit review. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Review Dialog Styles - only custom overrides needed */
:deep(.review-dialog .p-rating .p-rating-item .p-rating-icon) {
  font-size: 1.5rem;
}

/* Custom error state for textarea - PrimeVue handles default styling */
:deep(.review-dialog .p-textarea.border-red-500) {
  border-color: var(--p-danger-color);
  box-shadow: 0 0 0 3px rgba(from var(--p-danger-color) r g b / 0.2);
}
</style> 