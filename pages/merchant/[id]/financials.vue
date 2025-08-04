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
              Manage event pricing, seating capacity, and payment preferences for {{ merchant?.merchant_name || 'your business' }}
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
              <p class="text-orange-100">Get unlimited events and premium features</p>
            </div>
          </div>
          <p class="text-orange-100 mb-4">
            You're currently on the free plan. Upgrade to unlock unlimited events, advanced analytics, and priority support.
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="hasActiveSubscription" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment Settings Card -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-semibold text-text-main flex items-center gap-3">
                <i class="pi pi-credit-card text-green-600"></i>
                Event Pricing Configuration
              </h2>
              <Button
                label="Change Plan"
                icon="pi pi-credit-card"
                severity="secondary"
                outlined
                @click="openSubscriptionModal"
              />
            </div>
            
            <form @submit.prevent="savePaymentSettings" class="space-y-6">
              <!-- Seating Capacity -->
              <div>
                <FloatLabel variant="on">
                  <InputNumber
                    v-model="paymentSettings.seatingCapacity"
                    inputId="seating-capacity"
                    :min="1"
                    :max="10000"
                    class="w-full"
                    :invalid="!!errors.seatingCapacity"
                  />
                  <label for="seating-capacity">Seating Capacity</label>
                </FloatLabel>
                <p class="text-xs text-text-muted mt-1">
                  Maximum number of people your establishment can accommodate for events
                </p>
                <small v-if="errors.seatingCapacity" class="text-red-500">{{ errors.seatingCapacity }}</small>
              </div>

              <!-- Custom Pricing Toggle -->
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 class="font-medium text-text-main">Custom Event Pricing</h3>
                  <p class="text-sm text-text-muted">Override automatic pricing based on seating capacity</p>
                </div>
                <InputSwitch v-model="paymentSettings.customPricing" />
              </div>

              <!-- Default Event Value -->
              <div v-if="!paymentSettings.customPricing">
                <FloatLabel variant="on">
                  <InputNumber
                    v-model="paymentSettings.defaultEventValue"
                    inputId="default-event-value"
                    :min="0"
                    :max="10000"
                    class="w-full bg-gray-100 dark:bg-gray-700"
                    readonly
                  />
                  <label for="default-event-value">Default Event Value (Auto-calculated)</label>
                </FloatLabel>
                <p class="text-xs text-text-muted mt-1">
                  Automatically calculated based on your seating capacity
                </p>
              </div>

              <!-- Custom Event Value -->
              <div v-if="paymentSettings.customPricing">
                <FloatLabel variant="on">
                  <InputNumber
                    v-model="paymentSettings.defaultEventValue"
                    inputId="custom-event-value"
                    :min="0"
                    :max="10000"
                    class="w-full"
                    :invalid="!!errors.defaultEventValue"
                  />
                  <label for="custom-event-value">Custom Default Event Value</label>
                </FloatLabel>
                <p class="text-xs text-text-muted mt-1">
                  This will be the default amount you pay vendors for events
                </p>
                <small v-if="errors.defaultEventValue" class="text-red-500">{{ errors.defaultEventValue }}</small>
              </div>

              <!-- Price Range -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FloatLabel variant="on">
                    <InputNumber
                      v-model="paymentSettings.minimumEventValue"
                      inputId="minimum-event-value"
                      :min="0"
                      :max="10000"
                      class="w-full"
                    />
                    <label for="minimum-event-value">Minimum Event Value (Optional)</label>
                  </FloatLabel>
                  <p class="text-xs text-text-muted mt-1">
                    Floor price for events (optional)
                  </p>
                </div>
                <div>
                  <FloatLabel variant="on">
                    <InputNumber
                      v-model="paymentSettings.maximumEventValue"
                      inputId="maximum-event-value"
                      :min="0"
                      :max="10000"
                      class="w-full"
                    />
                    <label for="maximum-event-value">Maximum Event Value (Optional)</label>
                  </FloatLabel>
                  <p class="text-xs text-text-muted mt-1">
                    Ceiling price for events (optional)
                  </p>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end pt-4">
                <Button
                  type="submit"
                  label="Save Payment Settings"
                  icon="pi pi-check"
                  :loading="saving"
                  class="bg-green-600 hover:bg-green-700"
                />
              </div>
            </form>
          </div>
        </div>

        <!-- Pricing Guide Card -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 class="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
              <i class="pi pi-info-circle text-blue-600"></i>
              Pricing Guide
            </h3>
            
            <div class="space-y-4">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Micro Events (0-25 people)</h4>
                <p class="text-sm text-blue-700 dark:text-blue-300">$75-150 default: $100</p>
              </div>
              
              <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">Small Events (25-50 people)</h4>
                <p class="text-sm text-green-700 dark:text-green-300">$100-200 default: $150</p>
              </div>
              
              <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Medium Events (50-100 people)</h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300">$200-400 default: $300</p>
              </div>
              
              <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 class="font-medium text-orange-800 dark:text-orange-200 mb-2">Large Events (100-300 people)</h4>
                <p class="text-sm text-orange-700 dark:text-orange-300">$400-800 default: $600</p>
              </div>
              
              <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 class="font-medium text-red-800 dark:text-red-200 mb-2">Premium Events (300-500 people)</h4>
                <p class="text-sm text-red-700 dark:text-red-300">$800-1,500 default: $1,200</p>
              </div>
              
              <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 class="font-medium text-purple-800 dark:text-purple-200 mb-2">Enterprise Events (500+ people)</h4>
                <p class="text-sm text-purple-700 dark:text-purple-300">$1,500+ default: $2,000</p>
              </div>
            </div>

            <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 class="font-medium text-text-main mb-2">Fee Structure</h4>
              <div class="text-sm text-text-muted space-y-1">
                <p>• Platform Fee: 8% of event value</p>
                <p>• Processing Fee: 2.9% + $0.30</p>
                <p>• Vendor receives: 100% of event value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Plans Section (shown when no active subscription) -->
      <div v-if="!hasActiveSubscription" class="mt-8">
        <SubscriptionPlans 
          :userTypeProp="'merchant'"
          :currentPlanId="currentSubscription?.plan_type || 'free'"
          :loading="subscriptionLoading"
          @plan-selected="handlePlanSelection" 
        />
      </div>

      <!-- Success/Error Messages -->
      <Toast group="main" position="bottom-center" />
      <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
      
      <!-- Subscription Plans Modal -->
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
          :userTypeProp="'merchant'"
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
const merchantStore = useMerchantStore()
const { currentUser } = useAuth()
const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))

// Subscription status
const hasActiveSubscription = ref(false)
const currentSubscription = ref<any>(null)

// Payment settings state
const paymentSettings = ref({
  seatingCapacity: merchant.value?.seating_capacity || 100,
  defaultEventValue: merchant.value?.default_event_value || 350,
  customPricing: merchant.value?.custom_event_pricing || false,
  minimumEventValue: merchant.value?.minimum_event_value || null,
  maximumEventValue: merchant.value?.maximum_event_value || null
})

// UI state
const saving = ref(false)
const errors = ref<Record<string, string>>({})
const errDialog = ref(false)
const errType = ref('')
const errMsg = ref('')
const showSubscriptionPlans = ref(false)
const subscriptionLoading = ref(false)

// Check subscription status
const checkSubscriptionStatus = async () => {
  if (!currentUser.value) return

  try {
    // Get the merchant ID from the route
    const merchantId = route.params.id as string
    
    // Check for business subscription (not user subscription)
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', merchantId)
      .eq('business_type', 'merchant')
      .eq('status', 'active')
      .single()

    currentSubscription.value = subscriptionData
    hasActiveSubscription.value = !!subscriptionData
  } catch (error) {
    console.error('Error checking subscription status:', error)
    hasActiveSubscription.value = false
  }
}

// Calculate default event value based on seating capacity
const calculateDefaultEventValue = (capacity: number): number => {
  if (!capacity || capacity <= 0) return 100
  if (capacity <= 25) return 100
  if (capacity <= 50) return 150
  if (capacity <= 100) return 300
  if (capacity <= 300) return 600
  if (capacity <= 500) return 1200
  return 2000
}

// Watch for seating capacity changes and update default event value
watch(() => paymentSettings.value.seatingCapacity, (newCapacity: number) => {
  if (!paymentSettings.value.customPricing) {
    paymentSettings.value.defaultEventValue = calculateDefaultEventValue(newCapacity)
  }
})

// Validate form
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!paymentSettings.value.seatingCapacity || paymentSettings.value.seatingCapacity < 1) {
    errors.value.seatingCapacity = 'Seating capacity must be at least 1'
  }
  
  if (paymentSettings.value.customPricing) {
    if (!paymentSettings.value.defaultEventValue || paymentSettings.value.defaultEventValue < 0) {
      errors.value.defaultEventValue = 'Default event value must be a positive number'
    }
  }
  
  if (paymentSettings.value.minimumEventValue && paymentSettings.value.maximumEventValue) {
    if (paymentSettings.value.minimumEventValue > paymentSettings.value.maximumEventValue) {
      errors.value.minimumEventValue = 'Minimum value cannot be greater than maximum value'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// Save payment settings
const savePaymentSettings = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    const updates = {
      seating_capacity: paymentSettings.value.seatingCapacity,
      default_event_value: paymentSettings.value.defaultEventValue,
      custom_event_pricing: paymentSettings.value.customPricing,
      minimum_event_value: paymentSettings.value.minimumEventValue,
      maximum_event_value: paymentSettings.value.maximumEventValue,
      updated_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('merchants')
      .update(updates as any)
      .eq('id', route.params.id as string)
    
    if (error) {
      throw error
    }
    
    // Update local merchant data
    Object.assign(merchant.value, updates)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Payment settings updated successfully!',
      group: 'main',
      life: 3000
    })
    
  } catch (error: any) {
    console.error('Error saving payment settings:', error)
    errType.value = 'Payment Settings Update'
    errMsg.value = error.message || 'Failed to save payment settings'
    errDialog.value = true
  } finally {
    saving.value = false
  }
}

// Handle plan selection
const handlePlanSelection = async (plan: { id: string; name: string; price: number; description: string; features: string[]; buttonText: string; featured: boolean; stripePriceId: string }) => {
  subscriptionLoading.value = true
  
  try {
    // Handle all plans through the API
    await createSubscription(plan)
    
    // Close the modal after plan selection
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
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

const openSubscriptionModal = () => {
  showSubscriptionPlans.value = true
}

// Load subscription status on mount
onMounted(() => {
  checkSubscriptionStatus()
})

// Set page title
useSeoMeta({ title: () => `Financials | ${merchant.value?.merchant_name || 'Merchant'}` })

definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>

</style>