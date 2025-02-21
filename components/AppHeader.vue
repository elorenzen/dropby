<template>
  <Menubar>
      <template #start>
        <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: #FF8906;" />
        <NuxtLink to="/" class="ml-2 text-xl font-bold" style="color: #FF8906;">DropBy</NuxtLink>
      </template>
      <template #end>
          <div v-if="!user" class="flex items-center gap-2">
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
                severity="secondary"
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
              />
              <Menu
                ref="viewMenu"
                id="viewer_menu"
                :model="viewerMenu"
                :popup="true"
                :rerender="renderKey"
              />
          </div>
          <div v-else class="flex items-center gap-2">
              <Button v-if="user" outlined severity="contrast" type="button" icon="pi pi-user" @click="toggleAccountMenu" aria-haspopup="true" aria-controls="account_menu" />
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
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg' // options: '.../logo-two.svg', '.../logo-three.svg'
const supabase  = useSupabaseClient()
const router    = useRouter()
const user      = useSupabaseUser()
const store     = useUserStore()
const storeUser = ref(store.user)

const loading   = ref(false)
const errDialog = ref(false)
const errMsg    = ref()
const renderKey = ref(0)

const email     = ref('')
const password  = ref('')
const acctMenu  = ref();
const viewMenu  = ref();

const viewerMenu  = ref([
  {
    items: [
      {
        label: 'How It Works',
        icon: 'pi pi-info-circle',
        command: () => {
          router.push('/about')
        }
      },
      {
        label: 'Map View',
        icon: 'pi pi-globe',
        command: () => {
          router.push('/map')
        }
      },
      // {
      //   label: 'Sale Items',
      //   icon: 'pi pi-shopping-cart',
      //   command: () => {
      //     router.push('/saleItems')
      //   }
      // },
    ]
  }
])
const accountMenu = ref([
  {
    items: [
        {
          label: 'Home',
          icon: 'pi pi-home',
          command: () => {
            router.push(`/${storeUser.value.type}/${storeUser.value[`associated_${storeUser.value.type}_id`]}`)
          }
        },
        // {
        //   label: 'Sales Events',
        //   icon: 'pi pi-receipt',
        //   command: () => {
        //     router.push(`/sales/${storeUser ? storeUser.id : user.value.id}`)
        //   }
        // },
        // {
        //   label: 'Inventory',
        //   icon: 'pi pi-shopping-cart',
        //   command: () => {
        //     router.push(`/inventory/${storeUser ? storeUser.id : user.value.id}`)
        //   }
        // },
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          command: () => {
            router.push(`/settings/${storeUser.value[`associated_${storeUser.value.type}_id`]}`)
          }
        },
        {
          label: `Sign out`,
          icon: 'pi pi-sign-out',
          command: async () => {
            await signOut()
          }
        },
    ]
  }
]);

const toggleAccountMenu = (event: any) => {
  acctMenu.value.toggle(event)
}
const toggleViewerMenu = (event: any) => {
  viewMenu.value.toggle(event)
}
const fireAuth = async () => {
  loading.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (!error && data) await confirmed(data?.user.id)
  else await errored(error?.message)
  renderKey.value++
  loading.value = false
}

const register = async () => { await navigateTo('/signup') }

const signOut = async () => {
  console.log('signing out')
  await supabase.auth.signOut()
  await store.setUser(null)
  email.value = ''
  password.value = ''
  await navigateTo('/')
}
const confirmed = async (str: any) => {
  const { data } = await supabase
    .from('users')
    .select()
    .eq('id', user.value.id)

  const foundUser = data ? data[0] : null
  await store.setUser(foundUser)
  storeUser.value = store.user
  await navigateTo(`/${storeUser.value.type}/${storeUser.value[`associated_${storeUser.value.type}_id`]}`)
}
const errored = async (str: any) => {
  errMsg.value = str
  errDialog.value = true
}

</script>

