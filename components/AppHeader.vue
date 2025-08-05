<template>
  <div>
    <Menubar>
      <template #start>
        <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: #FF8906;" />
        <NuxtLink to="/" class="m-2 text-xl font-bold" style="color: #FF8906;">DropBy</NuxtLink>
      </template>
      
      <template #end>
        <!-- Not Authenticated - Show Login/Signup -->
        <div v-if="!isAuthenticated" class="flex items-center gap-2">

          <!-- Public Navigation Links -->
          <div class="hidden sm:flex items-center gap-4 ml-4">
            <NuxtLink 
              to="/viewer/about" 
              class="text-text-muted hover:text-accent transition-colors"
            >
              How It Works
            </NuxtLink>
            <NuxtLink 
              to="/viewer/events" 
              class="text-text-muted hover:text-accent transition-colors"
            >
              Events
            </NuxtLink>
            <NuxtLink 
              to="/viewer/map" 
              class="text-text-muted hover:text-accent transition-colors"
            >
              Map View
            </NuxtLink>
          </div>
          <InputText placeholder="Email" v-model="email" type="text" class="w-32 sm:w-auto" />
          <Password placeholder="Password" v-model="password" class="w-32 sm:w-auto" />
          <Button
            outlined
            @click="fireAuth"
            :disabled="email == '' || password == ''"
            :loading="loading"
          >Login</Button>

          <Button
            outlined
            @click="register"
          >Sign Up</Button>
        </div>

        <!-- Authenticated - Show Menu Items and Profile Dropdown -->
        <div v-else class="flex items-center gap-4">
          <!-- Menu Items -->
          <div class="flex items-center gap-4">
            <NuxtLink 
              :to="`/${currentUser?.type}/${currentUser?.type === 'vendor' ? currentUser?.associated_vendor_id : currentUser?.associated_merchant_id}/dashboard`"
              class="text-text-muted hover:text-accent transition-colors flex items-center gap-2"
              :class="{ 'text-accent font-medium': isCurrentRoute('dashboard') }"
            >
              <i class="pi pi-home"></i>
              Dashboard
            </NuxtLink>
            <NuxtLink 
              :to="`/${currentUser?.type}/${currentUser?.type === 'vendor' ? currentUser?.associated_vendor_id : currentUser?.associated_merchant_id}/events`"
              class="text-text-muted hover:text-accent transition-colors flex items-center gap-2"
              :class="{ 'text-accent font-medium': isCurrentRoute('events') }"
            >
              <i class="pi pi-calendar"></i>
              Events
            </NuxtLink>
            <NuxtLink 
              :to="`/${currentUser?.type}/${currentUser?.type === 'vendor' ? currentUser?.associated_vendor_id : currentUser?.associated_merchant_id}/ratings-and-reviews`"
              class="text-text-muted hover:text-accent transition-colors flex items-center gap-2"
              :class="{ 'text-accent font-medium': isCurrentRoute('ratings-and-reviews') }"
            >
              <i class="pi pi-star"></i>
              Reviews
            </NuxtLink>
            <NuxtLink 
              :to="`/${currentUser?.type}/${currentUser?.type === 'vendor' ? currentUser?.associated_vendor_id : currentUser?.associated_merchant_id}/financials`"
              class="text-text-muted hover:text-accent transition-colors flex items-center gap-2"
              :class="{ 'text-accent font-medium': isCurrentRoute('financials') }"
            >
              <i class="pi pi-dollar"></i>
              Financials
            </NuxtLink>
          </div>

          <!-- Profile Dropdown -->
          <Button 
            outlined 
            severity="contrast" 
            type="button" 
            icon="pi pi-user" 
            @click="toggleProfileMenu" 
            aria-haspopup="true" 
            aria-controls="profile_menu" 
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
    <ErrorDialog v-if="errDialog" :errType="'Sign In'" :errMsg="errMsg" @errorClose="errDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import Logo from '~/assets/logo-one.svg' // options: '.../logo-two.svg', '.../logo-three.svg'
import BaseIcon from '~/components/BaseIcon.vue'

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()
const { isAuthenticated, currentUser, signOut, userType } = useAuth()

const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref()
const renderKey = ref(0)

const email = ref('')
const password = ref('')
const profileMenu = ref()

// Check if current route matches the given section
const isCurrentRoute = (section: string) => {
  const path = route.path
  return path.includes(`/${section}`)
}



// Profile menu items
const profileMenuItems = computed(() => [
  {
    items: [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => {
          if (currentUser.value?.type) {
            const associatedIdKey = `associated_${currentUser.value.type}_id` as keyof typeof currentUser.value
            const userAssociatedId = currentUser.value[associatedIdKey]
            if (userAssociatedId) {
              router.push(`/${currentUser.value.type}/${userAssociatedId}/dashboard`)
            }
          }
        }
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => {
          navigateToSettings()
        }
      },
      {
        label: 'Sign out',
        icon: 'pi pi-sign-out',
        command: async () => {
          await handleSignOut()
        }
      },
    ]
  }
])

const toggleProfileMenu = (event: any) => {
  profileMenu.value.toggle(event)
}

const navigateToSettings = () => {
  if (currentUser.value?.type) {
    const associatedIdKey = `associated_${currentUser.value.type}_id` as keyof typeof currentUser.value
    const userAssociatedId = currentUser.value[associatedIdKey]
    if (userAssociatedId) {
      router.push(`/settings/${userAssociatedId}`)
    }
  }
}

const fireAuth = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      await errored(error.message)
    } else if (data?.user) {
      await confirmed(data.user.id)
    }
  } catch (err) {
    await errored('An unexpected error occurred')
  } finally {
    loading.value = false
    renderKey.value++
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
    email.value = ''
    password.value = ''
  } catch (err) {
    console.error('Sign out error:', err)
  }
}

const confirmed = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return
    }

    if (data) {
      const userStore = useUserStore()
      await userStore.setUser(data)
      
      // Redirect to user dashboard
      const { redirectToUserDashboard } = useAuth()
      await redirectToUserDashboard()
    }
  } catch (err) {
    console.error('Error in confirmed:', err)
  }
}

const errored = async (message: string) => {
  errMsg.value = message
  errDialog.value = true
}
</script>

<style scoped>
/* Make the header background match the card color */
.p-menubar {
  background: var(--surface-card) !important;
  border-radius: 0 0 1.25rem 1.25rem;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  border: none;
}

/* Active link styling */
.text-accent {
  color: #FF8906 !important;
}

/* Custom styling for menu items */
:deep(.p-menubar-root-list) {
  gap: 1rem;
}

:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
  color: var(--text-color-secondary);
  transition: color 0.2s ease;
}

:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link:hover) {
  color: #FF8906;
}

:deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link.p-highlight) {
  color: #FF8906;
  font-weight: 500;
}
</style>

