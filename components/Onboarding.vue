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
                        <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="3" class="pa-8">
                    <div v-if="type === 'Merchant'" class="flex flex-col">
                        <Fluid>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                  <FloatLabel variant="on">
                                      <InputText id="name" v-model="bizName" :fluid="true" />
                                      <label for="name">Name</label>
                                  </FloatLabel>
                                </div>

                                <!-- ADDRESS -->
                                <div>
                                  <FloatLabel variant="on">
                                    <div class="p-iconfield">
                                      <span class="p-inputicon pi pi-map-marker"></span>
                                      <input
                                        class="p-inputtext p-component p-filled"
                                        id="address"
                                        ref="streetRef"
                                        placeholder="Enter address"
                                      />
                                    </div>
                                    <label for="address">Location Address</label>
                                  </FloatLabel>
                                </div>

                                <div class="col-span-full">
                                  <FloatLabel variant="on">
                                      <Textarea id="desc" v-model="bizDesc" rows="5" />
                                      <label for="desc">Description</label>
                                  </FloatLabel>
                                </div>

                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-phone" />
                                        <InputText id="business_phone" v-model="bizPhone" />
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
                    <div v-else class="flex flex-col">
                        Vendor shit here
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                        <Button label="Review" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('4')" />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="4" class="pa-8">
                    Review shit here
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                        <Button label="Submit" @click="submit" />
                    </div>
                </StepPanel>
            </StepPanels>
        </Stepper>
    </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
import { v4 } from 'uuid';
import { Loader } from '@googlemaps/js-api-loader'

// Panel I data
const type = ref()

// Panel II data
const first     = ref()
const last      = ref()
const email     = ref()
const phone     = ref()
const isAdmin   = ref(true)
const available = ref(true)

// Panel III data
const imageUrl  = ref()
const bizName   = ref()
const bizDesc   = ref()
const website   = ref()
const ig        = ref()
const bizEmail  = ref()
const bizPhone  = ref()
const streetRef = ref()

const addressComponents = ref()
const coordinates       = ref()
const formattedAddress  = ref()
const addressUrl        = ref()

onMounted(async () => {
    await sdkInit()
})

const sdkInit = async () => {
  //initialize google sdk
  const config = useRuntimeConfig()
  const loader = new Loader({
    apiKey: config.public.gMapKey,
    version: 'beta',
    libraries: ['places'],
  })
  loader.load().then((google) => {
    const options = {
      componentRestrictions: { country: 'us' },
      fields: ['geometry/location', 'name', 'formatted_address', 'types'],
      strictBounds: false,
    }
    // attaches it to the input field with this ref
    const autocomplete = new google.maps.places.Autocomplete(
      streetRef.value,
      options
    )
    autocomplete.addListener('place_changed', () => {
      const placeResponse = autocomplete.getPlace()
      const lat = placeResponse.geometry.location.lat()
      const lng = placeResponse.geometry.location.lng()

      addressComponents.value = placeResponse
        ? placeResponse.address_components
        : ''
      coordinates.value = placeResponse ? { lat: lat, lng: lng } : ''
      formattedAddress.value = placeResponse
        ? placeResponse.formatted_address
        : ''
      addressUrl.value = placeResponse ? placeResponse.url : ''
    })
  })
}

const submit = async () => {
    // User
    const userObj = {
        id: v4(),
        created_at: new Date(),
        first_name: first.value,
        last_name: last.value,
        email: email.value,
        phone: phone.value,
        is_admin: isAdmin.value,
        type: type.value.toLowerCase(),
        associated_merchant_id: null,
        associated_vendor_id: null,
        avatar_url: null,
        available_to_contact: available.value
    }
    const { error: userErr } = await supabase.from('users').insert(userObj)
}
</script>

<style scoped>

</style>