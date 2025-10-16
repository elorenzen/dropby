<template>
  <div class="one-time-payment-container">
    <!-- Payment Required Banner -->
    <div v-if="showPaymentRequired" class="payment-required-banner">
      <div class="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <i class="pi pi-exclamation-triangle text-yellow-600 text-xl"></i>
        <div class="flex-1">
          <h3 class="font-semibold text-yellow-800 dark:text-yellow-200">Free Plan Limit Reached</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            You've reached your free plan limit of {{ limit }} {{ actionType }}. 
            {{ actionType === 'events' ? 'Create' : 'Request' }} one more for ${{ oneTimeFee }} or upgrade to a paid plan.
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            :label="`Pay $${oneTimeFee}`"
            severity="warning"
            @click="showPaymentDialog = true"
          />
          <Button
            label="Upgrade Plan"
            outlined
            @click="showUpgradeDialog = true"
          />
        </div>
      </div>
    </div>

    <!-- Payment Dialog -->
    <Dialog
      :visible="showPaymentDialog"
      @update:visible="showPaymentDialog = $event"
      modal
      header="One-Time Payment"
      :style="{ width: '30rem' }"
    >
      <div class="space-y-4">
        <div class="text-center">
          <i class="pi pi-credit-card text-4xl text-blue-600 mb-4"></i>
          <h3 class="text-lg font-semibold mb-2">Complete One-Time Payment</h3>
          <p class="text-text-muted text-sm">
            Pay ${{ oneTimeFee }} to {{ actionType === 'events' ? 'create' : 'request' }} one additional {{ actionType.slice(0, -1) }}
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-text-muted">One-time fee:</span>
            <span class="font-semibold">${{ oneTimeFee }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-text-muted">Processing fee:</span>
            <span class="font-semibold">${{ processingFee.toFixed(2) }}</span>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <div class="flex justify-between items-center">
              <span class="font-semibold">Total:</span>
              <span class="text-lg font-bold text-accent">${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Stripe Elements -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-text-main">Payment Method</label>
          <div id="one-time-card-element" class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 min-h-[50px]"></div>
          <div v-if="cardError" class="text-red-500 text-sm">{{ cardError }}</div>
        </div>

        <!-- Terms -->
        <div class="flex items-start gap-2">
          <input type="checkbox" v-model="acceptedTerms" class="mt-1" />
          <p class="text-xs text-text-muted">
            I agree to the <a href="#" class="text-blue-500 hover:underline">Terms of Service</a> and 
            <a href="#" class="text-blue-500 hover:underline">Privacy Policy</a>
          </p>
        </div>

        <div class="flex gap-3 pt-4">
          <Button
            label="Cancel"
            outlined
            class="flex-1"
            @click="showPaymentDialog = false"
          />
          <Button
            :label="processing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`"
            :disabled="!acceptedTerms || processing"
            class="flex-1 bg-accent text-background border-accent hover:bg-accent-dark"
            @click="processPayment"
            :loading="processing"
          />
        </div>
      </div>
    </Dialog>

    <!-- Upgrade Dialog -->
    <Dialog
      :visible="showUpgradeDialog"
      @update:visible="showUpgradeDialog = $event"
      modal
      header="Upgrade Your Plan"
      :style="{ width: '40rem' }"
    >
      <SubscriptionPlans
        :business-type="businessType"
        :business-id="businessId"
        @plan-selected="handleSubscriptionCreated"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js'

interface Props {
  businessId: string
  businessType: 'merchant' | 'vendor'
  actionType: 'events' | 'requests'
  currentUsage: number
  limit: number
  oneTimeFee: number
  showPaymentDialog?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'payment-success'): void
  (e: 'subscription-upgraded'): void
  (e: 'payment-dialog-closed'): void
}>()

// State
const showPaymentRequired = computed(() => {
  return props.currentUsage >= props.limit
})

const showPaymentDialog = ref(props.showPaymentDialog || false)
const showUpgradeDialog = ref(false)
const processing = ref(false)
const acceptedTerms = ref(false)
const cardError = ref('')

// Stripe
const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<any>(null)

// Computed
const processingFee = computed(() => {
  return (props.oneTimeFee * 0.029) + 0.30 // Stripe processing fee
})

const totalAmount = computed(() => {
  return props.oneTimeFee + processingFee.value
})

// Initialize Stripe
onMounted(async () => {
  if (process.client) {
    const config = useRuntimeConfig()
    const stripeKey = config.public.stripePublishableKey
    if (stripeKey) {
      stripe.value = await loadStripe(stripeKey)
    }
  }
})

// Watch for dialog visibility
watch(showPaymentDialog, async (newValue) => {
  if (newValue && stripe.value) {
    await nextTick()
    await initializeCardElement()
  } else if (!newValue && cardElement.value) {
    cardElement.value.destroy()
    cardElement.value = null
  }
})

// Watch for prop changes
watch(() => props.showPaymentDialog, (newValue) => {
  if (newValue !== undefined) {
    showPaymentDialog.value = newValue
  }
})

// Watch for dialog close
watch(showPaymentDialog, (newValue) => {
  if (!newValue && props.showPaymentDialog) {
    emit('payment-dialog-closed')
  }
})

// Initialize card element
const initializeCardElement = async () => {
  if (!stripe.value) return

  try {
    if (cardElement.value) {
      cardElement.value.destroy()
    }

    elements.value = stripe.value.elements()
    cardElement.value = elements.value.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#374151',
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

    const cardElementContainer = document.getElementById('one-time-card-element')
    if (cardElementContainer) {
      cardElement.value.mount('#one-time-card-element')
    }
  } catch (error) {
    console.error('Error initializing card element:', error)
    cardError.value = 'Failed to initialize payment form'
  }
}

// Process payment
const processPayment = async () => {
  if (!acceptedTerms.value) {
    cardError.value = 'Please accept the terms and conditions'
    return
  }

  if (!stripe.value || !cardElement.value) {
    cardError.value = 'Payment form not ready'
    return
  }

  processing.value = true
  cardError.value = ''

  try {
    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: cardElement.value,
    })

    if (paymentMethodError) {
      cardError.value = paymentMethodError.message
      return
    }

    // Create payment intent
    const response = await $fetch('/api/payments/create-one-time-payment', {
      method: 'POST',
      body: {
        businessId: props.businessId,
        businessType: props.businessType,
        actionType: props.actionType,
        amount: props.oneTimeFee,
        paymentMethodId: paymentMethod.id
      }
    })

    if (response.success) {
      showPaymentDialog.value = false
      emit('payment-success')
      
      // Show success message
      const toast = useToast()
      toast.add({
        severity: 'success',
        summary: 'Payment Successful',
        detail: `You can now ${props.actionType === 'events' ? 'create' : 'request'} one more ${props.actionType.slice(0, -1)}`,
        life: 5000
      })
    } else {
      throw new Error(response.message || 'Payment failed')
    }
  } catch (error: any) {
    console.error('Payment error:', error)
    cardError.value = error.message || 'Payment failed. Please try again.'
  } finally {
    processing.value = false
  }
}

// Handle subscription upgrade
const handleSubscriptionCreated = (plan: any) => {
  showUpgradeDialog.value = false
  emit('subscription-upgraded', plan)
}
</script>

<style scoped>
.one-time-payment-container {
  @apply w-full;
}

.payment-required-banner {
  @apply mb-6;
}

#one-time-card-element {
  min-height: 50px;
}
</style>
