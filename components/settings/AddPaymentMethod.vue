<template>
  <div class="space-y-6">    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Card Title/Description -->
      <div>
        <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">
          Card Title/Description
        </label>
        <InputText 
          v-model="formData.title" 
          class="w-full rounded-lg px-4 py-3 focus:ring-2" 
          style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
          placeholder="e.g., My Business Card, Personal Visa"
        />
      </div>

      <!-- Stripe Card Element -->
      <div>
        <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">
          Card Details
        </label>
        <div id="card-element" class="p-4 border rounded-lg min-h-[60px]" style="border-color: var(--surface-border); background: var(--surface-card);"></div>
        <div v-if="cardError" class="text-red-400 text-sm mt-2">{{ cardError }}</div>
      </div>

      <!-- Default Payment Method -->
      <div>
        <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">
          Make Default Payment Method
        </label>
        <InputSwitch v-model="formData.default" />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <Button 
          label="Cancel" 
          class="p-button-outlined"
          @click="$emit('cancel')"
        />
        <Button 
          label="Add Payment Method" 
          type="submit"
          :loading="loading"
          :disabled="!stripeLoaded"
          class="px-6 py-3 font-semibold rounded-lg" 
          style="background: var(--primary-color); border-color: var(--primary-color); color: var(--primary-color-text);"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'

interface Props {
  stripeCustomerId: string | null
}

interface Emits {
  cancel: []
  success: []
  failed: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form data
const formData = ref({
  title: '',
  default: false
})

const loading = ref(false)
const error = ref('')
const cardError = ref('')
const stripeLoaded = ref(false)

// Stripe Elements
const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<any>(null)

// Initialize Stripe
onMounted(async () => {
  const config = useRuntimeConfig()
  const stripeKey = config.public.stripePublishableKey
  
  if (stripeKey) {
    stripe.value = await loadStripe(stripeKey)
    if (stripe.value) {
      stripeLoaded.value = true
      await initializeCardElement()
    }
  } else {
    console.error('No Stripe key found!')
    error.value = 'Payment system not available'
  }
})

// Initialize card element
const initializeCardElement = async () => {
  if (!stripe.value) return
  
  try {
    // Destroy existing elements if they exist
    if (cardElement.value) {
      cardElement.value.destroy()
      cardElement.value = null
    }
    
    // Create elements instance
    elements.value = stripe.value.elements()
    
    // Wait for the container to be ready
    await nextTick()
    
    // Create card element
    cardElement.value = elements.value.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: 'var(--text-color)',
          backgroundColor: 'transparent',
          '::placeholder': {
            color: 'var(--text-color-secondary)',
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
      
      // Listen for card element changes
      cardElement.value.on('change', (event: any) => {
        cardError.value = event.error ? event.error.message : ''
      })
    } else {
      console.error('Card element container not found!')
      error.value = 'Payment form container not found'
    }
  } catch (err) {
    console.error('Error initializing card element:', err)
    error.value = 'Failed to initialize payment form'
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return
  
  if (!stripe.value || !cardElement.value) {
    error.value = 'Payment form not ready. Please try again.'
    return
  }
  
  loading.value = true
  error.value = ''
  cardError.value = ''
  
  try {
    // Check if customer ID is available
    if (!props.stripeCustomerId) {
      console.error('No Stripe customer ID provided')
      error.value = 'No customer ID found. Please refresh the page and try again.'
      return
    }
    
    console.log('Creating payment method with Stripe Elements')
    
    // Create payment method using Stripe Elements
    const { error: paymentMethodError, paymentMethod } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: cardElement.value,
    })
    
    if (paymentMethodError) {
      cardError.value = paymentMethodError.message || 'Payment method creation failed'
      return
    }
    
    console.log('Payment method created:', paymentMethod.id)
    
    // Attach payment method to customer
    const response = await $fetch('/api/payments/attach-payment-method', {
      method: 'POST',
      body: {
        customerId: props.stripeCustomerId,
        paymentMethodId: paymentMethod.id,
        title: formData.value.title,
        defaultPaymentMethod: formData.value.default
      }
    })
    
    if (response as any) {
      console.log('Payment method attached successfully:', response)
      emit('success')
    } else {
      console.error('Unexpected response format:', response)
      emit('failed')
    }
    
  } catch (error: any) {
    console.error('Error adding payment method:', error)
    
    // Show user-friendly error message
    let errorMessage = 'Failed to add payment method. Please try again.'
    
    if (error.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error.message) {
      errorMessage = error.message
    }
    
    error.value = errorMessage
    emit('failed')
  } finally {
    loading.value = false
  }
}

// Validate form
const validateForm = (): boolean => {
  if (!formData.value.title.trim()) {
    error.value = 'Please enter a card title/description'
    return false
  }
  
  return true
}
</script>

<style scoped>
#card-element {
  min-height: 60px;
}
</style>