<template>
  <Menubar>
      <template #start>
          <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
              <path
                  d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                  fill="var(--p-primary-color)"
              />
              <path
                  d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                  fill="var(--p-text-color)"
              />
          </svg>
          <NuxtLink to="/" class="ml-2">DropBy</NuxtLink>
      </template>
      <template #end>
          <div class="flex items-center gap-2">
              <InputText v-if="!user" placeholder="Email" v-model="email" type="text" class="w-32 sm:w-auto" />
              <Password v-if="!user" placeholder="Password" v-model="password" class="w-32 sm:w-auto" />
              <Button
                v-if="!user"
                outlined
                @click="fireAuth"
                :disabled="email == '' || password == ''"
                :loading="loading"
              >Login</Button>

              <Button v-if="!user" outlined severity="secondary" type="button" @click="toggleRegisterMenu" aria-haspopup="true" aria-controls="register_menu">Sign Up</Button>
              <Menu ref="registerMenu" id="register_menu" :model="registerItems" :popup="true" />

              <Button v-if="user" outlined severity="contrast" type="button" icon="pi pi-user" @click="toggleAccountMenu" aria-haspopup="true" aria-controls="account_menu" />
              <Menu ref="accountMenu" id="account_menu" :model="accountItems" :popup="true" />
              <!-- <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" /> -->
          </div>
      </template>
  </Menubar>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const store = useUserStore()
const router = useRouter()
const storeUser = store.user
const user = useSupabaseUser()
console.log('store user getter? ', store.user)

const loading = ref(false)
const email = ref('')
const password = ref('')
const registerMenu = ref();
const accountMenu = ref();
const accountItems = ref([
    {
        items: [
            {
                label: 'Profile',
                icon: 'pi pi-home',
                command: () => {
                  router.push(`/${storeUser.type}s/${storeUser.associated_merchant_id ? storeUser.associated_merchant_id : storeUser.associated_vendor_id}`)
                }
            },
            {
                label: 'Messages',
                icon: 'pi pi-inbox',
                command: () => {
                  router.push(`/messages/${storeUser.associated_merchant_id ? storeUser.associated_merchant_id : storeUser.associated_vendor_id}`)
                }
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                command: () => {
                  router.push(`/settings/${storeUser.associated_merchant_id ? storeUser.associated_merchant_id : storeUser.associated_vendor_id}`)
                }
            },
            {
                label: `Sign out`,
                icon: 'pi pi-sign-out',
                command: async () => {
                  await signOut()
                }
            }
        ]
    }
]);

const registerItems = ref([
    {
        items: [
            {
                label: 'As Merchant',
                icon: 'pi pi-building-columns',
                command: () => {
                  router.push('/merchantSignup')
                }
            },
            {
                label: 'As Vendor',
                icon: 'pi pi-truck',
                command: () => {
                  router.push('/vendorSignup')
                }
            }
        ]
    }
]);

const toggleRegisterMenu = (event: any) => {
  registerMenu.value.toggle(event);
};
const toggleAccountMenu = (event: any) => {
  accountMenu.value.toggle(event)
}
const fireAuth = async () => {
  loading.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) console.log(error) 
  else if (!error && data) {
    const { data: userData } = await supabase
      .from('users')
      .select()
      .eq('id', data.user.id)
    const foundUser = userData ? userData[0] : null
    await store.fetchUser(foundUser)

    if (foundUser && foundUser.type !== 'admin') {
      await navigateTo(
        foundUser.associated_merchant_id ?
        `/merchants/${foundUser.associated_merchant_id}` :
        `/vendors/${foundUser.associated_vendor_id}`   
      )
    } else if (foundUser && foundUser.type === 'admin') {
      await navigateTo('/admin')
    }
  }
  loading.value = false
}

const signOut = async () => {
  console.log('signing out')
  const { error } = await supabase.auth.signOut()
  email.value = ''
  password.value = ''
  if (!error) await navigateTo('/')
}

</script>

