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
                    <div class="flex flex-col">
                        <Splitter class="mb-8">
                            <SplitterPanel class="flex items-center justify-center">
                                <Card>
                                    <template #title>Merchant Description</template>
                                    <template #content>
                                        Storage shed, troughs feed bale manure, is garden wheat oats at augers.
                                        Bulls at rose garden cucumbers mice sunflower wheat in pig.
                                        Chainsaw foal hay hook, herbs at combine harvester, children is mallet.
                                        Goat goose hen horse. Pick up truck livestock, pets and storage shed,
                                        troughs feed bale manure, is garden wheat oats at augers. Lamb.
                                    </template>
                                </Card>
                            </SplitterPanel>
                            <SplitterPanel class="flex items-center justify-center">
                                <Card>
                                    <template #title>Vendor Description</template>
                                    <template #content>
                                        Lookout flogging bilge rat main sheet bilge water nipper fluke to go on account heave down clap of thunder.
                                        Reef sails six pounders skysail code of conduct sloop cog Yellow Jack gunwalls grog blossom starboard.
                                        Swab black jack ahoy Brethren of the Coast schooner poop deck main sheet topmast furl marooned.
                                    </template>
                                </Card>
                            </SplitterPanel>
                        </Splitter>
                        <SelectButton class="flex items-center justify-center" v-model="type" :options="['Merchant', 'Vendor']" />
                    </div>
                    <div class="flex pt-6 justify-end">
                        <Button
                            :label="!type ? 'Continue' : `Continue as ${type}`"
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
                    <div class="flex flex-col">
                        <Fluid>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="col-span-full">
                                  <FloatLabel variant="on">
                                      <InputText id="name" v-model="bizName" :fluid="true" />
                                      <label for="name">Merchant Name (e.g. 'McDonald's')</label>
                                  </FloatLabel>
                                </div>

                                <div class="col-span-full">
                                  <FloatLabel variant="on">
                                      <Textarea id="desc" v-model="bizDesc" rows="5" />
                                      <label for="desc">Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')</label>
                                  </FloatLabel>
                                </div>

                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-phone" />
                                        <InputMask id="business_phone" v-model="bizPhone" mask="(999) 999-9999" />
                                    </IconField>
                                    <label for="business_phone">Phone</label>
                                  </FloatLabel>
                                </div>
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-envelope" />
                                        <InputText id="business_email" v-model="bizEmail"/>
                                    </IconField>
                                    <label for="business_email">Email</label>
                                  </FloatLabel>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <IconField>
                                            <InputIcon class="pi pi-link" />
                                            <InputText id="website" v-model="website"/>
                                        </IconField>
                                        <label for="website">Website</label>
                                    </FloatLabel>
                                </div>
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-instagram" />
                                        <InputText id="ig" v-model="ig" />
                                    </IconField>
                                    <label for="ig">Instagram</label>
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
                    <p class="ma-2"><span class="font-bold">Name: </span>{{ bizName }}</p>
                    <p class="ma-2"><span class="font-bold">Description: </span>{{ bizDesc ? bizDesc : '-' }}</p>
                    <p class="ma-2"><span class="font-bold">Website: </span>{{ website ? website : '-'}}</p>
                    <p class="ma-2"><span class="font-bold">Instagram: </span>{{ ig ? ig : '-' }}</p>
                    <p class="ma-2"><span class="font-bold">Phone: </span>{{ bizEmail }}</p>
                    <p class="ma-2"><span class="font-bold">Email: </span>{{ bizPhone }}</p>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                        <Button label="Submit" @click="submit" />
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
const email     = ref()
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

const snackbar  = ref(false)
const snacktext = ref('')

const submit = async () => {
    const userId = authUser.value.id
    const typeId = v4()
    const typeLower = type.value.toLowerCase()

    // first, create user in db 
    const userObj = {
        id: userId,
        created_at: new Date(),
        first_name: first.value,
        last_name: last.value,
        email: email.value,
        phone: phone.value,
        is_admin: isAdmin.value,
        type: typeLower,
        associated_merchant_id: typeLower === 'merchant' ? typeId : null,
        associated_vendor_id: typeLower === 'vendor' ? typeId : null,
        available_to_contact: available.value
    }
    const { error: userErr } = await supabase.from('users').insert(userObj)
    // then, create merchant/vendor in db
    if (!userErr) {
        const obj = {
            id: typeId,
            created_at: new Date(),
            [`${typeLower}_name`]: bizName.value,
            [`${typeLower}_description`]: bizDesc.value,
            website: website.value,
            instagram: ig.value,
            phone: bizPhone.value,
            email: bizEmail.value,
        }
        const { error: objErr } = await supabase.from(typeLower).insert(obj)
        if (!objErr) {
            snackbar.value = true
            snacktext.value = `${type.value} Created! An email confirmation has been sent. You will now be redirected.`

            // TO DO: merchant/vendor signup endpoint

            // Redirect
            await navigateTo(`/settings/${typeId}`)
        }
    }
}
</script>

<style scoped>

</style>