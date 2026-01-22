<template>
  <div class="min-h-screen bg-background text-text-main font-sans layout-container">
    <AppHeader @create-event="openCreateEventDialog" />
    <main :class="{ 'has-bottom-nav': showMobileNav }">
      <slot />
    </main>
    <MobileBottomNav 
      v-if="showMobileNav" 
      @create-event="openCreateEventDialog"
      @find-events="navigateToFindEvents"
    />
    
    <!-- Event Creation Dialog (for merchants) -->
    <EventCreate 
      v-if="isMerchant && merchant"
      :visible="showCreateEventDialog"
      @update:visible="showCreateEventDialog = $event"
      :merchant="merchant"
      @event-created="onEventCreated"
    />
  </div>
</template>

<script setup lang="ts">
import EventCreate from '~/components/event/Create.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, currentUser } = useAuth()
const merchantStore = useMerchantStore()

const showCreateEventDialog = ref(false)

// Business type helpers
const isMerchant = computed(() => currentUser.value?.type === 'merchant')

const merchantId = computed(() => {
  if (!isMerchant.value || !currentUser.value) return null
  return currentUser.value.associated_merchant_id
})

// Get merchant data for the create dialog
const merchant = computed(() => {
  if (!merchantId.value) return null
  return merchantStore.getAllMerchants.find((m: any) => m.id === merchantId.value) || null
})

// Show mobile bottom nav for authenticated users on dashboard pages
const showMobileNav = computed(() => {
  if (!isAuthenticated.value) return false
  
  const path = route.path
  return path.includes('/merchant/') || 
         path.includes('/vendor/') || 
         path.includes('/settings/')
})

const openCreateEventDialog = async () => {
  if (isMerchant.value && merchantId.value) {
    // Ensure merchant data is loaded
    if (!merchant.value) {
      await merchantStore.loadMerchants()
    }
    showCreateEventDialog.value = true
  }
}

const navigateToFindEvents = () => {
  router.push('/viewer/events')
}

const onEventCreated = () => {
  showCreateEventDialog.value = false
}
</script>

<style scoped>
/* Add padding at bottom when mobile nav is visible */
.has-bottom-nav {
  padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0));
}

@media (min-width: 769px) {
  .has-bottom-nav {
    padding-bottom: 0;
  }
}
</style>