<script setup>
import { v4 } from 'uuid';
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()

const snackbar = ref(false)
const snacktext = ref('')

const newUserLoading = ref(false)
const newVendorLoading = ref(false)

// NEW VENDOR USER DATA
const isAdmin = ref(true)
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const type = ref('vendor')
const availableToContact = ref(true)

const uploading = ref(false)

// VENDOR DATA
const imageUrl = ref('')
const vendorName = ref('')
const vendorDesc = ref('')
const website = ref('')
const ig = ref('')
const vendorPhone = ref('')
const vendorEmail = ref('')
const cuisine = ref([])
const cuisines = ref([
    'Alcohol',
    'American',
    'Asian fusion',
    'Bakery',
    'Breaksfast',
    'Coffee',
    'Comfort food',
    'Dessert',
    'Healthy food',
    'Ice cream',
    'Italian',
    'Latin',
    'mediterranean',
    'Mexican',
    'Pizza',
    'Sandwich',
    'Seafood',
    'Snacks',
    'Tacos',
    'Vegan'
])

const addAuthUser = async () => {
    newUserLoading.value = true
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
            first_name: firstName.value,
            last_name: lastName.value,
            user_type: type.value
        }
      }
    })
    if (error) console.log('error: ', error)

    if (!error) {
        snackbar.value = true
        snacktext.value = "New user registered! Confirm registration by clicking the link sent to your email before continuing."
    }
    newUserLoading.value = false
}

const updateImage = async (e) => {
    uploading.value = true
    const file = e.target.files[0]

    if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('vendor_avatars').upload(filePath, file)

        if (!uploadError) {
            const { data } = supabase.storage.from('vendor_avatars').getPublicUrl(filePath)
            if (data) imageUrl.value = data.publicUrl
        }
    }
    uploading.value = false
}

const addVendor = async () => {
    // if (user) {
        const authUserId = user.value.id
        // const vendorId = v4()

        // const userObj = {
        //     id: authUserId,
        //     created_at: new Date(),
        //     associated_vendor_id: vendorId,
        //     is_admin: isAdmin.value,
        //     first_name: firstName.value,
        //     last_name: lastName.value,
        //     phone: phone.value,
        //     email: email.value,
        //     type: type.value,
        //     available_to_contact: availableToContact.value
        // }

        const vendorObj = {
            id: v4(),
            created_at: new Date(),
            vendor_name: vendorName.value,
            vendor_description: vendorDesc.value,
            website: website.value,
            instagram: ig.value,
            phone: vendorPhone.value,
            email: vendorEmail.value,
            cuisine: cuisine.value,
            avatar_url: imageUrl.value
        }

        //const { error: userErr } = await supabase.from('users').insert(userObj)
        //console.log('userErr: ', userErr)
        const { error: vendorErr } = await supabase.from('vendors').insert(vendorObj)
        console.log('err: ', vendorErr)
        if (!vendorErr) {
            snackbar.value = true
            snacktext.value = 'New vendor created!'

            // reset fields
            firstName.value = ''
            lastName.value = ''
            phone.value = ''
            email.value = ''
            password.value = ''

            vendorName.value = ''
            vendorDesc.value = ''
            website.value = ''
            ig.value = ''
            vendorPhone.value = ''
            vendorEmail.value = ''
            cuisine.value = []

            //navigateTo(`/merchants/${vendorId}`)
        }
    // }
}

const getAddrs = (e) => {
    setTimeout(async () => {
        const url = 'https://api.geoapify.com/v1/geocode/autocomplete?text='
        const encoded = encodeURI(e.target.value);
        const apiParamStr = `&apiKey=${config.public.autocomplete}`
        const res = await $fetch(`${url}${encoded}${apiParamStr}`, { method: 'GET'})
    }, 4500)
} 
</script>

<template>
    <v-container class="flex justify-center p-2">
        <form class="form-widget" @submit.prevent="addVendor">
            <!-- <v-row dense>
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
                <v-col cols="12">
                    <v-text-field density="compact" outlined v-model="password" placeholder="Password" type="password"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <Button @click="addAuthUser" block>Add User</Button>
            </v-row> -->

            <v-row dense class="pa-2">
                <v-col v-if="imageUrl !== ''">
                    <img :src="imageUrl" />
                </v-col>
                <v-col>
                    <v-file-input
                        :label="uploading ? 'Uploading ...' : 'Upload New Image'"
                        @change="updateImage"
                        :disabled="uploading"
                    ></v-file-input>
                </v-col>
            </v-row>  
            <v-divider class="mb-4"></v-divider>

            <v-row>
                <v-col cols="7">
                    <v-text-field density="compact" :disabled="!user" outlined v-model="vendorName" placeholder="Vendor Name (e.g. 'Tegridy Burger')"
                    ></v-text-field>
                </v-col>
                <v-col cols="5">
                    <MultiSelect v-model="cuisine" display="chip" :options="cuisines" filter placeholder="Select Cuisine(s)"
                    :maxSelectedLabels="3" class="w-full md:w-80" />
                </v-col>
                <v-col cols="12">
                    <v-textarea density="compact" :disabled="!user" outlined v-model="vendorDesc" placeholder="Vendor Desciption (e.g. 'Food truck from South Park, CO. We sell our very own Tegridy Burger®.')"
                    ></v-textarea>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" :disabled="!user" outlined v-model="website" placeholder="Website URL"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" :disabled="!user" outlined v-model="ig" placeholder="Instagram Link (optional)"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" :disabled="!user" outlined v-model="vendorPhone" placeholder="Primary Contact Phone"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field density="compact" :disabled="!user" outlined v-model="vendorEmail" placeholder="Primary Contact Email"
                    ></v-text-field>
                </v-col>
                <!-- <div class="m-2">
                    <UInput placeholder="Vendor Address" @input="getAddrs($event)" />
                </div> -->
                
                <!-- <div class="m-2">(optional) - component for listing top nearby vendors, and allow user to select "preferences"</div>
                <div class="m-2">availability component gather</div> -->
                <Button
                    @click="addVendor"
                    small
                    block
                >Add Vendor</Button>
            </v-row>
        </form>
        <v-snackbar v-model="snackbar" timeout="6000">
            {{ snacktext }}

            <template v-slot:actions>
                <Button
                    color="#000022"
                    variant="text"
                    @click="snackbar = false"
                >Close</Button>
            </template>
        </v-snackbar>
    </v-container>
</template>
 