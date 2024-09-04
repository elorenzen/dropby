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
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
  }

}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  email.value = ''
  password.value = ''
}

</script>

<template>
    <v-toolbar color="orange-darken-4">
      <v-toolbar-title>DropBy</v-toolbar-title>

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
        color="black"
        variant="outlined">
        Login/Register
      </v-btn>

      <span v-if="user">{{ user.email }}</span>
      <v-btn
        v-if="user"
        @click="signOut"
        class="mx-1"
        color="black"
        variant="outlined">
        Sign Out
      </v-btn>
    </v-toolbar>
</template>

