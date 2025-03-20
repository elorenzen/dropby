<template>
    <div>
      <Card style="overflow: hidden" class="ma-4">
          <template #content>
            <Tabs value="0">
              <TabList>
                  <Tab value="0">General Information</Tab>
                  <Tab value="1">Business Hours</Tab>
                  <Tab value="2">Menu</Tab>
                  <Tab value="3">Associated Users</Tab>
                  <div class="flex justify-end gap-2 ma-4">
                      <Button class="p-button-sm" size="small" type="button" label="Save Edits" @click="saveEdits" :loading="loading"></Button>
                  </div>
              </TabList>
              <TabPanels>
                  <!-- GENERAL INFORMATION SETTINGS -->
                  <TabPanel value="0">
                    <v-row>
                        <v-col cols="4">
                          <NuxtImg :src="imageUrl" alt="Image" class="w-full rounded" style="height: 60%;" />
                          <FileUpload
                            class="my-2 p-button-sm p-button-outlined"
                            mode="basic"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @upload="updateImage($event)"
                            :auto="true"
                            chooseLabel="Upload New Image"
                          />
                          <div v-if="uploading" class="card flex justify-center mt-4">
                              <ProgressSpinner class="p-progress-spinner-circle" />
                          </div>
                        </v-col>
                        <v-col cols="8">
                          <Fluid>
                            <span class="font-bold my-4 block">Vendor Information</span>
                            <div class="grid grid-cols-2 gap-4">
                                <!-- NAME -->
                                <div>
                                  <FloatLabel variant="on">
                                      <InputText id="name" v-model="vendor.vendor_name" :fluid="true" />
                                      <label for="name">Name</label>
                                  </FloatLabel>
                                </div>

                                <!-- CUISINE -->
                                <div>
                                    <FloatLabel variant="on">
                                        <MultiSelect
                                            id="cuisine"
                                            v-model="vendor.cuisine"
                                            display="chip"
                                            :options="cuisines"
                                            filter
                                            placeholder="Select Cuisine(s)"
                                            :maxSelectedLabels="3"
                                        />
                                        <label for="cuisine">Cuisine</label>
                                    </FloatLabel>
                                </div>

                                <div class="col">
                                  <FloatLabel variant="on">
                                    <div class="p-iconfield">
                                      <span class="p-inputicon pi pi-map-marker"></span>
                                      <input
                                        class="p-inputtext p-component p-filled w-full"
                                        id="address"
                                        ref="streetRef"
                                        :placeholder="vendor.formatted_address ? vendor.formatted_address : 'Enter address'"
                                      />
                                    </div>
                                    <label for="phone">Base Address</label>
                                  </FloatLabel>
                                </div>
                                <div class="col">
                                  <FloatLabel variant="on">
                                    <InputNumber id="radius" v-model="radius" suffix=" mi" fluid />
                                    <label for="radius">Service Radius</label>
                                  </FloatLabel>
                                </div>

                                <!-- DESCRIPTION -->
                                <div class="col-span-full">
                                  <FloatLabel variant="on">
                                      <Textarea id="desc" v-model="vendor.vendor_description" rows="5" />
                                      <label for="desc">Description</label>
                                  </FloatLabel>
                                </div>

                                <!-- PHONE -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-phone" />
                                        <InputText id="phone" v-model="vendor.phone" placeholder="Phone" />
                                    </IconField>
                                    <label for="phone">Phone</label>
                                  </FloatLabel>
                                </div>

                                <!-- WEBSITE -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-link" />
                                        <InputText id="website" v-model="vendor.website" placeholder="Website" />
                                    </IconField>
                                    <label for="website">Website</label>
                                  </FloatLabel>
                                </div>

                                <!-- INSTAGRAM -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-instagram" />
                                        <InputText id="ig" v-model="vendor.instagram" placeholder="Instagram" />
                                    </IconField>
                                    <label for="ig">Instagram</label>
                                  </FloatLabel>
                                </div>

                                <!-- EMAIL -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-envelope" />
                                        <InputText id="email" v-model="vendor.email" placeholder="Email" />
                                    </IconField>
                                    <label for="email">Email</label>
                                  </FloatLabel>
                                </div>
                            </div>
                          </Fluid>
                        </v-col>
                    </v-row>
                  </TabPanel>

                  <!-- BUSINESS HOURS SETTINGS -->
                  <TabPanel value="1">
                      <Fluid v-for="(day, index) in businessHours" :key="index">
                        <div class="grid grid-cols-3 gap-4">
                          <div>
                            {{ day.name }}
                          </div>
                          <div>
                            <FloatLabel variant="on">
                              <DatePicker :id="`open-${index}`" v-model="day.open" hour-format="12" timeOnly fluid @blur="setFormattedOpen($event, index)" />
                              <Label :for="`open-${index}`">{{ day.name }} Open</Label>
                            </FloatLabel>
                          </div>
                          <div>
                            <FloatLabel variant="on">
                              <DatePicker :id="`close-${index}`" v-model="day.close" hour-format="12" timeOnly fluid @blur="setFormattedClose($event, index)" />
                              <Label :for="`close-${index}`">{{ day.name }} Close</Label>
                            </FloatLabel>
                          </div>
                        </div>
                        <Divider />
                      </Fluid>
                  </TabPanel>

                  <!-- MENU SETTINGS -->
                  <TabPanel value="2">
                    <MenuTable />
                  </TabPanel>

                  <TabPanel value="3">
                      <AssociatedUsers />
                  </TabPanel>
              </TabPanels>
            </Tabs>
          </template>
      </Card>

      <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />

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
    </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid';
import { Loader } from '@googlemaps/js-api-loader'
const supabase      = useSupabaseClient()
const vendorStore   = useVendorStore()
const userStore     = useUserStore()
const user:any      = userStore.getUser
const assocId       = user[`associated_${user.type}_id`]
const vendor:any    = ref(await vendorStore.getVendorById(assocId))

const editDialog    = ref(false)
const snackbar      = ref(false)
const snacktext     = ref('')
const uploading     = ref(false)
const loading       = ref(false)

const errType       = ref()
const errMsg        = ref()
const errDialog     = ref(false)
const imageUrl      = ref(vendor.value.avatar_url ? vendor.value.avatar_url : '')
const radius        = ref(vendor.value.service_radius ? vendor.value.service_radius : 10)
const streetRef     = ref()
const baseLat       = ref()
const baseLng       = ref()
const forattedAddr  = ref()
const businessHours = ref(
  vendor.value.business_hours ?
  JSON.parse(JSON.stringify(vendor.value.business_hours)) :
  [{
    name: 'Monday',
    open: '',
    close: '',
  },
  {
    name: 'Tuesday',
    open: '',
    close: '',
  },
  {
    name: 'Wednesday',
    open: '',
    close: '',
  },
  {
    name: 'Thursday',
    open: '',
    close: '',
  },
  {
    name: 'Friday',
    open: '',
    close: '',
  },
  {
    name: 'Saturday',
    open: '',
    close: '',
  },
  {
    name: 'Sunday',
    open: '',
    close: '',
  }]
)

const cuisines    = ref([
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
    'Mediterranean',
    'Mexican',
    'Pizza',
    'Sandwich',
    'Seafood',
    'Snacks',
    'Tacos',
    'Vegan'
])

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
      baseLat.value = placeResponse.geometry.location.lat()
      baseLng.value = placeResponse.geometry.location.lng()

      forattedAddr.value = placeResponse
        ? placeResponse.formatted_address
        : ''
    })
  })
}

const saveEdits = async () => {
  loading.value = true
  const updates = {
    updated_at: new Date(),
    vendor_name: vendor.value.vendor_name,
    cuisine: vendor.value.cuisine,
    vendor_description: vendor.value.vendor_description,
    phone: vendor.value.phone,
    website: vendor.value.website,
    instagram: vendor.value.instagram,
    email: vendor.value.email,
    business_hours: businessHours.value,
    service_radius: radius.value,
    base_latitude: baseLat.value,
    base_longitude: baseLng.value,
    formatted_address: forattedAddr.value
  }

  const { error } = await supabase.from('vendors').update(updates).eq('id', vendor.value.id)
  if (!error) {
      editDialog.value = false
      snacktext.value = 'Information Updated!'
      snackbar.value = true
  } else {
    errType.value = "Settings Update(s)"
    errMsg.value = error.message
    errDialog.value = true
  }
  loading.value = false
}

const setFormattedOpen = (e: any, i: any) => {
  businessHours.value[i].open = e.value
}
const setFormattedClose = (e: any, i: any) => {
  businessHours.value[i].close = e.value
}

const updateImage = async (e: any) => {
    uploading.value = true
    const file = e.files[0]

    if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('vendor_avatars').upload(filePath, file)

            if (uploadError) {
              errType.value = 'Avatar Image Upload'
              errMsg.value = uploadError.message
              errDialog.value = true
            } else {
            const { data } = supabase.storage.from('vendor_avatars').getPublicUrl(filePath)
            if (data) {
              imageUrl.value = data.publicUrl

              const updates = {
                updated_at: new Date(),
                avatar_url: imageUrl.value,
              }

              const { error } = await supabase
                .from('vendors')
                .update(updates)
                .eq('id', vendor.value.id)
              
              if (!error) {
                snacktext.value = 'Vendor Avatar Updated!'
                snackbar.value = true
              } else {
                errType.value = 'Avatar Image Update'
                errMsg.value = error.message
                errDialog.value = true
              }
            }
        }
    }
    uploading.value = false
}
</script>