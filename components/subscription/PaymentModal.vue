<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
      <div class="modal-content" style="background: #1f2937; border: 1px solid #374151; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 20px 20px 0 20px;">
          <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #f9fafb;">Complete Payment for {{ planName }}</h3>
          <button @click="closeModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; transition: color 0.2s;" onmouseover="this.style.color='#f9fafb'" onmouseout="this.style.color='#9ca3af'">×</button>
        </div>
        
        <div class="payment-form" style="padding: 0 20px 20px 20px;">
          <!-- Error State -->
          <div v-if="subscriptionData?.error" class="space-y-4">
            <div class="text-center mb-4">
              <div class="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-exclamation-triangle text-2xl text-red-400"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-100 mb-2">Subscription Creation Failed</h3>
              <p class="text-gray-400">{{ subscriptionData.message }}</p>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4">
              <Button 
                label="Close" 
                severity="secondary" 
                outlined
                @click="closeModal"
                class="flex-1"
              />
              <Button 
                label="Try Again" 
                severity="primary"
                @click="retrySubscription"
                class="flex-1"
              />
            </div>
          </div>

          <!-- Payment Form -->
          <div v-else-if="!paymentComplete" class="space-y-4">
            <div class="text-center mb-6">
              <p class="text-gray-400 text-sm">Please enter your payment details to activate your subscription</p>
            </div>
            
            <!-- Stripe Elements Container -->
            <div id="card-element" class="p-4 border border-gray-600 rounded-lg bg-gray-800 min-h-[60px]"></div>
            
            <!-- Fallback input if Stripe fails -->
            <div v-if="error" class="p-4 border border-red-600 rounded-lg bg-red-900/20">
              <p class="text-red-400 text-sm mb-2">Stripe Elements failed to load. Please check console for details.</p>
              <input 
                type="text" 
                placeholder="Card number (test: 4242 4242 4242 4242)"
                class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                disabled
              />
            </div>
            
            <!-- Error Message -->
            <div v-if="error" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
              {{ error }}
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-3 pt-6">
              <Button 
                label="Cancel" 
                severity="secondary" 
                outlined
                @click="cancelPayment"
                :disabled="processing"
                class="flex-1"
              />
              <Button 
                label="Complete Payment" 
                severity="success"
                @click="handlePayment"
                :loading="processing"
                :disabled="processing"
                class="flex-1"
              />
            </div>
          </div>
          
          <!-- Success State -->
          <div v-else class="text-center space-y-4">
            <div class="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <i class="pi pi-check text-2xl text-green-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-100">Payment Successful!</h3>
            <p class="text-gray-400">Your subscription is now active.</p>
            <Button 
              label="Continue" 
              severity="success"
              @click="closeModal"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'

// Props
const props = defineProps<{
  visible: boolean
  planName: string
  planData?: any
  subscriptionData: any
}>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'payment-complete': [paymentData: any]
  'retry-subscription': []
}>()

// Reactive data
const processing = ref(false)
const paymentComplete = ref(false)
const error = ref('')
const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<any>(null)
const currentSubscriptionData = ref<any>(null)
const toast = useToast()

// Computed
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// Initialize Stripe
onMounted(async () => {
  console.log('PaymentModal mounted')
  if (process.client) {
    const config = useRuntimeConfig()
    const stripeKey = config.public.stripePublishableKey
    console.log('Stripe key available:', !!stripeKey)
    if (stripeKey) {
      stripe.value = await loadStripe(stripeKey)
      console.log('Stripe loaded:', !!stripe.value)
    } else {
      console.error('No Stripe key found!')
    }
  }
})

// Watch for modal visibility
watch(() => props.visible, async (newValue: boolean) => {
  if (newValue && props.planData) {
    // Wait for modal to be fully rendered
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Initialize payment form when modal opens
    await initializePaymentForm()
  }
})

// Create subscription
const createSubscription = async (paymentMethodId: string) => {
  if (!props.planData) {
    console.error('No plan data provided')
    return
  }
  
  try {
    console.log('Creating subscription for plan:', props.planData)
    console.log('Plan data keys:', Object.keys(props.planData))
    console.log('Plan ID:', props.planData.id)
    console.log('Stripe Price ID:', props.planData.stripePriceId)
    console.log('Payment method ID:', paymentMethodId)
    
    const response = await $fetch('/api/subscriptions/create', {
      method: 'POST',
      body: {
        planType: props.planData.id,
        stripePriceId: props.planData.stripePriceId,
        paymentMethodId: paymentMethodId
      }
    }) as any
    
    console.log('Subscription creation response:', response)
    
    if (response.success) {
      // Store subscription data
      currentSubscriptionData.value = response
      return response
    } else {
      error.value = 'Failed to create subscription'
      return null
    }
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    error.value = error.message || 'Failed to create subscription'
    return null
  }
}

// Initialize payment form
const initializePaymentForm = async () => {
  console.log('initializePaymentForm called')
  console.log('stripe.value:', !!stripe.value)
  
  if (!stripe.value) {
    console.error('Stripe not loaded!')
    error.value = 'Stripe not loaded'
    return
  }
  
  try {
    console.log('Creating elements instance')
    
    // Destroy existing elements if they exist
    if (cardElement.value) {
      cardElement.value.destroy()
      cardElement.value = null
    }
    
    // Create elements instance
    elements.value = stripe.value.elements()
    console.log('elements created:', !!elements.value)
    
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
    
    console.log('card element created:', !!cardElement.value)
    
    // Mount card element
    console.log('Mounting card element to #card-element')
    const cardElementContainer = document.getElementById('card-element')
    console.log('Card element container found:', !!cardElementContainer)
    
    if (cardElementContainer) {
      cardElement.value.mount('#card-element')
      console.log('Card element mounted successfully')
    } else {
      console.error('Card element container not found!')
      error.value = 'Payment form container not found'
      return
    }
    
    console.log('Payment form initialized successfully')
    error.value = ''
  } catch (err) {
    console.error('Error initializing payment form:', err)
    error.value = 'Failed to initialize payment form'
  }
}

// Handle payment submission
const handlePayment = async () => {
  if (!stripe.value || !cardElement.value) {
    error.value = 'Payment form not ready. Please try again.'
    return
  }
  
  processing.value = true
  error.value = ''
  
  try {
    console.log('Creating payment method')
    
    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: cardElement.value,
    })
    
    if (paymentMethodError) {
      error.value = paymentMethodError.message || 'Payment method creation failed'
      return
    }
    
    console.log('Payment method created:', paymentMethod.id)
    
    // Create subscription with the payment method
    const subscriptionResponse = await createSubscription(paymentMethod.id)
    
    if (subscriptionResponse) {
      paymentComplete.value = true
      emit('payment-complete', { paymentMethodId: paymentMethod.id })
      
      // Show success toast
      toast.add({
        severity: 'success',
        summary: 'Subscription Created',
        detail: `Your ${props.planName} subscription has been successfully activated!`,
        life: 5000
      })
    }
  } catch (err) {
    console.error('Payment error:', err)
    error.value = 'Payment failed. Please try again.'
  } finally {
    processing.value = false
  }
}

// Cancel payment
const cancelPayment = () => {
  visible.value = false
  resetForm()
}

// Retry subscription creation
const retrySubscription = () => {
  emit('retry-subscription')
  visible.value = false
  resetForm()
}

// Close modal
const closeModal = () => {
  visible.value = false
  resetForm()
}

// Reset form
const resetForm = () => {
  processing.value = false
  paymentComplete.value = false
  error.value = ''
  currentSubscriptionData.value = null
  if (cardElement.value) {
    cardElement.value.destroy()
    cardElement.value = null
  }
}
</script>

<style scoped>
.payment-form {
  min-height: 300px;
}

#card-element {
  min-height: 60px;
}
</style> 