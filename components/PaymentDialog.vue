<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :style="{ width: '90vw', maxWidth: '500px' }"
    :closable="!processing"
    :closeOnEscape="!processing"
    class="payment-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <i class="pi pi-credit-card text-blue-600 dark:text-blue-400"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-text-main">Complete Payment</h3>
          <p class="text-sm text-text-muted">Secure payment for event booking</p>
        </div>
      </div>
    </template>

    <div v-if="!processing && !paymentSuccess" class="space-y-6">
      <!-- Payment Summary -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="font-semibold text-text-main mb-3">Payment Summary</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-text-muted">Event Value:</span>
            <span class="font-medium">${{ eventValue.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Platform Fee (8%):</span>
            <span class="font-medium">${{ platformFee.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Processing Fee:</span>
            <span class="font-medium">${{ processingFee.toFixed(2) }}</span>
          </div>
          <div class="border-t pt-2 mt-2">
            <div class="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span class="text-lg">${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Details -->
      <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
        <h4 class="font-semibold text-text-main mb-2">Event Details</h4>
        <div class="space-y-1 text-sm">
          <div><span class="text-text-muted">Date:</span> {{ formatDate(event.start) }}</div>
          <div><span class="text-text-muted">Time:</span> {{ formatTime(event.start) }} - {{ formatTime(event.end) }}</div>
          <div><span class="text-text-muted">Vendor:</span> {{ vendorName }}</div>
          <div><span class="text-text-muted">Location:</span> {{ event.location_address || 'TBD' }}</div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-text-main">Payment Method</label>
        <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <i class="pi pi-credit-card text-2xl text-blue-600"></i>
            <div>
              <p class="font-medium">Credit/Debit Card</p>
              <p class="text-sm text-text-muted">Secure payment via Stripe</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="space-y-3">
        <div class="flex items-start gap-2">
          <Checkbox 
            v-model="acceptedTerms" 
            :binary="true" 
            :invalid="showTermsError"
          />
          <div class="text-sm">
            <p>I agree to the <a href="#" class="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a></p>
            <p class="text-text-muted mt-1">By completing this payment, you agree to pay the total amount shown above.</p>
          </div>
        </div>
        <small v-if="showTermsError" class="text-red-500">Please accept the terms and conditions to continue</small>
      </div>
    </div>

    <!-- Processing State -->
    <div v-if="processing" class="text-center py-8">
      <ProgressSpinner size="large" />
      <p class="mt-4 text-text-muted">Processing your payment...</p>
      <p class="text-sm text-text-muted mt-2">Please do not close this window</p>
    </div>

    <!-- Success State -->
    <div v-if="paymentSuccess" class="text-center py-8">
      <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-check text-2xl text-green-600 dark:text-green-400"></i>
      </div>
      <h4 class="text-xl font-semibold text-text-main mb-2">Payment Successful!</h4>
      <p class="text-text-muted mb-4">Your event has been booked and confirmed.</p>
      <div class="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-sm">
        <p class="font-medium mb-1">Confirmation Details:</p>
        <p>Event: {{ formatDate(event.start) }} at {{ formatTime(event.start) }}</p>
        <p>Vendor: {{ vendorName }}</p>
        <p>Amount Paid: ${{ totalAmount.toFixed(2) }}</p>
      </div>
    </div>

    <template #footer>
      <div v-if="!processing && !paymentSuccess" class="flex justify-end gap-3">
        <Button 
          label="Cancel" 
          severity="secondary" 
          outlined
          @click="closeDialog" 
        />
        <Button 
          label="Complete Payment" 
          @click="processPayment"
          :disabled="!acceptedTerms"
          :loading="processing"
        />
      </div>
      <div v-if="paymentSuccess" class="flex justify-end">
        <Button 
          label="Done" 
          @click="closeDialog" 
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

interface Event {
  id: string
  start: string
  end: string
  location_address?: string
  event_value?: number
  [key: string]: any
}

interface PaymentData {
  paymentId: string
  amount: number
  platformFee: number
  processingFee: number
  totalAmount: number
}

interface Props {
  visible: boolean
  event: Event
  vendorId: string
  vendorName: string
  merchantId: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'payment-success', paymentData: PaymentData): void
  (e: 'payment-error', error: Error): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const supabase = useSupabaseClient()
const toast = useToast()

// Payment state
const processing = ref(false)
const paymentSuccess = ref(false)
const acceptedTerms = ref(false)
const showTermsError = ref(false)

// Calculate fees
const eventValue = computed(() => props.event.event_value || 0)
const platformFee = computed(() => eventValue.value * 0.08)
const processingFee = computed(() => (eventValue.value * 0.029) + 0.30)
const totalAmount = computed(() => eventValue.value + platformFee.value + processingFee.value)

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const closeDialog = () => {
  if (!processing.value) {
    emit('update:visible', false)
    // Reset state
    paymentSuccess.value = false
    acceptedTerms.value = false
    showTermsError.value = false
  }
}

const processPayment = async () => {
  if (!acceptedTerms.value) {
    showTermsError.value = true
    return
  }

  showTermsError.value = false
  processing.value = true

  try {
    // Create payment intent
    const response = await $fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      body: {
        eventId: props.event.id,
        amount: eventValue.value,
        merchantId: props.merchantId,
        vendorId: props.vendorId
      }
    }) as { success: boolean; paymentIntent: any; paymentId: string }

    if (!response.success) {
      throw new Error('Failed to create payment intent')
    }

    // Simulate payment processing (in real implementation, this would use Stripe Elements)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update event status to paid
    const { error: updateError } = await supabase
      .from('events')
      .update({
        status: 'booked',
        vendor: props.vendorId,
        pending_requests: null,
        payment_status: 'paid',
        payment_id: response.paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.event.id)

    if (updateError) {
      throw new Error('Failed to update event status')
    }

    // Add timeline event
    await addTimelineEvent({
      ownerId: props.merchantId,
      title: 'Payment Completed',
      description: `Payment of $${totalAmount.value.toFixed(2)} completed for event with ${props.vendorName}`,
      type: 'event'
    })

    paymentSuccess.value = true
    emit('payment-success', {
      paymentId: response.paymentId,
      amount: eventValue.value,
      platformFee: platformFee.value,
      processingFee: processingFee.value,
      totalAmount: totalAmount.value
    })

    toast.add({
      severity: 'success',
      summary: 'Payment Successful',
      detail: 'Your event has been booked and confirmed!',
      life: 5000
    })

  } catch (error) {
    console.error('Payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.'
    emit('payment-error', new Error(errorMessage))
    
    toast.add({
      severity: 'error',
      summary: 'Payment Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    processing.value = false
  }
}

const addTimelineEvent = async (timelineObj: any) => {
  const { error } = await supabase.from('timeline_items').insert({
    id: uuidv4(),
    owner_id: timelineObj.ownerId,
    title: timelineObj.title,
    description: timelineObj.description,
    type: timelineObj.type
  } as any)
  if (error) {
    console.error('Timeline Event Creation Error:', error.message)
  }
}
</script>

<style scoped>
.payment-dialog {
  @apply bg-white dark:bg-gray-900;
}
</style> 