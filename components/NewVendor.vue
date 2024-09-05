<script setup>
import { v4 } from 'uuid';
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()

// VENDOR DATA
const vendorName = ref('')
const website = ref('')
const ig = ref('')
const primaryPhone = ref('')
const primaryEmail = ref('')

// NEW VENDOR USER DATA
const isAdmin = ref(true)
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const type = ref('vendor')
const availableToContact = ref(true)

const addVendor = async () => {
    const userId = v4()
    const vendorId = v4()

    const userObj = {
        id: userId,
        created_at: new Date(),
        associated_vendor_id: vendorId,
        is_admin: isAdmin.value,
        first_name: firstName.value,
        last_name: lastName.value,
        phone: phone.value,
        email: email.value,
        type: type.value,
        available_to_contact: availableToContact.value
    }

    const vendorObj = {
        id: vendorId,
        created_at: new Date(),
        vendor_name: vendorName.value,
        website: website.value,
        instagram: ig.value,
        phone: primaryPhone.value,
        email: primaryEmail.value,
        average_merchant_rating: null,
    }

    const { error: userErr } = await supabase.from('users').insert(userObj)
    console.log('userErr: ', userErr)
    const { error: merchErr } = await supabase.from('vendors').insert(vendorObj)
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
    <v-container class="flex justify-center p-2">
        <form class="form-widget" @submit.prevent="addVendor">
            <v-row dense>
                <v-col cols="6">
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
            <v-divider class="mb-4"></v-divider>
            <v-row>
                <v-col cols="12">
                    <v-text-field density="compact" outlined v-model="vendorName" placeholder="Vendor Name (e.g. 'McDonald's')"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" outlined v-model="website" placeholder="Website URL"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" outlined v-model="ig" placeholder="Instagram Link (optional)"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" outlined v-model="primaryPhone" placeholder="Primary Contact Phone"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" outlined v-model="primaryEmail" placeholder="Primary Contact Email"
                    ></v-text-field>
                </v-col>
                <!-- <div class="m-2">
                    <UInput placeholder="Vendor Address" @input="getAddrs($event)" />
                </div> -->
                
                <!-- <div class="m-2">(optional) - component for listing top nearby vendors, and allow user to select "preferences"</div>
                <div class="m-2">availability component gather</div> -->
                <v-btn
                    @click="addVendor"
                    small
                    block
                >Add Vendor</v-btn>
            </v-row>
        </form>
    </v-container>
</template>
 