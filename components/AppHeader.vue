<template>
  <div>
    <!-- Authenticated users: Menubar with nav items -->
    <Menubar v-if="isAuthenticated" :model="authenticatedMenuItems" class="app-header-authenticated">
      <template #start>
        <NuxtLink
          :to="isSuperadmin ? '/admin' : `/${currentUser?.type}/${currentUser?.type === 'vendor' ? currentUser?.associated_vendor_id : currentUser?.associated_merchant_id}/dashboard`"
          class="m-2 text-xl font-bold text-primary"
        >
        <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: var(--primary-color);" />
        </NuxtLink>
      </template>

      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a 
            v-ripple 
            :href="href" 
            v-bind="props.action" 
            @click="navigate"
            :class="{ 'nav-item-active': item.isActive }"
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
      
      <template #end>
        <div class="header-actions">
          <!-- Create Event / Find Events CTA -->
          <Button
            v-if="businessType === 'merchant'"
            @click="$emit('create-event')"
            label="Create Event"
            icon="pi pi-plus"
            size="small"
            class="header-cta"
          />
          <Button
            v-else-if="businessType === 'vendor'"
            @click="navigateToFindEvents"
            label="Find Events"
            icon="pi pi-search"
            size="small"
            class="header-cta"
          />
          
          <!-- Notification Bell -->
          <div class="relative">
            <Button 
              outlined 
              severity="contrast" 
              type="button" 
              icon="pi pi-bell" 
              @click="toggleNotificationPanel" 
              aria-haspopup="true" 
              aria-controls="notification_panel"
              class="header-icon-button"
            />
            <Badge 
              v-if="unreadCount > 0" 
              :value="unreadCount > 99 ? '99+' : unreadCount"
              severity="danger"
              class="notification-badge"
            />
          </div>
          <NotificationPanel ref="notificationPanel" />
          
          <!-- Profile Dropdown -->
          <Button 
            outlined 
            severity="contrast" 
            type="button" 
            icon="pi pi-user" 
            @click="toggleProfileMenu" 
            aria-haspopup="true" 
            aria-controls="profile_menu" 
            class="header-icon-button"
          />
          <Menu
            ref="profileMenu"
            id="profile_menu"
            :model="profileMenuItems"
            :popup="true"
            :rerender="renderKey"
          />
        </div>
      </template>
    </Menubar>

    <!-- Non-authenticated users: Menubar with public navigation -->
    <Menubar v-else :model="menuItemsStart">
      <template #start>
        <NuxtLink
          to="/"
          class="m-2 text-xl font-bold text-primary"
        >
          <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: var(--primary-color);" />
        </NuxtLink>
      </template>

      <template #item="{ item, props, hasSubmenu, root }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                <span :class="item.icon" />
                <span>{{ item.label }}</span>
                <span v-if="hasSubmenu" :class="['ml-auto', root ? 'pi pi-angle-down' : 'pi pi-angle-right']" />
            </a>
        </router-link>
        <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" :class="['ml-auto', root ? 'pi pi-angle-down' : 'pi pi-angle-right']" />
        </a>
      </template>
      
      <template #end>
        <div class="auth-buttons">
          <Button
            outlined
            @click="navigateTo('/login')"
            class="auth-button"
            size="small"
          >Login</Button>

          <Button
            outlined
            @click="register"
            class="auth-button"
            size="small"
          >Sign Up</Button>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg' // options: '.../logo-two.svg', '.../logo-three.svg'
import NotificationPanel from '~/components/NotificationPanel.vue'

defineEmits(['create-event'])

const router = useRouter()
const route = useRoute()
const { isAuthenticated, currentUser, isSuperadmin, signOut } = useAuth()
const { isDark, toggleTheme } = useTheme()
const renderKey = ref(0)

const profileMenu = ref()
const notificationPanel = ref()
const notificationStore = useNotificationStore()
const notificationChannel = ref<any>(null)

// Authenticated menu items using PrimeVue MenuItem format with route
const authenticatedMenuItems = computed(() => {
  if (!businessType.value || !userAssociatedId.value) return []
  const base = `/${businessType.value}/${userAssociatedId.value}`
  const path = route.path
  
  return [
    { 
      label: 'Dashboard', 
      icon: 'pi pi-home', 
      route: `${base}/dashboard`,
      isActive: path.endsWith('/dashboard')
    },
    { 
      label: 'Events', 
      icon: 'pi pi-calendar', 
      route: `${base}/events`,
      isActive: path.includes('/events') || path.includes('/recurring-events')
    },
    { 
      label: 'Analytics', 
      icon: 'pi pi-chart-bar', 
      route: `${base}/analytics`,
      isActive: path.includes('/analytics')
    },
    { 
      label: 'Reviews', 
      icon: 'pi pi-star', 
      route: `${base}/ratings-and-reviews`,
      isActive: path.includes('/ratings-and-reviews')
    },
    { 
      label: 'Settings', 
      icon: 'pi pi-cog', 
      route: `/settings/${userAssociatedId.value}`,
      isActive: path.includes('/settings')
    }
  ]
})

const navigateToFindEvents = () => {
  router.push('/viewer/events')
}

const menuItemsStart = computed(() => {
  const path = route.path
  
  return [
    {
      label: 'About',
      icon: 'pi pi-heart',
      route: '/about',
      isActive: path === '/about' || path.startsWith('/viewer/about')
    },
    {
      label: 'How It Works',
      icon: 'pi pi-info-circle',
      route: '/how-it-works',
      isActive: path.includes('/how-it-works')
    },
    {
      label: 'Pricing',
      icon: 'pi pi-dollar',
      route: '/pricing',
      isActive: path.includes('/pricing')
    },
    { 
      label: 'Events', 
      icon: 'pi pi-calendar',
      route: '/events',
      isActive: path.includes('/events')
    },
    { 
      label: 'Food Trucks', 
      icon: 'pi pi-truck',
      route: '/food-trucks',
      isActive: path.includes('/food-trucks')
    },
    { 
      label: 'Establishments', 
      icon: 'pi pi-building',
      route: '/establishments',
      isActive: path.includes('/establishments')
    }
  ]
})

// Check if current route matches the given section
const isCurrentRoute = (section: string) => {
  const path = route.path
  return path.includes(`/${section}`)
}

// Computed props for business type and associated ID
const businessType = computed(() => currentUser.value?.type || null)
const associatedIdKey = computed(() => {
  if (!businessType.value) return null
  return `associated_${businessType.value}_id` as keyof typeof currentUser.value
})
const userAssociatedId = computed(() => {
  if (!associatedIdKey.value || !currentUser.value) return null
  return currentUser.value[associatedIdKey.value] as string | null
})

// Profile menu items - different for merchants, vendors, and superadmin
const profileMenuItems = computed(() => {
  // Superadmin (no type/associated id): only theme toggle and sign out
  if (!businessType.value || !userAssociatedId.value) {
    if (isSuperadmin.value) {
      return [
        {
          label: 'Admin',
          icon: 'pi pi-shield',
          command: () => router.push('/admin')
        },
        { separator: true },
        {
          label: `${isDark.value ? 'Light Mode' : 'Dark Mode'}`,
          icon: `${isDark.value ? 'pi pi-sun' : 'pi pi-moon'}`,
          command: () => {
            toggleTheme()
            renderKey.value++
          }
        },
        {
          label: 'Sign out',
          icon: 'pi pi-sign-out',
          command: async () => await handleSignOut()
        }
      ]
    }
    return []
  }

  const basePath = `/${businessType.value}/${userAssociatedId.value}`
  const items: any[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => router.push(`${basePath}/dashboard`)
    },
    {
      label: 'Events',
      icon: 'pi pi-calendar',
      command: () => router.push(`${basePath}/events`)
    },
    {
      label: 'Reviews',
      icon: 'pi pi-star',
      command: () => router.push(`${basePath}/ratings-and-reviews`)
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      command: () => router.push(`${basePath}/analytics`)
    }
  ]

  if (businessType.value === 'merchant') {
    items.push({
      label: 'Food Trucks',
      icon: 'pi pi-truck',
      command: () => router.push('/food-trucks')
    })
  } else if (businessType.value === 'vendor') {
    items.push({
      label: 'Establishments',
      icon: 'pi pi-building',
      command: () => router.push('/establishments')
    })
  }

  // Add separator and common items
  items.push(
    { separator: true },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => navigateToSettings()
    },
    {
      label: 'Feedback',
      icon: 'pi pi-comment',
      command: () => router.push('/feedback')
    },
    {
      label: `${isDark.value ? 'Light Mode' : 'Dark Mode'}`,
      icon: `${isDark.value ? 'pi pi-sun' : 'pi pi-moon'}`,
      command: () => {
        toggleTheme()
        renderKey.value++ // Force menu re-render
      }
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: async () => await handleSignOut()
    }
  )

  return items
})

const toggleProfileMenu = (event: any) => {
  profileMenu.value.toggle(event)
}

const navigateToSettings = () => {
  if (userAssociatedId.value) {
    router.push(`/settings/${userAssociatedId.value}`)
  }
}

const register = async () => { 
  await navigateTo('/get-started') 
}

const handleSignOut = async () => {
  try {
    const result = await signOut()
    if (result.error) {
      console.error('Sign out failed:', result.error)
    }
  } catch (err) {
    console.error('Sign out error:', err)
  }
}

// Notification handling
const unreadCount = computed(() => notificationStore.unreadCount)

const toggleNotificationPanel = (event: Event) => {
  notificationPanel.value?.show(event)
}

// Load notifications when user is authenticated
watch(isAuthenticated, async (newVal) => {
  if (newVal && currentUser.value?.id) {
    // Load notifications
    await notificationStore.loadNotifications()
    await notificationStore.loadUnreadCount()
    
    // Subscribe to real-time updates
    if (notificationChannel.value) {
      notificationStore.unsubscribeFromNotifications(notificationChannel.value)
    }
    notificationChannel.value = notificationStore.subscribeToNotifications()
  } else {
    // Unsubscribe when user logs out
    if (notificationChannel.value) {
      notificationStore.unsubscribeFromNotifications(notificationChannel.value)
      notificationChannel.value = null
    }
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  if (notificationChannel.value) {
    notificationStore.unsubscribeFromNotifications(notificationChannel.value)
  }
})
</script>

<style scoped>
/* Authenticated header - sticky with PrimeVue Menubar */
/* Use theme surface colors consistently - no overrides */
.app-header-authenticated {
  position: sticky !important;
  top: 0 !important;
  z-index: 1000 !important;
  border-radius: 0 !important;
  border: none !important;
  border-bottom: 1px solid var(--p-surface-border) !important;
  background-color: var(--p-surface-card) !important;
  color: var(--p-text-color) !important;
}

/* Active nav item styling */
:deep(.nav-item-active) {
  color: var(--p-primary-color) !important;
  font-weight: 600;
}

/* Menu items use theme text colors - PrimeVue handles light/dark automatically */
.app-header-authenticated :deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-link) {
  color: var(--p-text-color);
}

.app-header-authenticated :deep(.p-menubar-root-list > .p-menubar-item > .p-menubar-link:hover) {
  background-color: var(--p-surface-hover);
  color: var(--p-text-color);
}

/* Non-authenticated menubar styling */
.p-menubar:not(.app-header-authenticated) {
  background: var(--p-surface-card) !important;
  border-radius: 0 0 1.25rem 1.25rem;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  border: none;
}

/* Menu item spacing */
:deep(.p-menubar-root-list) {
  gap: 0.5rem;
}

/* Header actions container */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-cta {
  margin-right: 0.5rem;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-button {
  white-space: nowrap;
}

.header-icon-button {
  min-width: 2.5rem;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0 !important;
}

/* Header icon buttons use theme colors - PrimeVue handles light/dark automatically */

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  font-size: 11px;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .header-cta {
    display: none;
  }

  .header-actions {
    gap: 0.5rem;
  }

  .header-icon-button {
    min-width: 2.25rem;
    width: 2.25rem;
    height: 2.25rem;
  }
  
  /* Hide nav items on mobile - use bottom nav instead */
  :deep(.p-menubar-root-list) {
    display: none !important;
  }
  
  /* Hide hamburger menu on mobile for authenticated users */
  .app-header-authenticated :deep(.p-menubar-button) {
    display: none !important;
  }
}
</style>

