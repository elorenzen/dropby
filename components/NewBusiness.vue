<template>
    <div>
        <Fluid>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 sm:col-span-4">
                    <NuxtImg :src="businessObj.imageUrl" alt="Image" class="w-full rounded" />
                    
                    <div class="flex flex-wrap justify-center p-2 m-2">
                        <FileUpload
                            class="my-2 p-button-sm p-button-outlined"
                            mode="basic"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @select="addImage"
                            chooseLabel="Upload Image"
                            :loading="storageStore.uploading"
                        />
                    </div>
                    <div v-if="storageStore.uploading" class="card flex justify-center mt-4">
                        <ProgressSpinner class="p-progress-spinner-circle" />
                    </div>
                </div>

                <div class="col-span-12 sm:col-span-8">
                    <FloatLabel variant="on">
                        <InputText id="name" v-model="businessObj.name" :fluid="true" />
                        <label for="name">{{ altLabels[bizType].name }}</label>
                    </FloatLabel>
                    <div v-if="bizType === 'merchant'" class="my-1">
                        <FloatLabel variant="on">
                        <div class="p-iconfield">
                            <span class="p-inputicon pi pi-map-marker"></span>
                            <input
                                class="p-inputtext p-component p-filled w-full"
                                id="address"
                                ref="streetRef"
                            />
                        </div>
                        <label for="phone">Location Address</label>
                        </FloatLabel>
                    </div>
                    <div v-if="bizType === 'vendor'" class="my-1">
                        <FloatLabel variant="on">
                            <MultiSelect v-model="businessObj.cuisine" display="chip" :options="cuisines" filter />
                            <label for="cuisine">Select Cuisine(s)</label>
                        </FloatLabel>
                    </div>

                    <div class="my-1">
                        <FloatLabel variant="on">
                            <Textarea id="desc" v-model="businessObj.desc" rows="5" />
                            <label for="desc">{{ altLabels[bizType].desc }}</label>
                        </FloatLabel>
                    </div>
                </div>

                <div class="col-span-6 sm:col-span-3">
                <FloatLabel variant="on">
                    <IconField>
                        <InputIcon class="pi pi-phone" />
                        <InputMask id="business_phone" v-model="businessObj.phone" mask="(999) 999-9999" />
                    </IconField>
                    <label for="business_phone">Phone</label>
                </FloatLabel>
                </div>
                <div class="col-span-6 sm:col-span-3">
                <FloatLabel variant="on">
                    <IconField>
                        <InputIcon class="pi pi-envelope" />
                        <InputText id="business_email" v-model="businessObj.email"/>
                    </IconField>
                    <label for="business_email">Email</label>
                </FloatLabel>
                </div>
                <div class="col-span-6 sm:col-span-3">
                    <FloatLabel variant="on">
                        <IconField>
                            <InputIcon class="pi pi-link" />
                            <InputText id="website" v-model="businessObj.website"/>
                        </IconField>
                        <label for="website">Website</label>
                    </FloatLabel>
                </div>
                <div class="col-span-6 sm:col-span-3">
                <FloatLabel variant="on">
                    <IconField>
                        <InputIcon class="pi pi-instagram" />
                        <InputText id="ig" v-model="businessObj.ig" />
                    </IconField>
                    <label for="ig">Instagram</label>
                </FloatLabel>
                </div>
            </div>
        </Fluid>
        <ErrorDialog v-if="errDialog" :errType="'Image Upload'" :errMsg="errMsg" @errorClose="errDialog = false" />
    </div>
</template>

<script setup lang="ts">
import { useGooglePlacesAutocomplete } from '~/composables/useGooglePlacesAutocomplete'

const props             = defineProps(['bizType'])
const bizType:string    = props.bizType
const emit              = defineEmits(['objUpdated'])
const streetRef         = ref()
const storageStore      = useStorageStore()
const errDialog         = ref(false)
const errMsg            = ref('')

const businessObj       = reactive({
    name: '',
    desc: '',
    phone: '',
    email: '',
    website: '',
    ig: '',
    cuisine: [],
    addressComponents: [],
    coordinates: {},
    formattedAddress: '',
    addressUrl: '',
    imageUrl: 'https://ionicframework.com/docs/img/demos/card-media.png'
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
        desc: "Merchant Description (e.g. 'Brewery, restaurant, bar, etc.')",
    },
    vendor: {
        name: "Vendor Name (e.g. 'Tegridy Burger')",
        desc: "Vendor Description (e.g. 'Food truck from South Park, CO. We sell our very own Tegridy Burger®.')",
    }
})

watch(businessObj, (newVal:any) => {
    emit('objUpdated', businessObj)
})

// Initialize Google Places Autocomplete
const { initialize: initializeAutocomplete } = useGooglePlacesAutocomplete(
  streetRef,
  {
    onPlaceSelected: (place) => {
      businessObj.addressComponents = (place.addressComponents as any[]) || []
      businessObj.coordinates = place.coordinates || {}
      businessObj.formattedAddress = place.formattedAddress || ''
      businessObj.addressUrl = place.addressUrl || ''
    }
  }
)

onMounted(async () => {
    await initializeAutocomplete()
})
const addImage = async (e: any) => {
        const file = e?.files?.[0]
        
        if (file) {
            await storageStore.addImage('business_images', file, {
                onSuccess: (publicUrl) => {
                    businessObj.imageUrl = publicUrl
                },
                onError: (error) => {
                    errDialog.value = true
                    errMsg.value = error.message
                }
            })
        }
    }
</script>

<style>

</style>