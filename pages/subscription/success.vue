<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-6">
    <div class="max-w-md w-full">
      <Card class="text-center">
        <template #content>
          <div class="space-y-6">
            <!-- Success Icon -->
            <div class="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <i class="pi pi-check text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            
            <!-- Success Message -->
            <div>
              <h1 class="text-2xl font-bold text-text-main mb-2">Subscription Successful!</h1>
              <p class="text-text-muted">
                Thank you for subscribing to Dropby. Your subscription is now active and you can start using all the premium features.
              </p>
            </div>
            
            <!-- Subscription Details -->
            <div v-if="subscriptionDetails" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 class="font-semibold text-text-main mb-2">Subscription Details</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-text-muted">Plan:</span>
                  <span class="text-text-main">{{ subscriptionDetails.planName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-text-muted">Status:</span>
                  <span class="text-green-600 dark:text-green-400 font-medium">Active</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-text-muted">Next billing:</span>
                  <span class="text-text-main">{{ formatDate(subscriptionDetails.nextBilling) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="space-y-3">
              <Button 
                @click="navigateToDashboard"
                label="Go to Dashboard"
                severity="success"
                class="w-full"
              />
              <Button 
                @click="navigateToSubscriptions"
                label="Manage Subscription"
                severity="secondary"
                outlined
                class="w-full"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const user = useUserStore()

// Get session ID from URL params
const sessionId = route.query.session_id as string

// Mock subscription details (in a real app, you'd fetch this from your API)
const subscriptionDetails = ref({
  planName: 'Pro Plan',
  nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
})

// Format date helper
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Navigation methods
const navigateToDashboard = () => {
  // Navigate to user's dashboard based on their type
  if (user.user?.type === 'merchant') {
    navigateTo(`/merchant/${user.user.id}/dashboard`)
  } else if (user.user?.type === 'vendor') {
    navigateTo(`/vendor/${user.user.id}/dashboard`)
  } else {
    navigateTo('/')
  }
}

const navigateToSubscriptions = () => {
  navigateTo('/subscriptions')
}

// Set page title
useSeoMeta({ title: 'Subscription Success' })

// Optional: Verify the session with Stripe if needed
onMounted(async () => {
  if (sessionId) {
    try {
      // You could verify the session here if needed
      console.log('Session ID:', sessionId)
    } catch (error) {
      console.error('Error verifying session:', error)
    }
  }
})
</script> 