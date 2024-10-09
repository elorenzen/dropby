<script setup lang="ts">
const supabase = useSupabaseClient()
const store = useUserStore()
const user = store.user
console.log('store user getter? ', store.user)

const loading = ref(false)
const email = ref('')
const password = ref('')

const fireAuth = async () => {
  loading.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
  } else if (!error && data) {
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select()
      .eq('id', data.user.id)

    if (userData && userData.length > 0) {
      navigateTo(
        userData[0].associated_merchant_id ?
        `/merchants/${userData[0].associated_merchant_id}` :
        `/vendors/${userData[0].associated_vendor_id}`   
      )
    }
  }
  loading.value = false
}

const signOut = async () => {
  console.log('signing out')
  const { error } = await supabase.auth.signOut()
  console.log('error: ', error)
  email.value = ''
  password.value = ''
}

</script>

<template>
    <v-toolbar color="#e28413">
      <v-toolbar-title>
        <NuxtLink to="/">DropBy</NuxtLink>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-text-field
        v-if="!user"
        density="compact"
        variant="solo-filled"
        class="mt-5 mx-1"
        v-model="email"
        placeholder="Email address"
      ></v-text-field>

      <v-text-field
      v-if="!user"
        density="compact"
        variant="solo-filled"
        class="mt-5 mx-1"
        v-model="password"
        type="password"
        placeholder="Password"
      ></v-text-field>

      <v-btn
        v-if="!user"
        @click="fireAuth"
        :disabled="email == '' || password == ''"
        :loading="loading"
        class="mx-1"
        color="#000022"
        variant="outlined">
        Login
      </v-btn>

      <v-menu location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-if="!user"
            class="mx-1"
            color="#000022"
            variant="outlined"
            v-bind="props"
          >
            Sign Up
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>
              <NuxtLink to="/merchantSignup">
                As Merchant
              </NuxtLink>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              <NuxtLink to="/vendorSignup">
                As Vendor
              </NuxtLink>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <span v-if="user">{{ user.first_name }} {{ user.last_name }}</span>
      <v-btn
        v-if="user"
        @click="signOut"
        :loading="loading"
        class="mx-1"
        color="#000022"
        variant="outlined">
        <NuxtLink to="/">Sign Out</NuxtLink>
      </v-btn>
    </v-toolbar>
</template>

