<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-color mb-2">Choose Your Plan</h2>
      <p class="text-md-gray">Select the perfect plan for your business needs</p>
    </div>

    <!-- Plan Toggle - Only show if no specific user type is provided -->
    <div v-if="!userTypeProp" class="flex justify-center">
      <div class="bg-surface-section rounded-lg p-1">
        <button
          @click="userType = 'merchant'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            userType === 'merchant'
              ? 'bg-surface-card text-color shadow-sm'
              : 'text-md-gray hover:text-color'
          ]"
        >
          For Merchants
        </button>
        <button
          @click="userType = 'vendor'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            userType === 'vendor'
              ? 'bg-surface-card text-color shadow-sm'
              : 'text-md-gray hover:text-color'
          ]"
        >
          For Vendors
        </button>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="grid md:grid-cols-3 gap-6">
      <div
        v-for="plan in currentPlans"
        :key="plan.id"
        class="relative bg-surface-card rounded-xl border-2 p-6 transition-all hover:shadow-lg"
        :class="[
          plan.featured 
            ? 'border-primary shadow-lg scale-105' 
            : 'border-surface-border'
        ]"
      >
        <!-- Featured Badge -->
        <div
          v-if="plan.featured"
          class="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <span class="bg-primary text-primary-color-text px-3 py-1 rounded-full text-xs font-medium">
            Most Popular
          </span>
        </div>
        
        <!-- Current Plan Badge -->
        <div
          v-if="isCurrentPlan(plan.id)"
          class="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <span class="bg-success text-primary-color-text px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </span>
        </div>

        <!-- Plan Header -->
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-color mb-2">{{ plan.name }}</h3>
          <div class="mb-4">
            <span class="text-3xl font-bold text-color">${{ plan.price }}</span>
            <span class="text-md-gray">/month</span>
          </div>
          <p class="text-sm text-md-gray">{{ plan.description }}</p>
        </div>

        <!-- Features List -->
        <ul class="space-y-3 mb-6">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-3"
          >
            <i class="pi pi-check text-success"></i>
            <span class="text-sm text-color">{{ feature }}</span>
          </li>
        </ul>

        <!-- Action Button -->
        <button
          @click="selectPlan(plan)"
          :disabled="isCurrentPlan(plan.id) || props.loading"
          :class="[
            'w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
            isCurrentPlan(plan.id)
              ? 'bg-surface-section text-md-gray cursor-not-allowed'
              : props.loading
                ? 'bg-surface-section text-md-gray cursor-not-allowed'
                : plan.featured
                  ? 'bg-primary text-primary-color-text hover:bg-primary-dark'
                  : 'bg-surface-section text-color hover:bg-surface-border'
          ]"
        >
          <i v-if="props.loading" class="pi pi-spinner animate-spin"></i>
          {{ isCurrentPlan(plan.id) ? 'Current Plan' : props.loading ? 'Processing...' : plan.buttonText }}
        </button>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="mt-12">
      <h3 class="text-xl font-bold text-color mb-6 text-center">Frequently Asked Questions</h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="faq in faqs"
          :key="faq.question"
          class="bg-surface-card rounded-lg p-4"
        >
          <h4 class="font-semibold text-color mb-2">{{ faq.question }}</h4>
          <p class="text-sm text-md-gray">{{ faq.answer }}</p>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <SubscriptionPaymentModal
      :visible="showPaymentModal"
      @update:visible="showPaymentModal = $event"
      :plan-name="selectedPlan?.name || ''"
      :plan-data="selectedPlan"
      :subscription-data="subscriptionData"
      @payment-complete="handlePaymentComplete"
      @retry-subscription="handleRetrySubscription"
    />
  </div>
</template>

<script setup lang="ts">
import { merchantPlans, vendorPlans, type Plan } from '~/constants/subscriptionPlans'

// Reactive data for payment modal
const showPaymentModal = ref(false)
const selectedPlan = ref<any>(null)
const subscriptionData = ref<any>(null)

// Props
const props = defineProps<{
  userTypeProp?: 'merchant' | 'vendor'
  currentPlanId?: string
  loading?: boolean
}>()

const userType = ref<'merchant' | 'vendor'>(props.userTypeProp || 'merchant')

// Watch for prop changes
watch(() => props.userTypeProp, (newValue: 'merchant' | 'vendor' | undefined) => {
  if (newValue) {
    userType.value = newValue
  }
})

const currentPlans = computed(() => {
  return userType.value === 'merchant' ? merchantPlans : vendorPlans
})

// Map plan type to plan ID
const getCurrentPlanId = computed(() => {
  if (!props.currentPlanId) return null
  
  const planType = props.currentPlanId
  const prefix = userType.value === 'merchant' ? 'merchant-' : 'vendor-'
  
  // Handle special cases
  if (planType === 'free') return `${prefix}free`
  if (planType === 'pro') return `${prefix}pro`
  if (planType === 'premium') return `${prefix}premium`
  
  // If it's already a full plan ID, return as is
  if (planType.startsWith('merchant-') || planType.startsWith('vendor-')) {
    return planType
  }
  
  return null
})

// Check if a plan is the current plan
const isCurrentPlan = (planId: string) => {
  const isCurrent = getCurrentPlanId.value === planId
  return isCurrent
}

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees. You only pay for the plan you choose, and you can start with our free tier.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and bank transfers for annual plans.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.'
  }
]

const emit = defineEmits<{
  'plan-selected': [plan: Plan]
}>()

const selectPlan = (plan: Plan) => {
  // Don't emit if this is the current plan
  if (isCurrentPlan(plan.id)) {
    return
  }
  
  // For paid plans, open payment modal with plan data
  if (plan.price > 0) {
    console.log('Selected plan:', plan)
    console.log('Plan stripePriceId:', plan.stripePriceId)
    selectedPlan.value = plan
    showPaymentModal.value = true
  } else {
    // For free plans, emit the plan selection
    emit('plan-selected', plan)
  }
}

const handlePaymentComplete = async (paymentData: any) => {
  try {
    // Emit the plan selection with payment data
    emit('plan-selected', { ...selectedPlan.value, paymentData })
    
    // Close payment modal
    showPaymentModal.value = false
    selectedPlan.value = null
    subscriptionData.value = null
  } catch (error) {
    console.error('Error handling payment completion:', error)
  }
}

const handleRetrySubscription = async () => {
  try {
    if (!selectedPlan.value) return
    // Re-emit the plan selection to retry
    emit('plan-selected', selectedPlan.value)
  } catch (error) {
    console.error('Error retrying subscription:', error)
  }
}
</script>

<style scoped>
/* Custom styles for subscription plans */
.plan-card {
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
}
</style> 