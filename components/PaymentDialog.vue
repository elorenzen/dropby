<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
      <div class="modal-content" style="background: #1f2937; border: 1px solid #374151; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 20px 20px 0 20px;">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <i class="pi pi-credit-card text-blue-600 dark:text-blue-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-100">Complete Payment</h3>
              <p class="text-sm text-gray-400">Secure payment for event booking</p>
            </div>
          </div>
          <button @click="closeDialog" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; transition: color 0.2s;" onmouseover="this.style.color='#f9fafb'" onmouseout="this.style.color='#9ca3af'">×</button>
        </div>
        
        <div class="payment-form" style="padding: 0 20px 20px 20px;">
          <div v-if="!processing && !paymentSuccess" class="space-y-6">
            <!-- Payment Summary -->
            <div class="bg-gray-800 rounded-lg p-4">
              <h4 class="font-semibold text-gray-100 mb-3">Payment Summary</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Event Value:</span>
                  <span class="font-medium text-gray-100">${{ eventValue.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Platform Fee (8%):</span>
                  <span class="font-medium text-gray-100">${{ platformFee.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Processing Fee:</span>
                  <span class="font-medium text-gray-100">${{ processingFee.toFixed(2) }}</span>
                </div>
                <div class="border-t border-gray-600 pt-2 mt-2">
                  <div class="flex justify-between font-semibold">
                    <span class="text-gray-100">Total Amount:</span>
                    <span class="text-lg text-gray-100">${{ totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event Details -->
            <div class="bg-blue-900/30 rounded-lg p-4">
              <h4 class="font-semibold text-gray-100 mb-2">Event Details</h4>
              <div class="space-y-1 text-sm">
                <div><span class="text-gray-400">Date:</span> <span class="text-gray-100">{{ formatDate(event.start) }}</span></div>
                <div><span class="text-gray-400">Time:</span> <span class="text-gray-100">{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span></div>
                <div><span class="text-gray-400">Vendor:</span> <span class="text-gray-100">{{ vendorName }}</span></div>
                <div><span class="text-gray-400">Location:</span> <span class="text-gray-100">{{ event.location_address || 'TBD' }}</span></div>
              </div>
            </div>

            <!-- Stripe Elements Card Input -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-100">Payment Method</label>
              <div id="card-element" class="p-4 border border-gray-600 rounded-lg bg-gray-800 min-h-[60px]"></div>
              
              <!-- Fallback input if Stripe fails -->
              <div v-if="cardError" class="p-4 border border-red-600 rounded-lg bg-red-900/20">
                <p class="text-red-400 text-sm mb-2">Stripe Elements failed to load. Please check console for details.</p>
                <input 
                  type="text" 
                  placeholder="Card number (test: 4242 4242 4242 4242)"
                  class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  disabled
                />
              </div>
              
              <!-- Error Message -->
              <div v-if="cardError" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                {{ cardError }}
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="space-y-3">
              <div class="flex items-start gap-2">
                <input type="checkbox" v-model="acceptedTerms" class="mt-1" />
                <div class="text-sm">
                  <p class="text-gray-100">I agree to the <a href="#" class="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" class="text-blue-400 hover:underline">Privacy Policy</a></p>
                  <p class="text-gray-400 mt-1">By completing this payment, you agree to pay the total amount shown above.</p>
                </div>
              </div>
              <small v-if="showTermsError" class="text-red-500">Please accept the terms and conditions to continue</small>
            </div>
          </div>

          <!-- Processing State -->
          <div v-if="processing" class="text-center py-8">
            <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="mt-4 text-gray-400">Processing your payment...</p>
            <p class="text-sm text-gray-400 mt-2">Please do not close this window</p>
          </div>

          <!-- Success State -->
          <div v-if="paymentSuccess" class="text-center py-8">
            <div class="w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-check text-2xl text-green-400"></i>
            </div>
            <h4 class="text-xl font-semibold text-gray-100 mb-2">Payment Successful!</h4>
            <p class="text-gray-400 mb-4">Your event has been booked and payment is held securely.</p>
            <div class="bg-green-900/30 rounded-lg p-4 text-sm">
              <p class="font-medium mb-2 text-gray-100">Payment Breakdown:</p>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                  <span class="text-gray-400">Event Value:</span>
                  <span class="text-gray-100">${{ eventValue.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Platform Fee (8%):</span>
                  <span class="text-gray-100">${{ platformFee.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Processing Fee:</span>
                  <span class="text-gray-100">${{ processingFee.toFixed(2) }}</span>
                </div>
                <div class="border-t border-gray-600 pt-1 mt-1">
                  <div class="flex justify-between font-semibold">
                    <span class="text-gray-100">Total Paid:</span>
                    <span class="text-gray-100">${{ totalAmount.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 p-2 bg-blue-900/20 rounded border border-blue-800">
                <p class="text-xs text-blue-300">
                  <i class="pi pi-info-circle mr-1"></i>
                  <strong>${{ eventValue.toFixed(2) }}</strong> will be released to the vendor after event completion
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="!processing && !paymentSuccess" class="flex gap-3 pt-6">
            <button 
              @click="closeDialog"
              :disabled="processing"
              class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              @click="handlePayment"
              :disabled="!acceptedTerms || processing"
              :class="processing ? 'opacity-50' : ''"
              class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Complete Payment
            </button>
          </div>
          <div v-if="paymentSuccess" class="flex justify-end pt-6">
            <button 
              @click="closeDialog"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'
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

// Computed
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const supabase = useSupabaseClient()
const toast = useToast()

// Payment state
const processing = ref(false)
const paymentSuccess = ref(false)
const acceptedTerms = ref(false)
const showTermsError = ref(false)
const cardError = ref('')

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

// Stripe Elements
const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<any>(null)

// Initialize Stripe
onMounted(async () => {
  if (process.client) {
    const config = useRuntimeConfig()
    const stripeKey = config.public.stripePublishableKey
    if (stripeKey) {
      stripe.value = await loadStripe(stripeKey)
    } else {
      console.error('No Stripe key found!')
    }
  }
})

// Watch for modal visibility
watch(() => props.visible, async (newValue: boolean) => {
  if (newValue && props.event) {
    // Wait for modal to be fully rendered
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Initialize payment form when modal opens
    await initializePaymentForm()
  } else if (!newValue) {
    // Clean up when modal closes
    if (cardElement.value) {
      cardElement.value.destroy()
      cardElement.value = null
    }
  }
})

// Initialize payment form
const initializePaymentForm = async () => {
  if (!stripe.value) {
    cardError.value = 'Stripe not loaded'
    return
  }
  
  try {
    // Destroy existing elements if they exist
    if (cardElement.value) {
      cardElement.value.destroy()
      cardElement.value = null
    }
    
    // Create elements instance
    elements.value = stripe.value.elements()
    
    // Wait a moment for the container to be ready
    await nextTick()
    
    // Create card element
    cardElement.value = elements.value.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#f9fafb',
          backgroundColor: 'transparent',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      },
    })
    
    // Mount card element
    const cardElementContainer = document.getElementById('card-element')
    
    if (cardElementContainer) {
      cardElement.value.mount('#card-element')
    } else {
      cardError.value = 'Payment form container not found'
      return
    }
    
    cardError.value = ''
  } catch (err) {
    cardError.value = 'Failed to initialize payment form'
  }
}

const closeDialog = () => {
  if (!processing.value) {
    visible.value = false
    resetForm()
  }
}

// Reset form
const resetForm = () => {
  paymentSuccess.value = false
  acceptedTerms.value = false
  showTermsError.value = false
  cardError.value = ''
  if (cardElement.value) {
    cardElement.value.destroy()
    cardElement.value = null
  }
}

const handlePayment = async () => {
  if (!acceptedTerms.value) {
    showTermsError.value = true
    return
  }

  if (!stripe.value || !cardElement.value) {
    cardError.value = 'Payment form not ready. Please try again.'
    return
  }
  
  showTermsError.value = false
  processing.value = true
  cardError.value = ''
  
  try {
    let paymentMethod: any = null
    
    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod: pm } = await stripe.value.createPaymentMethod({
        type: 'card',
        card: cardElement.value,
      })
      
      if (paymentMethodError) {
        cardError.value = paymentMethodError.message || 'Payment method creation failed'
        return
      }
      
      if (!pm) {
        cardError.value = 'Failed to create payment method'
        return
      }
      
      paymentMethod = pm
    } catch (error) {
      cardError.value = 'Failed to create payment method. Please check your card details.'
      return
    }
    
    // Create payment intent with the payment method
    const response = await $fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      body: {
        eventId: props.event.id,
        amount: eventValue.value,
        merchantId: props.merchantId,
        vendorId: props.vendorId,
        paymentMethodId: paymentMethod.id
      }
    }) as { success: boolean; paymentIntent: any; paymentId: string }

    if (!response.success) {
      throw new Error('Failed to create payment intent')
    }

    // Check if payment was successful
    if (response.paymentIntent.status === 'succeeded' || response.success) {
      // Payment successful
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
        detail: 'Your event has been booked! Payment will be automatically released to vendor when the event ends.',
        life: 5000
      })
    } else {
      throw new Error(`Payment was not successful. Status: ${response.paymentIntent.status}`)
    }

  } catch (error: any) {
    console.error('Payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.'
    emit('payment-error', new Error(errorMessage))
    
    cardError.value = errorMessage
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
</script>

<style scoped>
.payment-dialog {
  @apply bg-white dark:bg-gray-900;
}

#card-element {
  min-height: 60px;
}
</style> 