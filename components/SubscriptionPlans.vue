<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-text-main mb-2">Choose Your Plan</h2>
      <p class="text-text-muted">Select the perfect plan for your business needs</p>
    </div>

    <!-- Plan Toggle - Only show if no specific user type is provided -->
    <div v-if="!userTypeProp" class="flex justify-center">
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          @click="userType = 'merchant'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            userType === 'merchant'
              ? 'bg-white dark:bg-gray-700 text-text-main shadow-sm'
              : 'text-text-muted hover:text-text-main'
          ]"
        >
          For Merchants
        </button>
        <button
          @click="userType = 'vendor'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            userType === 'vendor'
              ? 'bg-white dark:bg-gray-700 text-text-main shadow-sm'
              : 'text-text-muted hover:text-text-main'
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
        class="relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all hover:shadow-lg"
        :class="[
          plan.featured 
            ? 'border-primary-500 shadow-lg scale-105' 
            : 'border-gray-200 dark:border-gray-700'
        ]"
      >
        <!-- Featured Badge -->
        <div
          v-if="plan.featured"
          class="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <span class="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Most Popular
          </span>
        </div>
        
        <!-- Current Plan Badge -->
        <div
          v-if="isCurrentPlan(plan.id)"
          class="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </span>
        </div>

        <!-- Plan Header -->
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-text-main mb-2">{{ plan.name }}</h3>
          <div class="mb-4">
            <span class="text-3xl font-bold text-text-main">${{ plan.price }}</span>
            <span class="text-text-muted">/month</span>
          </div>
          <p class="text-sm text-text-muted">{{ plan.description }}</p>
        </div>

        <!-- Features List -->
        <ul class="space-y-3 mb-6">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-3"
          >
            <i class="pi pi-check text-green-500"></i>
            <span class="text-sm text-text-main">{{ feature }}</span>
          </li>
        </ul>

        <!-- Action Button -->
        <button
          @click="selectPlan(plan)"
          :disabled="isCurrentPlan(plan.id) || props.loading"
          :class="[
            'w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
            isCurrentPlan(plan.id)
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : props.loading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : plan.featured
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-main hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          <i v-if="props.loading" class="pi pi-spinner animate-spin"></i>
          {{ isCurrentPlan(plan.id) ? 'Current Plan' : props.loading ? 'Processing...' : plan.buttonText }}
        </button>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="mt-12">
      <h3 class="text-xl font-bold text-text-main mb-6 text-center">Frequently Asked Questions</h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="faq in faqs"
          :key="faq.question"
          class="bg-white dark:bg-gray-800 rounded-lg p-4"
        >
          <h4 class="font-semibold text-text-main mb-2">{{ faq.question }}</h4>
          <p class="text-sm text-text-muted">{{ faq.answer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  buttonText: string
  featured: boolean
  stripePriceId: string
}

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

const merchantPlans: Plan[] = [
  {
    id: 'merchant-free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '3 events per month',
      'Basic dashboard',
      'Email support',
      'Standard features'
    ],
    buttonText: 'Get Started',
    featured: false,
    stripePriceId: ''
  },
  {
    id: 'merchant-pro',
    name: 'Pro',
    price: 19,
    description: 'For growing businesses',
    features: [
      'Unlimited events',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access'
    ],
    buttonText: 'Start Pro Trial',
    featured: true,
    stripePriceId: 'price_1RpHqpE5B6laqC9SWeiNDf2U'
  },
  {
    id: 'merchant-enterprise',
    name: 'Enterprise',
    price: 49,
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'Advanced reporting'
    ],
    buttonText: 'Contact Sales',
    featured: false,
    stripePriceId: 'price_1RpHrHE5B6laqC9SCChY5dJB'
  }
]

const vendorPlans: Plan[] = [
  {
    id: 'vendor-free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '5 event requests per month',
      'Basic profile',
      'Email support',
      'Standard features'
    ],
    buttonText: 'Get Started',
    featured: false,
    stripePriceId: ''
  },
  {
    id: 'vendor-pro',
    name: 'Pro',
    price: 29,
    description: 'For active food trucks',
    features: [
      'Unlimited requests',
      'Featured placement',
      'Advanced analytics',
      'Priority support',
      'Custom branding'
    ],
    buttonText: 'Start Pro Trial',
    featured: true,
    stripePriceId: 'price_1RpHsOE5B6laqC9S2hYZtXdt' // Replace with actual Stripe price ID
  },
  {
    id: 'vendor-premium',
    name: 'Premium',
    price: 79,
    description: 'For premium vendors',
    features: [
      'Everything in Pro',
      'Priority booking',
      'Advanced analytics',
      'Dedicated support',
      'API access'
    ],
    buttonText: 'Start Premium Trial',
    featured: false,
    stripePriceId: 'price_1RpHsnE5B6laqC9S9FvB3k3E' // Replace with actual Stripe price ID
  }
]

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
  if (planType === 'enterprise') return `${prefix}enterprise`
  
  // If it's already a full plan ID, return as is
  if (planType.startsWith('merchant-') || planType.startsWith('vendor-')) {
    return planType
  }
  
  return null
})

// Check if a plan is the current plan
const isCurrentPlan = (planId: string) => {
  const isCurrent = getCurrentPlanId.value === planId
  console.log(`Checking plan ${planId}:`, {
    currentPlanId: props.currentPlanId,
    mappedPlanId: getCurrentPlanId.value,
    isCurrent
  })
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
  emit('plan-selected', plan)
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