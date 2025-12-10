<template>
  <div>
    <Menubar :model="menuItemsStart">
      <template #start>
        <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: var(--primary-color);" />
        <NuxtLink
          :to="`/${currentUser?.type}/${currentUser?.type === 'vendor' ? currentUser?.associated_vendor_id : currentUser?.associated_merchant_id}/dashboard`"
          class="m-2 text-xl font-bold text-primary"
        >
          DropBy
        </NuxtLink>
      </template>

      <template #item="{ item, props, hasSubmenu }">
        <div v-if="!isAuthenticated">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                    <span :class="item.icon" />
                    <span>{{ item.label }}</span>
                </a>
            </router-link>
            <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                <span :class="item.icon" />
                <span>{{ item.label }}</span>
                <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
            </a>
        </div>
      </template>
      
      <template #end>
        <!-- Not Authenticated - Show Login/Signup -->
        <div v-if="!isAuthenticated" class="auth-section">
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
        </div>

        <!-- Authenticated - Show Menu Items and Profile Dropdown -->
        <div v-else class="authenticated-section">
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
              style="border-color: var(--secondary-color); color: var(--secondary-color); position: relative;" 
            />
            <Badge 
              v-if="unreadCount > 0" 
              :value="unreadCount > 99 ? '99+' : unreadCount"
              severity="danger"
              style="position: absolute; top: -8px; right: -8px; min-width: 20px; height: 20px; font-size: 11px;"
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
            style="border-color: var(--secondary-color); color: var(--secondary-color);" 
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
  </div>
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg' // options: '.../logo-two.svg', '.../logo-three.svg'
import NotificationPanel from '~/components/NotificationPanel.vue'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, currentUser, signOut } = useAuth()
const { isDark, toggleTheme } = useTheme()
const renderKey = ref(0)

const profileMenu = ref()
const notificationPanel = ref()
const notificationStore = useNotificationStore()
const notificationChannel = ref<any>(null)

const menuItemsStart = ref([
    {
        label: 'How It Works',
        command: () => {
            router.push('/about');
        }
    },
    {
        label: 'Explore',
        items: [
            {
                label: 'Events',
                command: () => { router.push('/events') }
            },
            {
                label: 'Food Trucks',
                command: () => { router.push('/food-trucks') }
            },
            {
                label: 'Establishments',
                command: () => { router.push('/establishments')}
            }
        ]
    }
]);

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

// Profile menu items - different for merchants and vendors
const profileMenuItems = computed(() => {
  if (!businessType.value || !userAssociatedId.value) {
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
/* Custom header styling - rounded bottom corners and shadow */
.p-menubar {
  background: var(--p-surface-card) !important;
  border-radius: 0 0 1.25rem 1.25rem;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  border: none;
}

/* Custom menu item spacing */
:deep(.p-menubar-root-list) {
  gap: 1rem;
}

/* PrimeVue handles menu item colors and hover states by default */
/* Only override highlight state if needed */
:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link.p-highlight) {
  font-weight: 500;
}

/* Authentication section styling */
.auth-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.auth-button {
  white-space: nowrap;
}

/* Authenticated section styling */
.authenticated-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon-button {
  min-width: 2.5rem;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0 !important;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .auth-section {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
  }

  .auth-buttons {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  .auth-button {
    width: 100%;
  }

  .authenticated-section {
    gap: 0.5rem;
  }

  .header-icon-button {
    min-width: 2.25rem;
    width: 2.25rem;
    height: 2.25rem;
  }

  /* Ensure PrimeVue Menubar mobile menu works well */
  :deep(.p-menubar-button) {
    margin-left: auto;
  }

  :deep(.p-menubar-mobile-active .p-menubar-root-list) {
    flex-direction: column;
    width: 100%;
  }

  :deep(.p-menubar-mobile-active .p-menubar-root-list > .p-menuitem) {
    width: 100%;
  }

  :deep(.p-menubar-mobile-active .p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
    width: 100%;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .auth-section {
    gap: 0.5rem;
  }

  .authenticated-section {
    gap: 0.375rem;
  }

  .header-icon-button {
    min-width: 2rem;
    width: 2rem;
    height: 2rem;
  }

  /* Hide text labels on very small screens, show only icons */
  :deep(.p-menubar .p-menubar-start) {
    flex: 1;
  }

  :deep(.p-menubar .p-menubar-start .text-xl) {
    font-size: 1rem;
  }
}
</style>

