<template>
  <div class="mobile-nav-wrapper" v-if="isAuthenticated && businessType && businessId">
    <!-- Floating Action Button - positioned above bottom nav -->
    <Button
      class="fab-button"
      :icon="businessType === 'merchant' ? 'pi pi-plus' : 'pi pi-search'"
      rounded
      @click="handleFabClick"
      :aria-label="businessType === 'merchant' ? 'Create Event' : 'Find Events'"
    />
    
    <!-- Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav">
      <NuxtLink
        v-for="tab in navItems"
        :key="tab.id"
        :to="tab.path"
        class="nav-item"
        :class="{ 'nav-item-active': isActiveTab(tab.id) }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { isAuthenticated, currentUser } = useAuth()

const emit = defineEmits(['create-event', 'find-events'])

const businessType = computed(() => currentUser.value?.type || null)
const businessId = computed(() => {
  if (!businessType.value || !currentUser.value) return null
  return businessType.value === 'vendor'
    ? currentUser.value.associated_vendor_id
    : currentUser.value.associated_merchant_id
})

const basePath = computed(() => {
  if (!businessType.value || !businessId.value) return ''
  return `/${businessType.value}/${businessId.value}`
})

const navItems = computed(() => {
  const base = basePath.value
  return [
    { id: 'dashboard', label: 'Home', icon: 'pi pi-home', path: `${base}/dashboard` },
    { id: 'events', label: 'Events', icon: 'pi pi-calendar', path: `${base}/events` },
    { id: 'analytics', label: 'Analytics', icon: 'pi pi-chart-bar', path: `${base}/analytics` },
    { id: 'settings', label: 'Settings', icon: 'pi pi-cog', path: `/settings/${businessId.value}` }
  ]
})

const isActiveTab = (tabId: string): boolean => {
  const path = route.path
  
  if (tabId === 'dashboard') return path.endsWith('/dashboard')
  if (tabId === 'events') return path.includes('/events') || path.includes('/recurring-events')
  if (tabId === 'analytics') return path.includes('/analytics')
  if (tabId === 'settings') return path.includes('/settings')
  
  return false
}

const handleFabClick = () => {
  if (businessType.value === 'merchant') {
    emit('create-event')
  } else {
    emit('find-events')
  }
}
</script>

<style scoped>
.mobile-nav-wrapper {
  display: none;
}

/* Only show on mobile */
@media (max-width: 768px) {
  .mobile-nav-wrapper {
    display: block;
  }
}

/* FAB Button - Right side, solid primary color from theme */
.fab-button {
  position: fixed !important;
  bottom: calc(6rem + env(safe-area-inset-bottom, 0)) !important;
  right: 1.25rem !important;
  width: 4rem !important;
  height: 4rem !important;
  min-width: 4rem !important;
  z-index: 1100 !important;
  background-color: var(--p-primary-500) !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5) !important;
}

.fab-button:hover,
.fab-button:focus {
  background-color: var(--p-primary-600) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6) !important;
}

.fab-button:active {
  transform: scale(0.95) !important;
}

:deep(.fab-button .p-button-icon) {
  font-size: 1.5rem !important;
  font-weight: bold;
  color: var(--p-primary-contrast-color) !important;
}

/* Bottom Navigation - solid opaque background */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: var(--p-surface-900);
  border-top: 2px solid var(--p-surface-200);
  padding: 0.75rem 0;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: var(--p-surface-500);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 600;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.nav-item i {
  font-size: 1.35rem;
}

.nav-item:hover {
  color: var(--p-surface-300);
}

.nav-item-active {
  color: var(--primary-color) !important;
}

.nav-item-active i {
  transform: scale(1.15);
}

.nav-item-active span {
  font-weight: 700;
}
</style>
