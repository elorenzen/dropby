<template>
  <div>
  <Menubar>
      <template #start>
        <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: #FF8906;" />
        <NuxtLink to="/" class="m-2 text-xl font-bold" style="color: #FF8906;">DropBy</NuxtLink>
      </template>
      <template #end>
            <div v-if="!isAuthenticated" class="flex items-center gap-2">
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

              <Button
                outlined
                severity="contrast"
                type="button"
                icon="pi pi-bars"
                @click="toggleViewerMenu"
                aria-haspopup="true"
                aria-controls="viewer_menu"
                style="border-color: var(--secondary-color); color: var(--secondary-color);"
              />
              <Menu
                ref="viewMenu"
                id="viewer_menu"
                :model="viewerMenu"
                :popup="true"
                :rerender="renderKey"
              >
                <template #item="{ item }">
                  <div class="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <BaseIcon v-if="item.label === 'How It Works'" name="info" color="#ff9800" size="20" />
                    <BaseIcon v-else-if="item.label === 'Events'" name="calendar" color="#ff9800" size="20" />
                    <BaseIcon v-else-if="item.label === 'Map View'" name="globe" color="#ff9800" size="20" />
                    <BaseIcon v-else-if="item.label === 'Search'" name="search" color="#ff9800" size="20" />
                    <span class="ml-2" style="color: #ff9800;">{{ item.label }}</span>
                  </div>
                </template>
              </Menu>
          </div>
          <div v-else class="flex items-center gap-2">
                <Button v-if="isAuthenticated" outlined severity="contrast" type="button" icon="pi pi-user" @click="toggleAccountMenu" aria-haspopup="true" aria-controls="account_menu" style="border-color: var(--secondary-color); color: var(--secondary-color);" />
              <Menu
                ref="acctMenu"
                id="account_menu"
                :model="accountMenu"
                :popup="true"
                :rerender="renderKey"
              />
              <!-- <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" /> -->
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
const { isAuthenticated, currentUser, signOut } = useAuth()

const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref()
const renderKey = ref(0)

const email = ref('')
const password = ref('')
const acctMenu = ref()
const viewMenu = ref()

const viewerMenu = ref([
  {
    items: [
      {
        label: 'How It Works',
        icon: () => h(BaseIcon, { name: 'info', color: '#ff9800', size: 20 }),
        command: () => {
          router.push('/viewer/about')
        }
      },
      {
        label: 'Events',
        icon: () => h(BaseIcon, { name: 'calendar', color: '#ff9800', size: 20 }),
        command: () => {
          router.push('/viewer/events')
        }
      },
      {
        label: 'Map View',
        icon: () => h(BaseIcon, { name: 'globe', color: '#ff9800', size: 20 }),
        command: () => {
          router.push('/viewer/map')
        }
      },
      {
        label: 'Search',
        icon: () => h(BaseIcon, { name: 'search', color: '#ff9800', size: 20 }),
        command: () => {
          router.push('/viewer/search')
        }
      },
    ]
  }
])

const accountMenu = computed(() => [
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
            if (currentUser.value?.type) {
              const associatedIdKey = `associated_${currentUser.value.type}_id` as keyof typeof currentUser.value
              const userAssociatedId = currentUser.value[associatedIdKey]
              if (userAssociatedId) {
                router.push(`/settings/${userAssociatedId}`)
              }
            }
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

const toggleAccountMenu = (event: any) => {
  acctMenu.value.toggle(event)
}

const toggleViewerMenu = (event: any) => {
  viewMenu.value.toggle(event)
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
</style>

