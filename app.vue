<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
	titleTemplate(title) {
		return title ? `${title} | DropBy` : "DropBy";
	},
});
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// === DISPATCH STORE ACTIONS ===
const userStore = useUserStore()
const { data: userData } = await supabase.from('users').select()
await userStore.setAllUsers(userData)

const merchantStore = useMerchantStore()
const { data: merchantData } = await supabase.from('merchants').select()
await merchantStore.setAllMerchants(merchantData)

const vendorStore = useVendorStore()
const { data: vendorData } = await supabase.from('vendors').select()
await vendorStore.setAllVendors(vendorData)

const eventStore = useEventStore()
const { data: eventData } = await supabase.from('events').select()
await eventStore.setAllEvents(eventData)

const menuStore = useMenuStore()
const { data: menuData } = await supabase.from('menu_items').select()
await menuStore.setAllMenuItems(menuData)

const subscribeToEvents = async () => {
  supabase
    .channel('events')
    .on(
      'postgres_changes',
      {
        event: '*', schema: 'public', table: 'events'
      },
      async (payload:any) => {
        const { data: eventData } = await supabase.from('events').select()
        await eventStore.setAllEvents(eventData)
      })
    .subscribe()
}

const subscribeToMerchants = async () => {
  supabase
    .channel('merchants')
    .on(
      'postgres_changes',
      {
        event: '*', schema: 'public', table: 'merchants'
      },
      async (payload:any) => {
        const { data: merchantData } = await supabase.from('merchants').select()
        await merchantStore.setAllMerchants(merchantData)
      })
    .subscribe()
}

const subscribeToVendors = async () => {
  supabase
    .channel('vendors')
    .on(
      'postgres_changes',
      {
        event: '*', schema: 'public', table: 'vendors'
      },
      async (payload:any) => {
        const { data: vendorData } = await supabase.from('vendors').select()
        await vendorStore.setAllVendors(vendorData)
      })
    .subscribe()
}

const subscribeToUsers = async () => {
  supabase
    .channel('users')
    .on(
      'postgres_changes',
      {
        event: '*', schema: 'public', table: 'users'
      },
      async (payload:any) => {
        const { data: userData } = await supabase.from('users').select()
        await userStore.setAllUsers(userData)
      })
    .subscribe()
}

const subscribeToMenuItems = async () => {
  supabase
    .channel('menu_items')
    .on(
      'postgres_changes',
      {
        event: '*', schema: 'public', table: 'menu_items'
      },
      async (payload:any) => {
        const { data: menuData } = await supabase.from('menu_items').select()
        await menuStore.setAllMenuItems(menuData)
      })
    .subscribe()
}

if (user.value) {
  const { data } = await supabase
      .from('users')
      .select()
      .eq('id', user.value.id)
  const foundUser = data ? data[0] : null
  await userStore.setUser(foundUser)
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
    // Check for unpaid/incomplete subscriptions
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .eq('business_type', businessType)
      .in('status', ['unpaid', 'incomplete'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (subscription) {
      // Redirect to settings page with subscription tab to complete payment
      const router = useRouter()
      await router.push(`/settings/${businessId}?activeTab=2&completePayment=true`)
    }
  } catch (error) {
    // No unpaid subscription found, or error - continue normally
    console.log('No unpaid subscription found or error:', error)
  }
}

onMounted(async () => {
  await subscribeToEvents()
  await subscribeToUsers()
  await subscribeToVendors()
  await subscribeToMerchants()
  await subscribeToMenuItems()
  
  // Check for unpaid subscriptions after everything is loaded
  await checkUnpaidSubscription()
})
// console.log('user: ', user.user)
        // Get necessary script for Map initializtion (google maps API key required!!)
        // if (process.server) {
        //     const runtimeConfig = useRuntimeConfig();
        //     useHead({ script: [{ src: `https://maps.googleapis.com/maps/api/js?key=${runtimeConfig.public.gMapKey}&v=weekly`, defer: true }] });
        // }
</script>