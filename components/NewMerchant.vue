<script setup>
import { v4 } from 'uuid';
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()

const snackbar = ref(false)

// NEW MERCHANT USER DATA
const isAdmin = ref(true)
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const type = ref('merchant')
const availableToContact = ref(true)

// MERCHANT DATA
const merchantName = ref('')
const merchantDesc = ref('')
const website = ref('')
const ig = ref('')
const merchantPhone = ref('')
const merchantEmail = ref('')

const addAuthUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    console.log('data: ', data)
    console.log('error: ', error)

    if (!error) {
        snackbar.value = true
        snacktext.value = "New user registered! Confirm registration by clicking the link sent to your email before continuing."
    }
}

const checkAuthStateChg = async () => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(event, session)

        if (event === 'INITIAL_SESSION') {
            // handle initial session
        } else if (event === 'SIGNED_IN') {
            // handle sign in event
        } else if (event === 'SIGNED_OUT') {
            // handle sign out event
        } else if (event === 'PASSWORD_RECOVERY') {
            // handle password recovery event
        } else if (event === 'TOKEN_REFRESHED') {
            // handle token refreshed event
        } else if (event === 'USER_UPDATED') {
            // handle user updated event
        }
    })
}

const addMerchant = async () => {
    if (user) {
        const authUserId = user.value.id
        const merchantId = v4()

        const userObj = {
            id: authUserId,
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
            merchant_description: merchantDesc.value,
            website: website.value,
            instagram: ig.value,
            phone: merchantPhone.value,
            email: merchantEmail.value,
            average_vendor_rating: null,
        }

        const { error: userErr } = await supabase.from('users').insert(userObj)
        console.log('userErr: ', userErr)
        const { error: merchErr } = await supabase.from('merchants').insert(merchantObj)
        console.log('err: ', merchErr)
        if (!merchErr && !userErr) {
            snackbar.value = true
            snacktext.value = 'New merchant created!'

            // reset fields
            firstName.value = ''
            lastName.value = ''
            phone.value = ''
            email.value = ''
            password.value = ''

            merchantName.value = ''
            merchantDesc.value = ''
            website.value = ''
            ig.value = ''
            merchantPhone.value = ''
            merchantEmail.value = ''

            await navigateTo(`/merchants/${merchantId}`)
        }
    }
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
    <form class="form-widget" @submit.prevent="addMerchant" style="max-width: 50%;">
        <h4 class="mb-2">Primary User Information</h4>
        <v-row dense>
            <v-col cols="4">
                <v-text-field density="compact" outlined v-model="firstName" placeholder="First Name"
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field density="compact" outlined v-model="lastName" placeholder="Last Name"
                ></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field density="compact" outlined v-model="phone" placeholder="Phone Number"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field density="compact" outlined v-model="email" placeholder="Email"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field density="compact" outlined v-model="password" placeholder="Password" type="password"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-btn @click="addAuthUser" block>Add User</v-btn>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <h4 class="mb-2">Merchant Information</h4>
        <v-row>
            <v-col cols="12">
                <v-text-field density="compact" :disabled="!user" outlined v-model="merchantName" placeholder="Merchant Name (e.g. 'McDonald's')"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-textarea density="compact" :disabled="!user" outlined v-model="merchantDesc" placeholder="Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')"
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
                <v-text-field density="compact" :disabled="!user" outlined v-model="merchantPhone" placeholder="Contact Phone"
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field density="compact" :disabled="!user" outlined v-model="merchantEmail" placeholder="Contact Email"
                ></v-text-field>
            </v-col>
        </v-row>
            <!-- <div class="m-2">
                <UInput placeholder="Merchant Address" @input="getAddrs($event)" />
            </div> -->
            
            <!-- <div class="m-2">(optional) - component for listing top nearby vendors, and allow user to select "preferences"</div>
            <div class="m-2">availability component gather</div> -->
        <v-row>
            <v-btn
                @click="addMerchant"
                small
                block
                :disabled="!user"
            >Add Merchant</v-btn>
        </v-row>
    </form>
    <v-snackbar
      v-model="snackbar"
      timeout="6000"
    >
      {{ snacktext }}

      <template v-slot:actions>
        <v-btn
          color="black"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
</template>
