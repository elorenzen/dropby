<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Global Toast Component -->
    <Toast group="main" position="bottom-center" />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate(title) {
    return title ? `${title} | DropBy` : "DropBy";
  },
});

// Initialize theme system
useTheme()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// === LOAD USER DATA ONLY ===
// Other data (merchants, vendors, events, etc.) is loaded lazily by pages that need it
const userStore = useUserStore()
if (user.value) {
  await userStore.loadUser(user.value.id)
} else {
  await userStore.setUser(null)
}

// Store references for real-time subscriptions
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const eventStore = useEventStore()
const menuStore = useMenuStore()
const reviewStore = useReviewStore()

// === REAL-TIME SUBSCRIPTIONS ===
// These update the stores when data changes, but only if data was already loaded

const subscribeToEvents = async () => {
  supabase
    .channel('events')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      async (payload: any) => {
        // Only refresh if events were already loaded
        if (eventStore.allEvents.length > 0) {
          await eventStore.loadEvents()
        }
      })
    .subscribe()
}

const subscribeToMerchants = async () => {
  supabase
    .channel('merchants')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'merchants' },
      async (payload: any) => {
        // Only refresh if merchants were already loaded
        if (merchantStore.allMerchants.length > 0) {
          await merchantStore.loadMerchants()
        }
      })
    .subscribe()
}

const subscribeToVendors = async () => {
  supabase
    .channel('vendors')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vendors' },
      async (payload: any) => {
        // Only refresh if vendors were already loaded
        if (vendorStore.allVendors.length > 0) {
          await vendorStore.loadVendors()
        }
      })
    .subscribe()
}

const subscribeToUsers = async () => {
  supabase
    .channel('users')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      async (payload: any) => {
        if (user.value) {
          await userStore.loadUser(user.value.id)
        }
      })
    .subscribe()
}

const subscribeToMenuItems = async () => {
  supabase
    .channel('menu_items')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items' },
      async (payload: any) => {
        // Only refresh if menu items were already loaded
        if (menuStore.menuItems.length > 0) {
          // Reload menu items for the vendor that changed (from payload)
          const vendorId = payload.new?.vendor_id || payload.old?.vendor_id
          if (vendorId) {
            await menuStore.loadMenuItems(vendorId)
          } else {
            // If no vendor_id in payload, reload all menu items for all vendors
            // Get unique vendor IDs from current menu items
            const vendorIds = [...new Set(menuStore.menuItems.map(item => item.vendor_id).filter(Boolean))]
            for (const vid of vendorIds) {
              await menuStore.loadMenuItems(vid)
            }
          }
        }
      })
    .subscribe()
}

const subscribeToReviews = async () => {
  supabase
    .channel('reviews')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' },
      async (payload: any) => {
        // Only refresh if reviews were already loaded for a user
        if (reviewStore.currentUserId) {
          await reviewStore.loadReviewsForUser(reviewStore.currentUserId)
        }
      })
    .subscribe()
}

// Check for incomplete/unpaid subscriptions after user is loaded
const checkUnpaidSubscription = async () => {
  if (!user.value) return
  
  const currentUser = userStore.getUser
  if (!currentUser || !currentUser.type) return
  
  const businessType = currentUser.type
  const businessIdKey = `associated_${businessType}_id`
  const businessId = currentUser[businessIdKey]
  
  if (!businessId) return
  
  try {
    const subscriptionStore = useSubscriptionStore()
    const subscription = await subscriptionStore.checkUnpaidSubscription(businessId, businessType)
    
    if (subscription) {
      // Redirect to settings page with subscription tab to complete payment
      const router = useRouter()
      await router.push(`/settings/${businessId}?activeTab=2&completePayment=true`)
    }
  } catch (error) {
    // No unpaid subscription found, or error - continue normally
  }
}

onMounted(async () => {
  // Set up real-time subscriptions
  await subscribeToEvents()
  await subscribeToUsers()
  await subscribeToVendors()
  await subscribeToMerchants()
  await subscribeToMenuItems()
  await subscribeToReviews()
  
  // Check for unpaid subscriptions
  await checkUnpaidSubscription()
})
</script>
