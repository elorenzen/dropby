<script setup>
import { v4 } from 'uuid';

const isAdmin = ref(false)
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const availableToContact = ref(true)

const addUser = async () => {
    const userObj = {
        id: v4(),
        created: new Date(),
        associatedMerchantId: '', // will be populated by 'merchantId' route param
        isAdmin: isAdmin.value,
        firstName: firstName.value,
        lastName: lastName.value,
        phone: phone.value,
        email: email.value,
        availableToContact: availableToContact.value
    }
    console.log('merchant object: ', userObj)
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