<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :style="{ width: '90vw', maxWidth: '500px' }"
    :closable="!processing"
    :closeOnEscape="!processing"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <i class="pi pi-credit-card text-green-600 dark:text-green-400"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-text-main">Complete Payment</h3>
          <p class="text-sm text-text-muted">Secure payment powered by Stripe</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Payment Summary -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="font-semibold text-text-main mb-3">Payment Summary</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-text-muted">Event Value (Vendor Payment):</span>
            <span class="font-medium">${{ formatCurrency(paymentData.amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Platform Fee (8%):</span>
            <span class="font-medium">${{ formatCurrency(paymentData.platformFee) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Processing Fee:</span>
            <span class="font-medium">${{ formatCurrency(paymentData.processingFee) }}</span>
          </div>
          <div class="border-t pt-2 mt-2">
            <div class="flex justify-between font-semibold">
              <span>Total (You Pay):</span>
              <span>${{ formatCurrency(paymentData.totalAmount) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Vendor Payout Info -->
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-center gap-2 mb-1">
            <i class="pi pi-info-circle text-blue-600 dark:text-blue-400"></i>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Vendor Payment</span>
          </div>
          <p class="text-xs text-blue-700 dark:text-blue-300">
            The vendor will receive the full event value of ${{ formatCurrency(paymentData.amount) }} after the event is completed.
          </p>
        </div>
      </div>

      <!-- Payment Form -->
      <div v-if="!processing && !paymentComplete">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-main mb-2">
              Card Information
            </label>
            <div 
              ref="cardElement"
              class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            ></div>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-text-muted">
            <i class="pi pi-lock"></i>
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>
      </div>

      <!-- Processing State -->
      <div v-if="processing" class="text-center py-8">
        <ProgressSpinner class="w-12 h-12 mx-auto mb-4" />
        <p class="text-text-main font-medium">Processing your payment...</p>
        <p class="text-sm text-text-muted">Please don't close this window</p>
      </div>

      <!-- Success State -->
      <div v-if="paymentComplete" class="text-center py-8">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-4 flex items-center justify-center">
          <i class="pi pi-check text-green-600 dark:text-green-400 text-2xl"></i>
        </div>
        <h4 class="text-xl font-semibold text-text-main mb-2">Payment Successful!</h4>
        <p class="text-text-muted mb-4">Your event booking has been confirmed</p>
        
        <!-- Payment Details -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-left">
          <h5 class="font-medium text-green-800 dark:text-green-200 mb-2">Payment Details:</h5>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-green-700 dark:text-green-300">Vendor Payment:</span>
              <span class="font-medium">${{ formatCurrency(paymentData.amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-700 dark:text-green-300">Total Paid:</span>
              <span class="font-medium">${{ formatCurrency(paymentData.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="paymentError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400"></i>
          <span class="font-medium text-red-800 dark:text-red-200">Payment Failed</span>
        </div>
        <p class="text-sm text-red-700 dark:text-red-300">{{ paymentError }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button 
          v-if="!processing && !paymentComplete"
          label="Cancel" 
          severity="secondary" 
          outlined
          @click="$emit('update:visible', false)" 
        />
        <Button 
          v-if="!processing && !paymentComplete"
          label="Pay ${{ formatCurrency(paymentData.totalAmount) }}" 
          severity="success"
          @click="processPayment"
          :disabled="!cardComplete"
        />
        <Button 
          v-if="paymentComplete"
          label="Done" 
          severity="success"
          @click="$emit('payment-complete')" 
        />
        <Button 
          v-if="paymentError"
          label="Try Again" 
          severity="secondary"
          @click="resetPayment" 
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps<{
  visible: boolean
  paymentData: {
    amount: number
    platformFee: number
    processingFee: number
    totalAmount: number
    paymentIntentId: string
    clientSecret: string
  }
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'payment-complete': []
}>()

const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<HTMLElement>()
const cardComplete = ref(false)
const processing = ref(false)
const paymentComplete = ref(false)
const paymentError = ref('')

// Initialize Stripe
onMounted(async () => {
  const stripeInstance = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!)
  stripe.value = stripeInstance
  elements.value = stripeInstance?.elements()
})

// Create card element when dialog opens
watch(() => props.visible, async (newVisible) => {
  if (newVisible && elements.value && cardElement.value) {
    const card = elements.value.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    })
    
    card.mount(cardElement.value)
    card.on('change', (event: any) => {
      cardComplete.value = event.complete
    })
  }
})

const processPayment = async () => {
  if (!stripe.value || !elements.value) return
  
  processing.value = true
  paymentError.value = ''
  
  try {
    const { error } = await stripe.value.confirmCardPayment(props.paymentData.clientSecret, {
      payment_method: {
        card: elements.value.getElement('card'),
      },
    })
    
    if (error) {
      paymentError.value = error.message
    } else {
      paymentComplete.value = true
    }
  } catch (error) {
    paymentError.value = 'An unexpected error occurred. Please try again.'
    console.error('Payment error:', error)
  } finally {
    processing.value = false
  }
}

const resetPayment = () => {
  paymentError.value = ''
  paymentComplete.value = false
  processing.value = false
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}
</script>

<style scoped>
/* Custom styles for Stripe Elements */
:deep(.StripeElement) {
  min-height: 40px;
}
</style> 