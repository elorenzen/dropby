<template>
  <div class="min-h-screen bg-background py-12 flex flex-col items-center">
    <div class="w-full max-w-5xl bg-white/5 backdrop-blur rounded-3xl shadow-xl p-10 flex flex-col gap-12">
      <Tabs value="0">
        <TabList>
          <Tab value="0">General Information</Tab>
          <Tab value="1">Business Hours</Tab>
          <Tab value="2">Menu</Tab>
          <Tab value="3">Associated Users</Tab>
        </TabList>
        <TabPanels>
          <!-- GENERAL INFORMATION SETTINGS -->
          <TabPanel value="0">
            <form class="flex flex-col md:flex-row gap-12 items-start w-full relative">
              <div class="w-full md:w-1/3 flex flex-col items-center gap-6">
                <div class="rounded-2xl overflow-hidden shadow-lg w-full mb-2">
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
              <div class="w-full md:w-2/3 relative flex flex-col gap-8">
                <span class="text-3xl font-extrabold mb-2 block text-accent">Vendor Information</span>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- NAME -->
                  <div>
                    <FloatLabel variant="on">
                      <InputText id="name" v-model="vendor.vendor_name" class="bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      <label for="name" class="text-lg text-text-muted font-semibold">Name</label>
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
                        class="bg-white/10 border-none rounded-2xl px-2 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted"
                      />
                      <label for="cuisine" class="text-lg text-text-muted font-semibold">Cuisine</label>
                    </FloatLabel>
                  </div>
                  <!-- ADDRESS -->
                  <div class="md:col-span-2">
                    <FloatLabel variant="on">
                      <div class="p-iconfield">
                        <span class="p-inputicon pi pi-map-marker"></span>
                        <input
                          class="p-inputtext p-component p-filled w-full bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition placeholder:text-text-muted"
                          id="address"
                          ref="streetRef"
                          :placeholder="vendor.formatted_address ? vendor.formatted_address : 'Enter address'"
                        />
                      </div>
                      <label for="address" class="text-lg text-text-muted font-semibold">Base Address</label>
                    </FloatLabel>
                  </div>
                  <!-- RADIUS -->
                  <div>
                    <FloatLabel variant="on">
                      <InputNumber id="radius" v-model="radius" suffix=" mi" class="bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      <label for="radius" class="text-lg text-text-muted font-semibold">Service Radius</label>
                    </FloatLabel>
                  </div>
                  <!-- DESCRIPTION -->
                  <div class="md:col-span-2">
                    <FloatLabel variant="on">
                      <Textarea id="desc" v-model="vendor.vendor_description" rows="5" class="bg-white/10 border-none rounded-2xl px-4 py-3 min-h-[3rem] text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      <label for="desc" class="text-lg text-text-muted font-semibold">Description</label>
                    </FloatLabel>
                  </div>
                  <!-- PHONE -->
                  <div>
                    <FloatLabel variant="on">
                      <IconField>
                        <InputIcon class="pi pi-phone" />
                        <InputText id="phone" v-model="vendor.phone" placeholder="Phone" class="bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      </IconField>
                      <label for="phone" class="text-lg text-text-muted font-semibold">Phone</label>
                    </FloatLabel>
                  </div>
                  <!-- WEBSITE -->
                  <div>
                    <FloatLabel variant="on">
                      <IconField>
                        <InputIcon class="pi pi-link" />
                        <InputText id="website" v-model="vendor.website" placeholder="Website" class="bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      </IconField>
                      <label for="website" class="text-lg text-text-muted font-semibold">Website</label>
                    </FloatLabel>
                  </div>
                  <!-- INSTAGRAM -->
                  <div>
                    <FloatLabel variant="on">
                      <IconField>
                        <InputIcon class="pi pi-instagram" />
                        <InputText id="ig" v-model="vendor.instagram" placeholder="Instagram" class="bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      </IconField>
                      <label for="ig" class="text-lg text-text-muted font-semibold">Instagram</label>
                    </FloatLabel>
                  </div>
                  <!-- EMAIL -->
                  <div>
                    <FloatLabel variant="on">
                      <IconField>
                        <InputIcon class="pi pi-envelope" />
                        <InputText id="email" v-model="vendor.email" placeholder="Email" class="bg-white/10 border-none rounded-2xl px-4 h-12 text-lg text-text-main focus:ring-2 focus:ring-accent shadow-none outline-none transition w-full placeholder:text-text-muted" />
                      </IconField>
                      <label for="email" class="text-lg text-text-muted font-semibold">Email</label>
                    </FloatLabel>
                  </div>
                </div>
                <div class="flex justify-end mt-8">
                  <Button class="bg-gradient-to-r from-orange-400 to-accent text-background rounded-full px-10 py-3 text-lg font-bold shadow-lg hover:from-orange-300 hover:to-accent-dark transition fixed md:static bottom-8 right-8 md:bottom-auto md:right-auto w-full md:w-auto z-10" size="large" type="button" label="Save Edits" @click="saveEdits" :loading="loading"></Button>
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
          <TabPanel value="2">
            <MenuTable />
          </TabPanel>
          <TabPanel value="3">
            <AssociatedUsers />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
      <Toast group="main" position="bottom-center" @close="onClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid';
import { Loader } from '@googlemaps/js-api-loader'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const supabase      = useSupabaseClient()
const vendorStore   = useVendorStore()
const userStore     = useUserStore()
const user:any      = userStore.getUser
const assocId       = user[`associated_${user.type}_id`]
const vendor:any    = ref(await vendorStore.getVendorById(assocId))

const editDialog    = ref(false)
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
      toast.add({ severity: 'success', summary: 'Success', detail: 'Information Updated!', group: 'main', life: 6000 })
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
    }
}
</script>