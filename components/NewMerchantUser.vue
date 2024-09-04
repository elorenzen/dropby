<script setup>
import { v4 } from 'uuid';
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const isAdmin = ref(true)
const firstName = ref('')
const lastName = ref('')
const phone = ref(user ? user.value.phone : '')
const email = ref(user ? user.value.email : '')
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
  <form class="form-widget" @submit.prevent="addUser">
    <div class="m-2">
        <UInput v-model="firstName" placeholder="First Name" />
    </div>
    <div class="m-2">
        <UInput v-model="lastName" placeholder="Last Name" />
    </div>
    <div class="m-2">
        <UInput v-model="phone" placeholder="Phone Number" />
    </div>
    <div class="m-2">
        <UInput v-model="email" placeholder="Email Address" />
    </div>
    <div class="flex justify-center px-2">
        <div class="m-2"><UButton @click="addUser">Add User</UButton></div>
    </div>
  </form>
</template>