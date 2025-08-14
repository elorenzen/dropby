<template>
    <div class="min-h-screen bg-background p-6">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text-main mb-2">
              Payment History
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

      <!-- Main Content -->
      <div v-if="hasActiveSubscription" class="space-y-8">
        <!-- Payment History Section -->
        <PaymentHistory :merchantId="route.params.id" />
      </div>  

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

const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
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