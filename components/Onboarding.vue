<template>
    <div class="card flex justify-center">
        <Stepper value="1" class="basis-[60rem]">
            <StepList>
                <Step value="1">Type</Step>
                <Step value="2">Primary User Information</Step>
                <Step value="3">Business Information</Step>
                <Step value="4">Review</Step>
            </StepList>
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1" class="pa-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Card class="h-full">
                                <template #title>
                                    <div class="text-xl font-semibold mb-2">Merchant</div>
                                </template>
                                <template #content>
                                    <p class="text-gray-600">
                                        Select this option if you are an employee or owner of a physical business.
                                        You must have a physical location and a business license in order to be approved 
                                        for food trucks to begin setting up at your place of business.
                                    </p>
                                </template>
                            </Card>
                        </div>

                        <div>
                            <Card class="h-full">
                                <template #title>
                                    <div class="text-xl font-semibold mb-2">Vendor</div>
                                </template>
                                <template #content>
                                    <p class="text-gray-600">
                                        Select this option if you are an employee or owner of a food truck business.
                                        You must have a valid business license in order to be approved and begin setting up
                                        at breweries, and other establishments in the area.
                                    </p>
                                </template>
                            </Card>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <SelectButton
                            class="flex items-center justify-center"
                            v-model="type"
                            :options="[{label: 'Merchant', value: 'merchant'}, {label: 'Vendor', value: 'vendor'}]"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                    <div class="flex pt-6 justify-end">
                        <Button
                            :label="!type ? 'Continue' : `Continue as ${type.charAt(0).toUpperCase() + type.slice(1)}`"
                            :disabled="!type"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            @click="activateCallback('2')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="2" class="pa-8">
                    <div class="flex flex-col">
                        <Fluid>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="first_name" v-model="first" />
                                        <label for="first_name">First Name</label>
                                    </FloatLabel>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="last_name" v-model="last" />
                                        <label for="last_name">Last Name</label>
                                    </FloatLabel>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="email" v-model="email" />
                                        <label for="email">Email</label>
                                    </FloatLabel>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputMask id="phone" v-model="phone" mask="(999) 999-9999" />
                                        <label for="phone">Phone</label>
                                    </FloatLabel>
                                </div>
                                <div class="card flex justify-center">
                                    <v-switch density="compact" label="Administrative Access" v-model="isAdmin" :disabled="true"></v-switch>
                                </div>
                                <div class="card flex justify-center">
                                    <v-switch density="compact" label="Available to Contact" v-model="available"></v-switch>
                                </div>
                            </div>
                        </Fluid>
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                        <Button
                            label="Next"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            :disabled="
                                !first ||
                                !last ||
                                !email ||
                                !phone
                            "
                            @click="activateCallback('3')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="3" class="pa-8">
                    <div v-if="type" class="flex flex-col">
                        <NewBusiness @objUpdated="objUpdated" :bizType="type" />
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                        <Button
                            label="Review"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            :disabled="
                                !bizName ||
                                !bizDesc ||
                                !bizEmail ||
                                !bizPhone
                            "
                            @click="activateCallback('4')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="4" class="pa-8">
                    <h4 class="text-xl font-bold">Primary User</h4>
                    <p class="ma-2"><span class="font-bold">Name: </span>{{ first }} {{ last }}</p>
                    <p class="ma-2"><span class="font-bold">Email: </span>{{ email }}</p>
                    <p class="ma-2"><span class="font-bold">Phone: </span>{{ phone }}</p>
                    <p class="ma-2"><span class="font-bold">Available for contact: </span>
                        {{ available ? 'Yes' : 'No' }}
                    </p>

                    <h4 class="text-xl font-bold">{{ type }} Information</h4>
                    <NuxtImg :src="imageUrl" alt="Image" class="w-full rounded" />
                    <p class="ma-2"><span class="font-bold">Name: </span>{{ bizName }}</p>
                    <p class="ma-2"><span class="font-bold">Description: </span>{{ bizDesc ? bizDesc : '-' }}</p>
                    <p class="ma-2"><span class="font-bold">Website: </span>{{ website ? website : '-'}}</p>
                    <p class="ma-2"><span class="font-bold">Instagram: </span>{{ ig ? ig : '-' }}</p>
                    <p class="ma-2"><span class="font-bold">Phone: </span>{{ bizEmail }}</p>
                    <p class="ma-2"><span class="font-bold">Email: </span>{{ bizPhone }}</p>

                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                        <Button label="Submit" @click="submit" :loading="submitting" />
                    </div>
                </StepPanel>
            </StepPanels>
        </Stepper>

        <v-snackbar
          v-model="snackbar"
          timeout="6000"
        >
          {{ snacktext }}

          <template v-slot:actions>
            <Button
              color="#000022"
              variant="text"
              @click="snackbar = false"
            >
              Close
            </Button>
          </template>
        </v-snackbar>

        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const authUser = useSupabaseUser()
import { v4 } from 'uuid';

// Panel I data
const type = ref(null)

// Panel II data
const first     = ref()
const last      = ref()
const email     = ref(authUser.value.email)
const phone     = ref()
const isAdmin   = ref(true)
const available = ref(true)

// Panel III data
const bizName   = ref()
const bizDesc   = ref()
const website   = ref()
const ig        = ref()
const bizEmail  = ref()
const bizPhone  = ref()
const imageUrl  = ref('https://ionicframework.com/docs/img/demos/card-media.png')

// if vendor,
const cuisine = ref([])

// if merchant,
const addressComponents = ref([])
const coordinates = ref({})
const formattedAddress = ref('')
const addressUrl = ref('')

const submitting = ref(false)
const snackbar  = ref(false)
const snacktext = ref('')
const errType   = ref('')
const errMsg    = ref('')
const errDialog = ref(false)

const objUpdated = (obj:any) => {
    bizName.value = obj.name
    bizDesc.value = obj.desc
    bizPhone.value = obj.phone
    bizEmail.value = obj.email
    website.value = obj.website
    ig.value = obj.ig
    cuisine.value = obj.cuisine ? obj.cuisine : []
    addressComponents.value = obj.addressComponents ? obj.addressComponents : []
    coordinates.value = obj.coordinates ? obj.coordinates : {}
    formattedAddress.value = obj.formattedAddress ? obj.formattedAddress : ''
    addressUrl.value = obj.addressUrl ? obj.addressUrl : ''
    imageUrl.value = obj.imageUrl ? obj.imageUrl : ''
}

const submit = async () => {
    submitting.value = true
    const userId = authUser.value.id
    const typeId = v4()

    // first, create user in db 
    const userObj = {
        id: userId,
        created_at: new Date(),
        first_name: first.value,
        last_name: last.value,
        email: email.value,
        phone: phone.value,
        is_admin: isAdmin.value,
        type: type.value,
        associated_merchant_id: type.value === 'merchant' ? typeId : null,
        associated_vendor_id: type.value === 'vendor' ? typeId : null,
        available_to_contact: available.value
    }

    // create user in db
    const { error: userErr } = await supabase.from('users').insert(userObj)
    // then, create merchant/vendor in db
    if (!userErr) {
        const obj = {
            id: typeId,
            created_at: new Date(),
            [`${type.value}_name`]: bizName.value,
            [`${type.value}_description`]: bizDesc.value,
            website: website.value,
            instagram: ig.value,
            phone: bizPhone.value,
            email: bizEmail.value,
            avatar_url: imageUrl.value
        }
        if (type.value === 'merchant') {
            obj.address_components = addressComponents.value
            obj.coordinates = coordinates.value
            obj.formatted_address = formattedAddress.value
            obj.address_url = addressUrl.value
        } else if (type.value === 'vendor') obj.cuisine = cuisine.value

        const { error: objErr } = await supabase.from(`${type.value}s`).insert(obj)
        if (!objErr) {
            snackbar.value = true
            snacktext.value = `${type.value} Created! An email confirmation has been sent. You will now be redirected.`
        } else throwErr('Business Creation', objErr.message)
        // Redirect
        await navigateTo(`/settings/${typeId}`)
    } else throwErr('User Creation', userErr.message)
    submitting.value = false
}
const throwErr = (title: any, msg: any) => {
    errType.value = title
    errMsg.value = msg
    errDialog.value = true
}
</script>

<style scoped>

</style>