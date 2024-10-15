<template>
  <div>
    <Card style="overflow: hidden">
        <template #header>
            <img alt="user header" :src="merchant.avatar_url" />
        </template>
        <template #title>
          <v-row v-if="storeUser && storeUser.is_admin && storeUser.type == 'merchant'">
            <v-text-field density="compact" outlined v-model="merchant.merchant_name" placeholder="Merchant Name (e.g. 'McDonald's')"></v-text-field>
          </v-row>
        </template>

        <template #subtitle>
          <v-row v-if="storeUser && storeUser.is_admin && storeUser.type == 'merchant'">
            <v-textarea density="compact" outlined v-model="merchant.merchant_description" placeholder="Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')"></v-textarea>
          </v-row>
          <v-row v-else>
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
          <div v-if="storeUser && storeUser.is_admin && storeUser.type == 'merchant'">
            <v-row>
              <v-text-field
                prepend-icon="mdi-phone"
                density="compact"
                outlined
                v-model="merchant.phone"
                placeholder="Contact Phone"
              ></v-text-field>
            </v-row>
            <v-row>
              <v-text-field
                prepend-icon="mdi-web"
                density="compact"
                outlined
                v-model="merchant.website"
                placeholder="Website URL"
              ></v-text-field>
            </v-row>
            <v-row>
              <v-text-field
                prepend-icon="mdi-instagram"
                density="compact"
                outlined
                v-model="merchant.instagram"
                placeholder="Instagram Link (optional)"
              ></v-text-field>
            </v-row>
            <v-row>
              <v-text-field
                prepend-icon="mdi-email"
                density="compact"
                outlined
                v-model="merchant.email"
                placeholder="Contact Email"
              ></v-text-field>
            </v-row>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="editDialog = false"></Button>
                <Button type="button" label="Save" @click="saveEdits"></Button>
            </div>
          </div>

          <div v-else>
            <v-row>
              <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2">
                <template v-slot:prepend><v-icon></v-icon></template>
                <NuxtLink :to="merchant.address_url" target="_blank">{{ merchant.formatted_address ? merchant.formatted_address : 'No address on file' }}</NuxtLink>
              </v-btn>
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
          </div>
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
const supabase = useSupabaseClient()
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps(['merchant']);
const merchant = ref(props.merchant)
const store = useUserStore()
const storeUser = store.user

const editDialog = ref(false)
const snackbar = ref(false)
const snacktext = ref('')

const streetRef = ref()
const addressFocus = ref(false)

const addressComponents = ref()
const coordinates = ref()
const formattedAddress = ref()
const addressUrl = ref()

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

const saveEdits = async () => {
  const updates = {
    updated_at: new Date(),
    merchant_name: merchant.value.merchant_name,
    merchant_description: merchant.value.merchant_description,
    address_components: addressComponents ? addressComponents.value : merchant.value.address_components,
    coordinates: coordinates ? coordinates.value : merchant.value.coordinates,
    formatted_address: formattedAddress ? formattedAddress.value : merchant.value.address_components,
    address_url: addressUrl ? addressUrl.value : merchant.value.address_url,
    phone: merchant.value.phone,
    website: merchant.value.website,
    instagram: merchant.value.instagram,
    email: merchant.value.email,
  }

  const { error } = await supabase.from('merchants').update(updates).eq('id', merchant.value.id)
  if (!error) {
      editDialog.value = false
      snacktext.value = 'Information Updated!'
      snackbar.value = true
  }
}
</script>

<style lang="scss" scoped></style>
