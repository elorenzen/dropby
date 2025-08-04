<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Financials & Payment Settings
          </h1>
          <p class="text-text-muted text-lg">
            Manage your payment preferences and subscription for {{ vendor?.vendor_name || 'your food truck' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Button 
            icon="pi pi-arrow-left" 
            @click="navigateToDashboard"
            outlined 
            label="Back to Dashboard"
          />
        </div>
      </div>
    </div>

    <!-- Subscription Status Check -->
    <div v-if="!hasActiveSubscription" class="mb-8">
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <i class="pi pi-star text-xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold">Upgrade Your Plan</h3>
            <p class="text-orange-100">Get unlimited requests and premium features</p>
          </div>
        </div>
        <p class="text-orange-100 mb-4">
          You're currently on the free plan. Upgrade to unlock unlimited event requests, featured placement, and priority support.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="hasActiveSubscription" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Payment Information Card -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-text-main flex items-center gap-3">
              <i class="pi pi-credit-card text-green-600"></i>
              Payment Information
            </h2>
            <Button
              label="Change Plan"
              icon="pi pi-credit-card"
              severity="secondary"
              outlined
              @click="openSubscriptionModal"
            />
          </div>
          
          <div class="space-y-6">
            <!-- Current Plan -->
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 class="font-medium text-green-800 dark:text-green-200 mb-2">Current Plan</h3>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ currentSubscription?.plan_type === 'pro' ? 'Pro' : currentSubscription?.plan_type === 'premium' ? 'Premium' : 'Free' }}
              </p>
              <p class="text-sm text-green-600 dark:text-green-400 mt-1">
                Status: {{ currentSubscription?.status || 'Active' }}
              </p>
            </div>

            <!-- Payment Details -->
            <div class="space-y-4">
              <h3 class="font-medium text-text-main">Payment Details</h3>
              
              <div class="grid grid-cols-1 gap-4">
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 class="font-medium text-text-main mb-2">How You Get Paid</h4>
                  <div class="text-sm text-text-muted space-y-1">
                    <p>• You receive 100% of the event value</p>
                    <p>• No fees deducted from your payment</p>
                    <p>• Payments processed after event completion</p>
                    <p>• Direct deposit to your bank account</p>
                  </div>
                </div>
                
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Fee Structure</h4>
                  <div class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p>• Platform Fee: 8% (paid by merchant)</p>
                    <p>• Processing Fee: 2.9% + $0.30 (paid by merchant)</p>
                    <p>• You receive: 100% of event value</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bank Account Information -->
            <div class="space-y-4">
              <h3 class="font-medium text-text-main">Bank Account</h3>
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p class="text-sm text-text-muted mb-2">Add your bank account to receive payments</p>
                <Button 
                  label="Add Bank Account" 
                  icon="pi pi-plus"
                  severity="secondary"
                  outlined
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics & Stats Card -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
            <i class="pi pi-chart-line text-blue-600"></i>
            Earnings Analytics
          </h3>
          
          <div class="space-y-6">
            <!-- Monthly Earnings -->
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">This Month</h4>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">${{ monthlyEarnings }}</p>
              <p class="text-sm text-green-600 dark:text-green-400 mt-1">
                From {{ monthlyEvents }} events
              </p>
            </div>
            
            <!-- Total Earnings -->
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Total Earnings</h4>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${{ totalEarnings }}</p>
              <p class="text-sm text-blue-600 dark:text-blue-400 mt-1">
                All time earnings
              </p>
            </div>
            
            <!-- Upcoming Payments -->
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Pending Payments</h4>
              <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${{ pendingPayments }}</p>
              <p class="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                From {{ pendingEvents }} events
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription Plans Section (shown when no active subscription) -->
    <div v-if="!hasActiveSubscription" class="mt-8">
      <SubscriptionPlans 
        :userTypeProp="'vendor'"
        :currentPlanId="currentSubscription?.plan_type || 'free'"
        :loading="subscriptionLoading"
        @plan-selected="handlePlanSelection" 
      />
    </div>

    <!-- Success/Error Messages -->
    <Toast group="main" position="bottom-center" />
    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    
    <Dialog
      :visible="showSubscriptionPlans"
      @update:visible="showSubscriptionPlans = $event"
      modal
      header="Change Subscription Plan"
      :style="{ width: '90vw', maxWidth: '800px' }"
      :closable="true"
      :dismissable-mask="true"
    >
      <SubscriptionPlans 
        :userTypeProp="'vendor'"
        :currentPlanId="currentSubscription?.plan_type || 'free'"
        :loading="subscriptionLoading"
        @plan-selected="handlePlanSelection" 
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const toast = useToast()
const vendorStore = useVendorStore()
const { currentUser } = useAuth()
const vendor = ref<any>(await vendorStore.getVendorById(route.params.id))

// Subscription status
const hasActiveSubscription = ref(false)
const currentSubscription = ref<any>(null)

// Analytics data
const monthlyEarnings = ref(0)
const totalEarnings = ref(0)
const pendingPayments = ref(0)
const monthlyEvents = ref(0)
const pendingEvents = ref(0)

// UI state
const errDialog = ref(false)
const errType = ref('')
const errMsg = ref('')
const showSubscriptionPlans = ref(false)
const subscriptionLoading = ref(false)

// Check subscription status
const checkSubscriptionStatus = async () => {
  if (!currentUser.value) return

  try {
    // Get the vendor ID from the route
    const vendorId = route.params.id as string
    
    // Check for business subscription (not user subscription)
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', vendorId)
      .eq('business_type', 'vendor')
      .eq('status', 'active')
      .single()

    currentSubscription.value = subscriptionData
    hasActiveSubscription.value = !!subscriptionData
  } catch (error) {
    console.error('Error checking subscription status:', error)
    hasActiveSubscription.value = false
  }
}

// Load earnings data
const loadEarningsData = async () => {
  if (!vendor.value?.id) return

  try {
    // Get events where vendor was assigned and completed
    const { data: completedEvents } = await supabase
      .from('events')
      .select('*')
      .eq('vendor', vendor.value.id)
      .eq('status', 'closed')

    // Calculate earnings (simplified - in real app you'd have a payments table)
    const totalEarningsValue = completedEvents?.reduce((sum: number, event: any) => {
      return sum + (event.event_value || 0)
    }, 0) || 0

    // Get current month earnings
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyEventsData = completedEvents?.filter((event: any) => {
      const eventDate = new Date(event.end)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    }) || []

    const monthlyEarningsValue = monthlyEventsData.reduce((sum: number, event: any) => {
      return sum + (event.event_value || 0)
    }, 0)

    // Get pending events
    const { data: pendingEventsData } = await supabase
      .from('events')
      .select('*')
      .eq('vendor', vendor.value.id)
      .eq('status', 'booked')

    const pendingPaymentsValue = pendingEventsData?.reduce((sum: number, event: any) => {
      return sum + (event.event_value || 0)
    }, 0) || 0

    // Update reactive data
    totalEarnings.value = totalEarningsValue
    monthlyEarnings.value = monthlyEarningsValue
    pendingPayments.value = pendingPaymentsValue
    monthlyEvents.value = monthlyEventsData.length
    pendingEvents.value = pendingEventsData?.length || 0

  } catch (error) {
    console.error('Error loading earnings data:', error)
  }
}

// Handle plan selection
const handlePlanSelection = async (plan: { id: string; name: string; price: number; description: string; features: string[]; buttonText: string; featured: boolean; stripePriceId: string }) => {
  subscriptionLoading.value = true
  
  try {
    await createSubscription(plan)
    showSubscriptionPlans.value = false
  } catch (error) {
    console.error('Error handling plan selection:', error)
  } finally {
    subscriptionLoading.value = false
  }
}

const createSubscription = async (plan: { id: string; name: string; price: number; description: string; features: string[]; buttonText: string; featured: boolean; stripePriceId: string }) => {
  try {
    const response = await $fetch('/api/subscriptions/create', {
      method: 'POST',
      body: {
        planType: plan.id,
        stripePriceId: plan.stripePriceId
      }
    })
    
    const responseData = response as { checkoutUrl?: string; message?: string }
    
    // If it's a free plan, show success message and refresh
    if (responseData.message) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: responseData.message,
        group: 'main',
        life: 3000
      })
      
      // Refresh subscription status
      await checkSubscriptionStatus()
      return
    }
    
    // For paid plans, redirect to Stripe checkout
    if (responseData.checkoutUrl) {
      window.location.href = responseData.checkoutUrl
    }
    
  } catch (error) {
    console.error('Subscription creation failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create subscription',
      group: 'main',
      life: 3000
    })
  }
}

const navigateToDashboard = () => {
  navigateTo(`/vendor/${route.params.id}/dashboard`)
}

const openSubscriptionModal = () => {
  console.log('Opening subscription modal, current value:', showSubscriptionPlans.value)
  showSubscriptionPlans.value = true
  console.log('After setting to true:', showSubscriptionPlans.value)
}

// Load data on mount
onMounted(() => {
  checkSubscriptionStatus()
  loadEarningsData()
})

// Set page title
useSeoMeta({ title: () => `Financials | ${vendor.value?.vendor_name || 'Vendor'}` })

definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>

</style> 