<template>
  <div class="stripe-connect-setup">
    <Card>
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
            <i class="pi pi-credit-card text-success"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-text-main">Automatic Payouts</h3>
            <p class="text-sm text-text-muted">Set up Stripe Connect for automatic payments</p>
          </div>
        </div>
      </template>
      
      <template #content>
        <div class="space-y-6">
          <!-- Current Status -->
          <div class="bg-surface-section rounded-lg p-4">
            <h4 class="font-medium text-text-main mb-3">Current Status</h4>
            <div class="flex items-center gap-3">
              <div v-if="stripeAccountStatus === 'complete'" class="flex items-center gap-2">
                <i class="pi pi-check-circle text-success"></i>
                <span class="text-success font-medium">Automatic payouts enabled</span>
              </div>
              <div v-else-if="stripeAccountStatus === 'pending'" class="flex items-center gap-2">
                <i class="pi pi-clock text-accent"></i>
                <span class="text-accent font-medium">Account setup in progress</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <i class="pi pi-exclamation-triangle text-accent"></i>
                <span class="text-accent font-medium">Manual payouts only</span>
              </div>
            </div>
          </div>

          <!-- Benefits -->
          <div class="bg-primary-light rounded-lg p-4">
            <h4 class="font-medium text-text-main mb-3">Benefits of Automatic Payouts</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <i class="pi pi-check text-primary"></i>
                <span>Get paid automatically when events complete</span>
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-check text-primary"></i>
                <span>No need to wait for manual checks</span>
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-check text-primary"></i>
                <span>Direct deposit to your bank account</span>
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-check text-primary"></i>
                <span>Track all payments in your Stripe dashboard</span>
              </li>
            </ul>
          </div>

          <!-- Setup Button -->
          <div v-if="!stripeAccountStatus || stripeAccountStatus === 'pending'" class="text-center">
            <Button 
              :label="stripeAccountStatus === 'pending' ? 'Complete Setup' : 'Set Up Automatic Payouts'"
              severity="success"
              size="large"
              @click="setupStripeConnect"
              :loading="loading"
            />
            <p class="text-sm text-text-muted mt-2">
              This will redirect you to Stripe to complete your account setup
            </p>
          </div>

          <!-- Account Info -->
          <div v-if="stripeAccountStatus === 'complete'" class="bg-success-light rounded-lg p-4">
            <h4 class="font-medium text-text-main mb-3">Account Information</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-text-muted">Account ID:</span>
                <span class="font-mono text-xs">{{ stripeAccountId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-muted">Status:</span>
                <span class="text-success">Active</span>
              </div>
            </div>
          </div>

          <!-- Manual Payout Info -->
          <div v-if="!stripeAccountStatus" class="bg-accent-light rounded-lg p-4">
            <h4 class="font-medium text-text-main mb-3">Manual Payouts</h4>
            <p class="text-sm text-text-muted">
              Currently, you'll receive payments via check or bank transfer after events complete. 
              Set up automatic payouts to get paid faster and more reliably.
            </p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  vendorId: string
  vendorEmail: string
  vendorName: string
}

const props = defineProps<Props>()

const supabase = useSupabaseClient()
const toast = useToast()

// State
const loading = ref(false)
const stripeAccountId = ref('')
const stripeAccountStatus = ref<'complete' | 'pending' | null>(null)

const vendorStore = useVendorStore()

// Load current Stripe Connect status
const loadStripeStatus = async () => {
  try {
    // Ensure vendors are loaded
    if (vendorStore.allVendors.length === 0) {
      await vendorStore.loadVendors()
    }
    
    const stripeAccountIdFromStore = vendorStore.getVendorProp(props.vendorId, 'stripe_connect_account_id')
    
    if (stripeAccountIdFromStore) {
      stripeAccountId.value = stripeAccountIdFromStore
      
      // Check account status with Stripe (only if we have an account ID)
      if (stripeAccountId.value) {
        const response = await $fetch('/api/vendors/check-stripe-status', {
          method: 'POST',
          body: { accountId: stripeAccountId.value }
        }) as any

        stripeAccountStatus.value = response.accountStatus
      }
    }
  } catch (error) {
    console.error('Error loading Stripe status:', error)
  }
}

// Setup Stripe Connect
const setupStripeConnect = async () => {
  loading.value = true

  try {
    const response = await $fetch('/api/vendors/create-stripe-connect', {
      method: 'POST',
      body: {
        vendorId: props.vendorId,
        email: props.vendorEmail,
        businessName: props.vendorName,
        businessType: 'individual' // or 'company' based on vendor type
      }
    }) as any

    if (response.success) {
      // Redirect to Stripe onboarding
      window.location.href = response.accountLink
    } else {
      throw new Error(response.message || 'Failed to create Stripe Connect account')
    }

  } catch (error: any) {
    console.error('Stripe Connect setup error:', error)
    toast.add({
      severity: 'error',
      summary: 'Setup Failed',
      detail: error.message || 'Failed to set up automatic payouts',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Load status on mount
onMounted(() => {
  loadStripeStatus()
})
</script>

<style scoped>
.stripe-connect-setup {
  @apply w-full;
}
</style> 