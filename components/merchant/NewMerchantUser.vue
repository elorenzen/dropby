<script setup>
// THIS FILE MAY BE DELETED IN THE FUTURE.
//      Disregard for now...
//      All functionality below exists in
//      '/components/NewMerchant.vue'

import { v4 } from 'uuid';
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const isAdmin = ref(true)
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const type = ref('merchant')
const availableToContact = ref(true)

const addUser = async () => {
    const userObj = {
        id: v4(),
        created_at: new Date(),
        is_admin: isAdmin.value,
        first_name: firstName.value,
        last_name: lastName.value,
        phone: phone.value,
        email: email.value,
        type: type.value,
        available_to_contact: availableToContact.value
    }
    console.log('merchant object: ', userObj)
    const { error } = await supabase.from('users').insert(userObj)
    console.log('error: ', error)
}
</script>

<template>
  <v-container class="flex justify-center p-2">
      <form class="form-widget" @submit.prevent="addUser">
          <v-row dense>
              <v-col cols="12">
                  <v-text-field density="compact" outlined v-model="firstName" placeholder="First Name"
                  ></v-text-field>
              </v-col>
              <v-col cols="6">
                  <v-text-field density="compact" outlined v-model="lastName" placeholder="Last Name"
                  ></v-text-field>
              </v-col>
              <v-col cols="6">
                  <v-text-field density="compact" outlined v-model="phone" placeholder="Phone Number"
                  ></v-text-field>
              </v-col>
              <v-col cols="6">
                  <v-text-field density="compact" outlined v-model="email" placeholder="Email"
                  ></v-text-field>
              </v-col>
          </v-row>
              <v-btn
                  @click="addUser"
              >Add User</v-btn>
      </form>
  </v-container>
</template>