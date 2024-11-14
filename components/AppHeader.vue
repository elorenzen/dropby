<template>
  <Menubar>
      <template #start>
          <NuxtLink to="/" class="ml-2 text-xl font-bold">DropBy</NuxtLink>
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

  <ErrorDialog v-if="errDialog" :errType="'Sign-in'" :errMsg="errMsg" @errorClose="errDialog = false" />
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const store = useUserStore()
const router = useRouter()
const storeUser = store.user
const user = useSupabaseUser()
console.log('store user getter? ', store.user)

const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref()

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

  if (!error && data) {
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
  } else if (error) {
    errDialog.value = true
    errMsg.value = error.message
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

