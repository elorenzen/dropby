<template>
  <div>
    <Card style="overflow: hidden">
        <template #header>
          <v-row dense class="pa-2">
              <v-col cols="6">
                <img :src="imageUrl" />
              </v-col>
          </v-row>  
        </template>
        <template #title>
          <v-row>{{ merchant.merchant_name }}</v-row>
        </template>

        <template #subtitle>
          <v-row>
            {{ merchant.merchant_description }}
          </v-row>
        </template>
        <template #content>
          <v-row>
            <v-col cols="4">Merchant Address: </v-col>
            <v-col>
              <div>
                <div>
                  <div
                    :style="addressFocus ? 'border: 1px solid #5f819d;' : ''"
                    class="v-input__slot"

                  >
                    <div>
                      <input
                        @focus="addressFocus = !addressFocus"
                        id="input-783"
                        ref="streetRef"
                        :placeholder="merchant.formatted_address ? merchant.formatted_address : 'Enter address'"
                      />
                    </div>
                  </div>
                  <div class="v-text-field__details">
                    <div class="v-messages theme--dark">
                      <div class="v-messages__wrapper"></div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

            <v-row>
              <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2">
                <template v-slot:prepend><v-icon></v-icon></template>
                <NuxtLink :to="merchant.address_url" target="_blank">{{ merchant.formatted_address ? merchant.formatted_address : 'No address on file' }}</NuxtLink>
              </v-btn>
              <span v-if="merchantDist > 0"><Badge :value="`${merchantDist.toFixed(2)} mi.`"></Badge></span>
            </v-row>
            <v-row>
              <v-btn prepend-icon="mdi-phone" variant="plain" readonly>
                <template v-slot:prepend><v-icon></v-icon></template>
                <NuxtLink>{{ merchant.phone }}</NuxtLink>
              </v-btn>
            </v-row>
            <v-row>
              <v-btn prepend-icon="mdi-web" variant="plain">
                <template v-slot:prepend><v-icon></v-icon></template>
                <NuxtLink :to="merchant.website" target="_blank">Website</NuxtLink>
              </v-btn>
            </v-row>
            <v-row>
              <v-btn prepend-icon="mdi-instagram" variant="plain">
                <template v-slot:prepend><v-icon></v-icon></template>
                <NuxtLink :to="merchant.instagram" target="_blank">Instagram</NuxtLink>
              </v-btn>
            </v-row>
            <v-row>
              <v-btn prepend-icon="mdi-email" variant="plain">
                <template v-slot:prepend><v-icon></v-icon></template>
                <NuxtLink :to="`mailto:${merchant.email}`" target="_blank">Email</NuxtLink>
              </v-btn>
            </v-row>
        </template>
    </Card>

    <v-snackbar
      v-model="snackbar"
      timeout="6000"
    >
      {{ snacktext }}

      <template v-slot:actions>
        <v-btn
          color="#000022"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import haversine from 'haversine'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps(['merchant']);
const merchant = ref(props.merchant)

const snackbar = ref(false)
const snacktext = ref('')

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
    const locRes = await getLocationFromUser();
    lat.value = locRes.latitude
    lng.value = locRes.longitude
  } catch (error) {
    alert('user denied us');
    //code if user denies location service;
  }
  await sdkInit()
  getCoords()
})

const getLocationFromUser = () => {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position.coords);
      }, reject);
    } else {
      reject('Geolocation not supported');
    }
  });
}

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
