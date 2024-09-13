<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
console.log(user.value)

const loading = ref(false)
const email = ref('')
const password = ref('')

const fireAuth = async () => {
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
    console.log('data: ', data)
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select()
      .eq('id', data.user.id)

    console.log('userData: ', userData)
    if (userData && userData.length > 0) {
      navigateTo(
        userData[0].associated_merchant_id ?
        `/merchants/${userData[0].associated_merchant_id}` :
        `/vendors/${userData[0].associated_vendor_id}`   
      )
    }
  }

}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
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
        class="mx-1"
        color="#000022"
        variant="outlined">
        Login
      </v-btn>

      <v-btn
        v-if="!user"
        class="mx-1"
        color="#000022"
        variant="outlined">
        <NuxtLink to="/signup">Sign Up</NuxtLink>
      </v-btn>

      <span v-if="user">{{ user.email }}</span>
      <v-btn
        v-if="user"
        @click="signOut"
        class="mx-1"
        color="#000022"
        variant="outlined">
        <NuxtLink to="/">Sign Out</NuxtLink>
      </v-btn>
    </v-toolbar>
</template>

