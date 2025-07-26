<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-main mb-2">Subscription Plans</h1>
        <p class="text-text-muted">Choose the perfect plan for your business needs</p>
      </div>

      <!-- Current Plan Status -->
      <div v-if="currentSubscription" class="mb-8">
        <Card class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <template #title>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <i class="pi pi-check-circle text-green-600 dark:text-green-400"></i>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-green-800 dark:text-green-200">
                  Current Plan: {{ getPlanName(currentSubscription.plan_type) }}
                </h3>
                <p class="text-sm text-green-600 dark:text-green-400">
                  Status: {{ currentSubscription.status }}
                </p>
              </div>
            </div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-green-800 dark:text-green-200">Plan Details</p>
                  <p class="text-sm text-green-600 dark:text-green-400">
                    {{ getPlanDescription(currentSubscription.plan_type) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-green-800 dark:text-green-200">
                    ${{ getPlanPrice(currentSubscription.plan_type) }}/month
                  </p>
                  <p class="text-sm text-green-600 dark:text-green-400">
                    Next billing: {{ formatDate(currentSubscription.current_period_end) }}
                  </p>
                </div>
              </div>
              
              <!-- Usage Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Events This Month</p>
                  <p class="text-2xl font-bold text-text-main">{{ currentUsage.events }}/{{ getUsageLimit(currentSubscription.plan_type, 'events') }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Requests This Month</p>
                  <p class="text-2xl font-bold text-text-main">{{ currentUsage.requests }}/{{ getUsageLimit(currentSubscription.plan_type, 'requests') }}</p>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-3">
                <Button 
                  v-if="currentSubscription.plan_type !== 'free'"
                  label="Manage Subscription" 
                  severity="secondary"
                  outlined
                  @click="manageSubscription"
                />
                <Button 
                  v-if="currentSubscription.plan_type !== 'free'"
                  label="Cancel Subscription" 
                  severity="danger"
                  outlined
                  @click="showCancelDialog = true"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Available Plans -->
      <SubscriptionPlans @plan-selected="handlePlanSelection" />

      <!-- Cancel Subscription Dialog -->
      <Dialog 
        :visible="showCancelDialog" 
        @update:visible="showCancelDialog = $event"
        modal 
        :style="{ width: '90vw', maxWidth: '400px' }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400"></i>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-text-main">Cancel Subscription</h3>
              <p class="text-sm text-text-muted">Are you sure you want to cancel?</p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-text-main">
            Your subscription will remain active until the end of your current billing period. 
            You'll lose access to premium features after that.
          </p>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-info-circle text-yellow-600 dark:text-yellow-400"></i>
              <span class="font-medium text-yellow-800 dark:text-yellow-200">Important</span>
            </div>
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              You can reactivate your subscription at any time. Your data will be preserved.
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <Button 
              label="Keep Subscription" 
              severity="secondary" 
              outlined
              @click="showCancelDialog = false" 
            />
            <Button 
              label="Cancel Subscription" 
              severity="danger"
              @click="cancelSubscription"
              :loading="canceling"
            />
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Reactive data
const currentSubscription = ref<any>(null)
const currentUsage = ref({ events: 0, requests: 0 })
const showCancelDialog = ref(false)
const canceling = ref(false)

// Plan configurations
const planConfigs = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    limits: { events: 3, requests: 5 }
  },
  pro: {
    name: 'Pro',
    price: user.value?.type === 'merchant' ? 19 : 29,
    description: 'For growing businesses',
    limits: { events: 999999, requests: 999999 }
  },
  premium: {
    name: 'Premium',
    price: user.value?.type === 'merchant' ? 49 : 79,
    description: 'For premium users',
    limits: { events: 999999, requests: 999999 }
  },
  enterprise: {
    name: 'Enterprise',
    price: 49,
    description: 'For large organizations',
    limits: { events: 999999, requests: 999999 }
  }
}

// Load current subscription and usage
const loadSubscriptionData = async () => {
  if (!user.value) return

  try {
    // Load current subscription
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('status', 'active')
      .single()

    currentSubscription.value = subscriptionData

    // Load current usage
    const { data: usageData } = await supabase
      .from('usage_tracking')
      .select('usage_type, usage_count')
      .eq('user_id', user.value.id)
      .gte('period_start', new Date().toISOString().slice(0, 7) + '-01')

    if (usageData) {
      const eventsUsage = usageData.find(u => u.usage_type === 'events')
      const requestsUsage = usageData.find(u => u.usage_type === 'requests')
      
      currentUsage.value = {
        events: eventsUsage?.usage_count || 0,
        requests: requestsUsage?.usage_count || 0
      }
    }
  } catch (error) {
    console.error('Error loading subscription data:', error)
  }
}

// Plan selection handler
const handlePlanSelection = async (plan: any) => {
  if (plan.price === 0) {
    // Handle free plan
    await setFreePlan()
  } else {
    // Handle paid plan
    await createSubscription(plan)
  }
}

const setFreePlan = async () => {
  try {
    // Update user to free plan
    await supabase
      .from('users')
      .update({ current_plan: 'free' })
      .eq('id', user.value?.id)

    toast.add({
      severity: 'success',
      summary: 'Plan Updated',
      detail: 'Your plan has been updated to Free',
      life: 3000
    })

    await loadSubscriptionData()
  } catch (error) {
    console.error('Error setting free plan:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update plan',
      life: 3000
    })
  }
}

const createSubscription = async (plan: any) => {
  try {
    const response = await $fetch('/api/subscriptions/create', {
      method: 'POST',
      body: {
        planType: plan.id,
        stripePriceId: plan.stripePriceId
      }
    })
    
    // Redirect to Stripe checkout
    window.location.href = response.checkoutUrl
    
  } catch (error) {
    console.error('Subscription creation failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create subscription',
      life: 3000
    })
  }
}

const manageSubscription = () => {
  // Redirect to Stripe customer portal
  window.open('https://billing.stripe.com/session/your-portal-url', '_blank')
}

const cancelSubscription = async () => {
  if (!currentSubscription.value) return

  canceling.value = true
  try {
    // Cancel subscription in Stripe
    await $fetch('/api/subscriptions/cancel', {
      method: 'POST',
      body: {
        subscriptionId: currentSubscription.value.stripe_subscription_id
      }
    })

    toast.add({
      severity: 'success',
      summary: 'Subscription Canceled',
      detail: 'Your subscription will be canceled at the end of the billing period',
      life: 5000
    })

    showCancelDialog.value = false
    await loadSubscriptionData()
  } catch (error) {
    console.error('Error canceling subscription:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to cancel subscription',
      life: 3000
    })
  } finally {
    canceling.value = false
  }
}

// Helper functions
const getPlanName = (planType: string) => {
  return planConfigs[planType as keyof typeof planConfigs]?.name || 'Unknown'
}

const getPlanPrice = (planType: string) => {
  return planConfigs[planType as keyof typeof planConfigs]?.price || 0
}

const getPlanDescription = (planType: string) => {
  return planConfigs[planType as keyof typeof planConfigs]?.description || ''
}

const getUsageLimit = (planType: string, usageType: 'events' | 'requests') => {
  const limits = planConfigs[planType as keyof typeof planConfigs]?.limits
  return limits?.[usageType] || 0
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Load data on mount
onMounted(() => {
  loadSubscriptionData()
})

useSeoMeta({ title: 'Subscription Plans - Dropby' })
</script>

<style scoped>
/* Custom styles for subscription page */
:deep(.p-card) {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}
</style> 