<template>
    <Fluid>
        <div class="grid grid-cols-2 gap-4">
            <div class="col-span-full">
              <FloatLabel variant="on">
                  <InputText id="name" v-model="businessObj.name" :fluid="true" />
                  <label for="name">{{ altLabels[bizType].name }}</label>
              </FloatLabel>
            </div>

            <div v-if="bizType === 'merchant'" class="col-span-full">
                <FloatLabel variant="on">
                  <div class="p-iconfield">
                    <span class="p-inputicon pi pi-map-marker"></span>
                    <input
                      class="p-inputtext p-component p-filled"
                      id="address"
                      ref="streetRef"
                    />
                  </div>
                  <label for="phone">Location Address</label>
                </FloatLabel>
            </div>

            <div class="col-span-full">
              <FloatLabel variant="on">
                  <Textarea id="desc" v-model="businessObj.desc" rows="5" />
                  <label for="desc">{{ altLabels[bizType].desc }}</label>
              </FloatLabel>
            </div>

            <div>
              <FloatLabel variant="on">
                <IconField>
                    <InputIcon class="pi pi-phone" />
                    <InputMask id="business_phone" v-model="businessObj.phone" mask="(999) 999-9999" />
                </IconField>
                <label for="business_phone">Phone</label>
              </FloatLabel>
            </div>
            <div>
              <FloatLabel variant="on">
                <IconField>
                    <InputIcon class="pi pi-envelope" />
                    <InputText id="business_email" v-model="businessObj.email"/>
                </IconField>
                <label for="business_email">Email</label>
              </FloatLabel>
            </div>
            <div>
                <FloatLabel variant="on">
                    <IconField>
                        <InputIcon class="pi pi-link" />
                        <InputText id="website" v-model="businessObj.website"/>
                    </IconField>
                    <label for="website">Website</label>
                </FloatLabel>
            </div>
            <div>
              <FloatLabel variant="on">
                <IconField>
                    <InputIcon class="pi pi-instagram" />
                    <InputText id="ig" v-model="businessObj.ig" />
                </IconField>
                <label for="ig">Instagram</label>
              </FloatLabel>
            </div>
            <div v-if="bizType === 'vendor'" class="col-span-full">
                <FloatLabel variant="on">
                    <MultiSelect v-model="businessObj.cuisine" display="chip" :options="cuisines" filter />
                    <label for="cuisine">Select Cuisine(s)</label>
                </FloatLabel>
            </div>
        </div>
    </Fluid>
</template>

<script setup lang="ts">
import { Loader } from '@googlemaps/js-api-loader'

const props             = defineProps(['bizType'])
const bizType:string    = props.bizType
const emit              = defineEmits(['objUpdated'])
const streetRef         = ref()
const addressComponents = ref()
const coordinates       = ref()
const formattedAddress  = ref()
const addressUrl        = ref()
const businessObj       = reactive({
    name: '',
    desc: '',
    phone: '',
    email: '',
    website: '',
    ig: '',
    cuisine: []
})

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
const altLabels = ref({
    merchant: {
        name: "Merchant Name (e.g. 'McDonald's')",
        desc: "Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')",
    },
    vendor: {
        name: "Vendor Name (e.g. 'Tegridy Burger')",
        desc: "Vendor Desciption (e.g. 'Food truck from South Park, CO. We sell our very own Tegridy Burger®.')",
    }
})

watch(businessObj, (newVal:any) => {
    emit('objUpdated', businessObj)
})

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
  loader.load().then((google:any) => {
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
</script>

<style>

</style>