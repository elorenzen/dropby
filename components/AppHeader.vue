<template>
  <Menubar>
      <template #start>
        <Logo class="w-10 h-10 font-bold" :fontControlled="false" style="color: #e28413;" />
          <NuxtLink to="/" class="ml-2 text-xl font-bold" style="color: #e28413;">DropBy</NuxtLink>
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

              <Button
                v-if="!user"
                outlined
                severity="secondary"
                @click="register"
              >Sign Up</Button>

              <Button v-if="user" outlined severity="contrast" type="button" icon="pi pi-user" @click="toggleAccountMenu" aria-haspopup="true" aria-controls="account_menu" />
              <Menu ref="menu" id="account_menu" :model="menuItems" :popup="true" />
              <!-- <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" /> -->
          </div>
      </template>
  </Menubar>

  <ErrorDialog v-if="errDialog" :errType="'Sign-in'" :errMsg="errMsg" @errorClose="errDialog = false" />
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg' // options: '.../logo-two.svg', '.../logo-three.svg'
const supabase  = useSupabaseClient()
const router    = useRouter()
const user      = useSupabaseUser()
const store     = useUserStore()
const storeUser = store.user

const loading   = ref(false)
const errDialog = ref(false)
const errMsg    = ref()

const email     = ref('')
const password  = ref('')
const menu      = ref();
const menuItems = ref([
    {
        items: [
            {
                label: 'Home',
                icon: 'pi pi-home',
                command: () => {
                  router.push(`/${storeUser.type}/${storeUser.associated_merchant_id ? storeUser.associated_merchant_id : storeUser.associated_vendor_id}`)
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

const toggleAccountMenu = (event: any) => {
  menu.value.toggle(event)
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

const register = async () => { await navigateTo('/signup') }

const signOut = async () => {
  console.log('signing out')
  const { error } = await supabase.auth.signOut()
  email.value = ''
  password.value = ''
  if (!error) await navigateTo('/')
}

</script>

