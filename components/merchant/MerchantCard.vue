<template>
  <div>
    <Card style="overflow: hidden">
        <template #content>
          <v-row>
              <v-col cols="3">
                <img :src="imageUrl" alt="Image" class="w-full rounded" />
              </v-col>
                <v-col cols="9">
                  <Fluid>
                    <div class="grid grid-cols-2 gap-4">
                        <!-- NAME -->
                        <div class="font-bold mt-4 block">
                          {{ merchant.merchant_name }}
                        </div>
                        <div class="mt-2">
                            <NuxtLink class="mx-1" :to="merchant.website" target="_blank">
                              <Button severity="secondary" icon="pi pi-link" rounded text />
                            </NuxtLink>
                            <NuxtLink class="mx-1" :to="merchant.instagram" target="_blank">
                              <Button severity="secondary" icon="pi pi-instagram" rounded text />
                            </NuxtLink>
                            <NuxtLink class="mx-1" :to="`mailto:${merchant.email}`" target="_blank">
                              <Button severity="secondary" icon="pi pi-envelope" rounded text />
                            </NuxtLink>
                        </div>

                        <!-- ADDRESS -->
                        <div class="col-span-full">
                          <NuxtLink :to="merchant.address_url" target="_blank">{{ merchant.formatted_address ? merchant.formatted_address : 'No address on file' }}</NuxtLink>
                          <span class="mx-2" v-if="merchantDist > 0"><Badge :value="`${merchantDist.toFixed(2)} mi.`"></Badge></span>
                        </div>

                        <!-- DESCRIPTION -->
                        <div class="col-span-full">
                          {{ merchant.merchant_description }}
                        </div>
                    </div>
                    <div class="col-span-full">
                      <DataTable size="small" :value="businessHours">
                          <Column field="name" header=""></Column>
                          <Column field="open" header="Open"></Column>
                          <Column field="close" header="Close"></Column>
                      </DataTable>
                    </div>
                  </Fluid>
                </v-col>
            </v-row> 
        </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import haversine from 'haversine'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps(['merchant']);
const merchant = ref(props.merchant)

const store = useUserStore()

const businessHours = ref(JSON.parse(JSON.stringify((merchant.value.business_hours))))
businessHours.value = businessHours.value.map((day: any) => JSON.parse(day));

const imageUrl = ref(props.merchant.avatar_url ? props.merchant.avatar_url : '')

const streetRef = ref()
const addressFocus = ref(false)

const addressComponents = ref()
const coordinates = ref()
const formattedAddress = ref()
const addressUrl = ref()

const lat = ref(0)
const lng = ref(0)

const merchantDist = ref(0)

onMounted(async () => {
  try {
    const coordinates = store.getUserLocation
    lat.value = coordinates.lat
    lng.value =  coordinates.lng
  } catch (error) {
    alert('user denied us');
    //code if user denies location service;
  }
  await sdkInit()
  getCoords()
})

const getCoords = () => {
  const originCoords = {
    latitude: lat.value,
    longitude: lng.value
  }

  const dbMerchantCoords = JSON.parse(merchant.value.coordinates)
  const merchantCoords = {
    latitude: dbMerchantCoords.lat,
    longitude: dbMerchantCoords.lng
  }

  merchantDist.value = haversine(originCoords, merchantCoords, {unit: 'mile'})
}

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
</script>

<style lang="scss" scoped></style>
