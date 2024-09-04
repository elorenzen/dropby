<script setup>
import { v4 } from 'uuid';
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()

// MERCHANT DATA
const merchantName = ref('')
const website = ref('')
const ig = ref('')
const primaryPhone = ref('')
const primaryEmail = ref('')

// NEW MERCHANT USER DATA
const isAdmin = ref(true)
const firstName = ref('')
const lastName = ref('')
const phone = ref(user ? user.value.phone : '')
const email = ref(user ? user.value.email : '')
const type = ref('merchant')
const availableToContact = ref(true)

const addMerchant = async () => {
    const userId = v4()
    const merchantId = v4()

    const userObj = {
        id: userId,
        created_at: new Date(),
        associated_merchant_id: merchantId,
        is_admin: isAdmin.value,
        first_name: firstName.value,
        last_name: lastName.value,
        phone: phone.value,
        email: email.value,
        type: type.value,
        available_to_contact: availableToContact.value
    }
    
    const merchantObj = {
        id: merchantId,
        created_at: new Date(),
        merchant_name: merchantName.value,
        website: website.value,
        instagram: ig.value,
        phone: primaryPhone.value,
        email: primaryEmail.value,
        average_vendor_rating: null,
    }

    const { error: userErr } = await supabase.from('users').insert(userObj)
    console.log('userErr: ', userErr)
    const { error: merchErr } = await supabase.from('merchants').insert(merchantObj)
    console.log('err: ', merchErr)
}

const getAddrs = (e) => {
    setTimeout(async () => {
        const url = 'https://api.geoapify.com/v1/geocode/autocomplete?text='
        const encoded = encodeURI(e.target.value);
        const apiParamStr = `&apiKey=${config.public.autocomplete}`
        const res = await $fetch(`${url}${encoded}${apiParamStr}`, { method: 'GET'})
        console.log('res: ', res)
    }, 4500)
} 
</script>

<template>
  <form class="form-widget" @submit.prevent="addMerchant">
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
    -------------
    <div class="m-2">
        <UInput v-model="merchantName" placeholder="Merchant Name (e.g. 'McDonald's')" />
    </div>
    <div class="m-2">
        <UInput v-model="website" placeholder="Website URL" />
    </div>
    <div class="m-2">
        <UInput v-model="ig" placeholder="Instagram Link (optional)" />
    </div>
    <div class="m-2">
        <UInput v-model="primaryPhone" placeholder="Primary Contact Phone" />
    </div>
    <div class="m-2">
        <UInput v-model="primaryEmail" placeholder="Primary Contact Email" />
    </div>
    <!-- <div class="m-2">
        <UInput placeholder="Merchant Address" @input="getAddrs($event)" />
    </div> -->
    
    <div class="m-2">(optional) - component for listing top nearby vendors, and allow user to select "preferences"</div>
    <div class="m-2">availability component gather</div>
    <div class="flex justify-center px-2">
        <div class="m-2"><UButton @click="addMerchant">Add Merchant</UButton></div>
    </div>
  </form>
</template>
