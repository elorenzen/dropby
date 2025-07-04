<template>
  <div class="min-h-screen bg-background py-12 flex flex-col items-center">
    <Tabs value="0" class="w-full max-w-5xl">
      <TabList>
        <Tab value="0">General Information</Tab>
        <Tab value="1">Business Hours</Tab>
        <Tab value="3">Associated Users</Tab>
      </TabList>
      <TabPanels>
        <!-- GENERAL INFORMATION SETTINGS -->
        <TabPanel value="0">
          <form class="flex flex-col md:flex-row gap-12 items-start w-full">
            <div class="w-full md:w-1/3 flex flex-col items-center">
              <div class="rounded-2xl overflow-hidden shadow-lg w-full mb-6">
                <NuxtImg :src="imageUrl" alt="Image" class="w-full object-cover" style="height: 256px;" />
              </div>
              <FileUpload
                class="my-2"
                mode="basic"
                accept="image/*"
                :maxFileSize="1000000"
                @upload="updateImage($event)"
                :auto="true"
                chooseLabel="Upload New Image"
              />
              <div v-if="uploading" class="flex justify-center mt-4">
                <ProgressSpinner class="p-progress-spinner-circle" />
              </div>
            </div>
            <div class="w-full md:w-2/3 relative">
              <span class="text-2xl font-extrabold mb-6 block text-accent">Merchant Information</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- NAME -->
                <div>
                  <FloatLabel variant="on">
                    <InputText id="name" v-model="merchant.merchant_name" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    <label for="name" class="text-lg text-text-muted font-semibold">Name</label>
                  </FloatLabel>
                </div>
                <!-- ADDRESS -->
                <div>
                  <FloatLabel variant="on">
                    <div class="p-iconfield">
                      <span class="p-inputicon pi pi-map-marker"></span>
                      <input
                        class="p-inputtext p-component p-filled w-full bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition"
                        id="address"
                        ref="streetRef"
                        :placeholder="merchant.formatted_address ? merchant.formatted_address : 'Enter address'"
                      />
                    </div>
                    <label for="address" class="text-lg text-text-muted font-semibold">Location Address</label>
                  </FloatLabel>
                </div>
                <!-- DESCRIPTION -->
                <div class="md:col-span-2">
                  <FloatLabel variant="on">
                    <Textarea id="desc" v-model="merchant.merchant_description" rows="5" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    <label for="desc" class="text-lg text-text-muted font-semibold">Description</label>
                  </FloatLabel>
                </div>
                <!-- PHONE -->
                <div>
                  <FloatLabel variant="on">
                    <IconField>
                      <InputIcon class="pi pi-phone" />
                      <InputText id="phone" v-model="merchant.phone" placeholder="Phone" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    </IconField>
                    <label for="phone" class="text-lg text-text-muted font-semibold">Phone</label>
                  </FloatLabel>
                </div>
                <!-- WEBSITE -->
                <div>
                  <FloatLabel variant="on">
                    <IconField>
                      <InputIcon class="pi pi-link" />
                      <InputText id="website" v-model="merchant.website" placeholder="Website" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    </IconField>
                    <label for="website" class="text-lg text-text-muted font-semibold">Website</label>
                  </FloatLabel>
                </div>
                <!-- INSTAGRAM -->
                <div>
                  <FloatLabel variant="on">
                    <IconField>
                      <InputIcon class="pi pi-instagram" />
                      <InputText id="ig" v-model="merchant.instagram" placeholder="Instagram" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    </IconField>
                    <label for="ig" class="text-lg text-text-muted font-semibold">Instagram</label>
                  </FloatLabel>
                </div>
                <!-- EMAIL -->
                <div>
                  <FloatLabel variant="on">
                    <IconField>
                      <InputIcon class="pi pi-envelope" />
                      <InputText id="email" v-model="merchant.email" placeholder="Email" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    </IconField>
                    <label for="email" class="text-lg text-text-muted font-semibold">Email</label>
                  </FloatLabel>
                </div>
                <!-- VENDOR NOTES -->
                <div class="md:col-span-2">
                  <FloatLabel variant="on">
                    <Textarea id="notes" v-model="merchant.notes" rows="5" class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" />
                    <label for="notes" class="text-lg text-text-muted font-semibold">Directions/Notes for Vendors</label>
                  </FloatLabel>
                </div>
                <!-- PREFERRED VENDOR(S) -->
                <div class="md:col-span-2">
                  <FloatLabel variant="on">
                    <MultiSelect
                      id="cuisine"
                      v-model="merchant.preferred_vendors"
                      display="chip"
                      optionLabel="vendor_name"
                      :options="vendors"
                      filter
                      :maxSelectedLabels="3"
                      class="bg-background border border-surface rounded-lg px-2 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full"
                    />
                    <label for="cuisine" class="text-lg text-text-muted font-semibold">Preferred Vendor(s)</label>
                  </FloatLabel>
                </div>
              </div>
              <div class="flex justify-end mt-8">
                <Button class="bg-accent text-background rounded-full px-8 py-3 text-lg font-bold shadow-lg hover:bg-accent-dark transition" size="large" type="button" label="Save Edits" @click="saveEdits" :loading="loading"></Button>
              </div>
            </div>
          </form>
        </TabPanel>
        <!-- BUSINESS HOURS SETTINGS -->
        <TabPanel value="1">
          <Fluid v-for="(day, index) in businessHours" :key="index">
            <div class="grid grid-cols-3 gap-8">
              <div class="text-lg font-semibold text-text-main">{{ day.name }}</div>
              <div>
                <FloatLabel variant="on">
                  <DatePicker :id="`open-${index}`" v-model="day.open" hour-format="12" timeOnly fluid @blur="setFormattedOpen($event, index)" />
                  <Label :for="`open-${index}`" class="text-lg text-text-muted font-semibold">{{ day.name }} Open</Label>
                </FloatLabel>
              </div>
              <div>
                <FloatLabel variant="on">
                  <DatePicker :id="`close-${index}`" v-model="day.close" hour-format="12" timeOnly fluid @blur="setFormattedClose($event, index)" />
                  <Label :for="`close-${index}`" class="text-lg text-text-muted font-semibold">{{ day.name }} Close</Label>
                </FloatLabel>
              </div>
            </div>
            <Divider />
          </Fluid>
        </TabPanel>
        <TabPanel value="3">
          <AssociatedUsers />
        </TabPanel>
      </TabPanels>
    </Tabs>
    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    <Toast group="main" position="bottom-center" @close="onClose" />
  </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid';
import { Loader } from '@googlemaps/js-api-loader'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const supabase          = useSupabaseClient()
const merchantStore     = useMerchantStore()
const vendorStore       = useVendorStore()
const userStore         = useUserStore()
const vendors           = vendorStore.getAllVendors
const user:any          = userStore.getUser
const assocId           = user[`associated_${user.type}_id`]

const merchant:any      = ref(await merchantStore.getMerchantById(assocId))
const editDialog        = ref(false)
const snackbar          = ref(false)
const snacktext         = ref('')
const uploading         = ref(false)
const loading           = ref(false)

const errDialog         = ref(false)
const errMsg            = ref()
const errType           = ref()

const imageUrl          = ref(merchant.value.avatar_url ? merchant.value.avatar_url : '')
const streetRef         = ref()
const addressFocus      = ref(false)

const addressComponents = ref()
const coordinates       = ref()
const formattedAddress  = ref()
const addressUrl        = ref()

const businessHours     = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
businessHours.value     = businessHours.value.map((day: any) => JSON.parse(day));

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

const setFormattedOpen = (e: any, i: any) => {
  businessHours.value[i].open = e.value
}
const setFormattedClose = (e: any, i: any) => {
  businessHours.value[i].close = e.value
}

const saveEdits = async () => {
  loading.value = true
  const updates = {
    updated_at: new Date(),
    merchant_name: merchant.value.merchant_name,
    merchant_description: merchant.value.merchant_description,
    address_components: addressComponents ? addressComponents.value : merchant.value.address_components,
    coordinates: coordinates ? coordinates.value : merchant.value.coordinates,
    formatted_address: formattedAddress ? formattedAddress.value : merchant.value.formatted_address,
    address_url: addressUrl ? addressUrl.value : merchant.value.address_url,
    phone: merchant.value.phone,
    website: merchant.value.website,
    instagram: merchant.value.instagram,
    email: merchant.value.email,
    preferred_vendors: merchant.value.preferred_vendors,
    business_hours: businessHours.value
  }

  const { error } = await supabase.from('merchants').update(updates).eq('id', merchant.value.id)
  if (!error) {
      editDialog.value = false
      snacktext.value = 'Information Updated!'
      snackbar.value = true
  } else {
    errType.value = 'Settings Update'
  }
  loading.value = false
}

const updateImage = async (e) => {
    uploading.value = true
    const file = e.files[0]

    if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('merchant_avatars').upload(filePath, file)

        if (uploadError) {
          errType.value = 'Image Upload'
          errMsg.value = uploadError.message
          errDialog.value = true
        }
        else {
            const { data } = supabase.storage.from('merchant_avatars').getPublicUrl(filePath)
            if (data) {
              imageUrl.value = data.publicUrl

              const updates = {
                updated_at: new Date(),
                avatar_url: imageUrl.value,
              }

              const { error } = await supabase
                .from('merchants')
                .update(updates)
                .eq('id', merchant.value.id)
              
              if (!error) {
                snacktext.value = 'Merchant Avatar Updated!'
                snackbar.value = true
              } else {
                errType.value = 'Image Upload'
                errMsg.value = error.message
                errDialog.value = true
              }
            }
        }
    }
    uploading.value = false
}
</script>