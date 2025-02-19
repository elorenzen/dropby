<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
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

if (user.value) {
  const { data } = await supabase
      .from('users')
      .select()
      .eq('id', user.value.id)
  const foundUser = data ? data[0] : null
  await userStore.setUser(foundUser)
}
// console.log('user: ', user.user)
        // Get necessary script for Map initializtion (google maps API key required!!)
        // if (process.server) {
        //     const runtimeConfig = useRuntimeConfig();
        //     useHead({ script: [{ src: `https://maps.googleapis.com/maps/api/js?key=${runtimeConfig.public.gMapKey}&v=weekly`, defer: true }] });
        // }
</script>