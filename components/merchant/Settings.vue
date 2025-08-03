<template>
  <div class="min-h-screen bg-background py-12 flex flex-col items-center">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-main mb-2">Merchant Settings</h1>
        <p class="text-text-muted">Manage your business profile, hours, payments, and compliance</p>
      </div>

      <!-- Tab Navigation -->
      <Tabs value="0" class="w-full">
        <TabList class="flex space-x-1 rounded-lg p-1 mb-8">
          <Tab 
            v-for="(tab, index) in tabs" 
            :key="index"
            :value="String(index)"
            class="flex-1 px-4 py-3 text-center rounded-md transition-all duration-200"
            :class="activeTab === index 
              ? 'bg-accent text-background font-semibold shadow-sm' 
              : 'text-text-muted hover:text-text-main hover:bg-surface-light'"
          >
            <div class="flex items-center justify-center space-x-2">
              <i :class="tab.icon" class="text-lg"></i>
              <span class="hidden sm:inline">{{ tab.label }}</span>
            </div>
          </Tab>
        </TabList>

        <TabPanels style="background-color: transparent;">
          <!-- GENERAL INFORMATION TAB -->
          <TabPanel value="0" class="space-y-6">
            <div class="rounded-xl p-8 shadow-sm">
              <h2 class="text-2xl font-bold text-text-main mb-6">General Information</h2>
              
              <form class="flex flex-col lg:flex-row gap-8 items-start w-full">
                <!-- Image Upload Section -->
                <div class="w-full lg:w-1/3 flex flex-col items-center">
                  <div class="rounded-2xl overflow-hidden shadow-lg w-full mb-6 bg-surface-light">
                    <NuxtImg 
                      :src="imageUrl || '/placeholder-business.jpg'" 
                      alt="Business Image" 
                      class="w-full object-cover" 
                      style="height: 256px;" 
                    />
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

                <!-- Form Fields -->
                <div class="w-full lg:w-2/3 space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Business Name -->
                    <div>
                      <FloatLabel variant="on">
                        <InputText 
                          id="name" 
                          v-model="merchant.merchant_name" 
                          class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                        />
                        <label for="name" class="text-lg text-text-muted font-semibold">Business Name</label>
                      </FloatLabel>
                    </div>

                    <!-- Address -->
                    <div>
                      <FloatLabel variant="on">
                        <div class="p-iconfield">
                          <span class="p-inputicon pi pi-map-marker"></span>
                          <input
                            class="p-inputtext p-component p-filled w-full bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition"
                            id="address"
                            ref="streetRef"
                            :placeholder="merchant.formatted_address || 'Enter address'"
                          />
                        </div>
                        <label for="address" class="text-lg text-text-muted font-semibold">Location Address</label>
                      </FloatLabel>
                    </div>

                    <!-- Phone -->
                    <div>
                      <FloatLabel variant="on">
                        <IconField>
                          <InputIcon class="pi pi-phone" />
                          <InputText 
                            id="phone" 
                            v-model="merchant.phone" 
                            placeholder="Phone" 
                            class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                          />
                        </IconField>
                        <label for="phone" class="text-lg text-text-muted font-semibold">Phone</label>
                      </FloatLabel>
                    </div>

                    <!-- Email -->
                    <div>
                      <FloatLabel variant="on">
                        <IconField>
                          <InputIcon class="pi pi-envelope" />
                          <InputText 
                            id="email" 
                            v-model="merchant.email" 
                            placeholder="Email" 
                            class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                          />
                        </IconField>
                        <label for="email" class="text-lg text-text-muted font-semibold">Email</label>
                      </FloatLabel>
                    </div>

                    <!-- Website -->
                    <div>
                      <FloatLabel variant="on">
                        <IconField>
                          <InputIcon class="pi pi-link" />
                          <InputText 
                            id="website" 
                            v-model="merchant.website" 
                            placeholder="Website" 
                            class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                          />
                        </IconField>
                        <label for="website" class="text-lg text-text-muted font-semibold">Website</label>
                      </FloatLabel>
                    </div>

                    <!-- Instagram -->
                    <div>
                      <FloatLabel variant="on">
                        <IconField>
                          <InputIcon class="pi pi-instagram" />
                          <InputText 
                            id="ig" 
                            v-model="merchant.instagram" 
                            placeholder="Instagram" 
                            class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                          />
                        </IconField>
                        <label for="ig" class="text-lg text-text-muted font-semibold">Instagram</label>
                      </FloatLabel>
                    </div>
                  </div>

                  <!-- Description -->
                  <div>
                    <FloatLabel variant="on">
                      <Textarea 
                        id="desc" 
                        v-model="merchant.merchant_description" 
                        rows="4" 
                        class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                      />
                      <label for="desc" class="text-lg text-text-muted font-semibold">Business Description</label>
                    </FloatLabel>
                  </div>

                  <!-- Vendor Notes -->
                  <div>
                    <FloatLabel variant="on">
                      <Textarea 
                        id="notes" 
                        v-model="merchant.notes" 
                        rows="4" 
                        class="bg-background border border-surface rounded-lg px-4 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full" 
                      />
                      <label for="notes" class="text-lg text-text-muted font-semibold">Directions/Notes for Vendors</label>
                    </FloatLabel>
                  </div>

                  <!-- Preferred Vendors -->
                  <div>
                    <FloatLabel variant="on">
                      <MultiSelect
                        id="vendors"
                        v-model="merchant.preferred_vendors"
                        display="chip"
                        optionLabel="vendor_name"
                        :options="vendors"
                        filter
                        :maxSelectedLabels="3"
                        class="bg-background border border-surface rounded-lg px-2 py-3 text-lg text-text-main focus:ring-2 focus:ring-accent outline-none transition w-full"
                      />
                      <label for="vendors" class="text-lg text-text-muted font-semibold">Preferred Vendor(s)</label>
                    </FloatLabel>
                  </div>

                  <!-- Save Button -->
                  <div class="flex justify-end pt-4">
                    <Button 
                      class="bg-accent text-background rounded-full px-8 py-3 text-lg font-bold shadow-lg hover:bg-accent-dark transition" 
                      size="large" 
                      type="button" 
                      label="Save Changes" 
                      @click="saveEdits" 
                      :loading="loading"
                    />
                  </div>
                </div>
              </form>
            </div>
          </TabPanel>

          <!-- BUSINESS HOURS TAB -->
          <TabPanel value="1" class="space-y-6">
            <div class="rounded-xl p-8 shadow-sm">
              <h2 class="text-2xl font-bold text-text-main mb-6">Business Hours</h2>
              
              <div class="space-y-4">
                <div v-for="(day, index) in businessHours" :key="index" class="border-b border-surface-light pb-4 last:border-b-0">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div class="text-lg font-semibold text-text-main">{{ day.name }}</div>
                    <div>
                      <FloatLabel variant="on">
                        <DatePicker 
                          :id="`open-${index}`" 
                          v-model="day.open" 
                          hour-format="12" 
                          timeOnly 
                          fluid 
                          @blur="setFormattedOpen($event, index)" 
                        />
                        <Label :for="`open-${index}`" class="text-lg text-text-muted font-semibold">{{ day.name }} Open</Label>
                      </FloatLabel>
                    </div>
                    <div>
                      <FloatLabel variant="on">
                        <DatePicker 
                          :id="`close-${index}`" 
                          v-model="day.close" 
                          hour-format="12" 
                          timeOnly 
                          fluid 
                          @blur="setFormattedClose($event, index)" 
                        />
                        <Label :for="`close-${index}`" class="text-lg text-text-muted font-semibold">{{ day.name }} Close</Label>
                      </FloatLabel>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-6">
                <Button 
                  class="bg-accent text-background rounded-full px-8 py-3 text-lg font-bold shadow-lg hover:bg-accent-dark transition" 
                  size="large" 
                  type="button" 
                  label="Save Hours" 
                  @click="saveBusinessHours" 
                  :loading="loading"
                />
              </div>
            </div>
          </TabPanel>

          <!-- PAYMENTS & FINANCIAL TAB -->
          <TabPanel value="2" class="space-y-6">
            <div class="rounded-xl p-8 shadow-sm">
              <h2 class="text-2xl font-bold text-text-main mb-6">Payments & Financial</h2>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Payment Methods -->
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold text-text-main">Payment Methods</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 border border-surface-light rounded-lg">
                      <div class="flex items-center space-x-3">
                        <i class="pi pi-credit-card text-2xl text-accent"></i>
                        <div>
                          <p class="font-semibold text-text-main">Credit Card</p>
                          <p class="text-sm text-text-muted">**** **** **** 1234</p>
                        </div>
                      </div>
                      <Button icon="pi pi-pencil" class="p-button-text" />
                    </div>
                    
                    <Button 
                      icon="pi pi-plus" 
                      label="Add Payment Method" 
                      class="w-full p-button-outlined"
                    />
                  </div>
                </div>

                <!-- Financial Summary -->
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold text-text-main">Financial Summary</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-surface-light rounded-lg p-4">
                      <p class="text-sm text-text-muted">This Month</p>
                      <p class="text-2xl font-bold text-text-main">$12,450</p>
                    </div>
                    <div class="bg-surface-light rounded-lg p-4">
                      <p class="text-sm text-text-muted">Last Month</p>
                      <p class="text-2xl font-bold text-text-main">$11,200</p>
                    </div>
                  </div>
                  
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-text-muted">Platform Fee</span>
                      <span class="font-semibold text-text-main">5%</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-text-muted">Processing Fee</span>
                      <span class="font-semibold text-text-main">2.9% + $0.30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- COMPLIANCE & DOCUMENTS TAB -->
          <TabPanel value="3" class="space-y-6">
            <div class="rounded-xl p-8 shadow-sm">
              <h2 class="text-2xl font-bold text-text-main mb-6">Compliance & Documents</h2>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Business Documents -->
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold text-text-main">Business Documents</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 border border-surface-light rounded-lg">
                      <div class="flex items-center space-x-3">
                        <i class="pi pi-file-pdf text-2xl text-red-500"></i>
                        <div>
                          <p class="font-semibold text-text-main">Business License</p>
                          <p class="text-sm text-text-muted">Uploaded 2 months ago</p>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <Button icon="pi pi-eye" class="p-button-text" />
                        <Button icon="pi pi-download" class="p-button-text" />
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 border border-surface-light rounded-lg">
                      <div class="flex items-center space-x-3">
                        <i class="pi pi-file-pdf text-2xl text-red-500"></i>
                        <div>
                          <p class="font-semibold text-text-main">Health Permit</p>
                          <p class="text-sm text-text-muted">Uploaded 1 month ago</p>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <Button icon="pi pi-eye" class="p-button-text" />
                        <Button icon="pi pi-download" class="p-button-text" />
                      </div>
                    </div>
                    
                    <FileUpload
                      mode="basic"
                      accept=".pdf,.doc,.docx"
                      :maxFileSize="5000000"
                      chooseLabel="Upload Document"
                      class="w-full"
                    />
                  </div>
                </div>

                <!-- Compliance Status -->
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold text-text-main">Compliance Status</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div class="flex items-center space-x-3">
                        <i class="pi pi-check-circle text-2xl text-green-600"></i>
                        <div>
                          <p class="font-semibold text-text-main">Business License</p>
                          <p class="text-sm text-green-600">Valid until Dec 2024</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div class="flex items-center space-x-3">
                        <i class="pi pi-check-circle text-2xl text-green-600"></i>
                        <div>
                          <p class="font-semibold text-text-main">Health Permit</p>
                          <p class="text-sm text-green-600">Valid until Mar 2025</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div class="flex items-center space-x-3">
                        <i class="pi pi-exclamation-triangle text-2xl text-yellow-600"></i>
                        <div>
                          <p class="font-semibold text-text-main">Insurance Certificate</p>
                          <p class="text-sm text-yellow-600">Expires in 30 days</p>
                        </div>
                      </div>
                      <Button label="Renew" class="p-button-sm p-button-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    <Toast group="main" position="bottom-center" @close="onClose" />
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

// Composables
const toast = useToast()
const supabase = useSupabaseClient()
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()

// Store data
const vendors = vendorStore.getAllVendors
const user = userStore.getUser
const assocId = user?.[`associated_${user?.type}_id`]

// Reactive data
const merchant = ref(await merchantStore.getMerchantById(assocId || ''))
const activeTab = ref(0)
const uploading = ref(false)
const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref('')
const errType = ref('')
const imageUrl = ref(merchant.value?.avatar_url || '')
const streetRef = ref()

// Address autocomplete
const addressComponents = ref()
const coordinates = ref()
const formattedAddress = ref()
const addressUrl = ref()

// Business hours
const businessHours = ref(
  merchant.value?.business_hours 
    ? JSON.parse(JSON.stringify(merchant.value.business_hours)).map((day: any) => JSON.parse(day))
    : []
)

// Tab configuration
const tabs = [
  { label: 'General Information', icon: 'pi pi-info-circle' },
  { label: 'Business Hours', icon: 'pi pi-clock' },
  { label: 'Payments & Financial', icon: 'pi pi-credit-card' },
  { label: 'Compliance & Documents', icon: 'pi pi-shield-check' }
]

// Google Maps initialization
onMounted(async () => {
  await sdkInit()
})

const sdkInit = async () => {
  const config = useRuntimeConfig()
  
  try {
    // Dynamic import to avoid SSR issues
    const { Loader } = await import('@googlemaps/js-api-loader')
    
    const loader = new Loader({
      apiKey: config.public.gMapKey,
      version: 'beta',
      libraries: ['places'],
    })
    
    loader.load().then((google: any) => {
      const options = {
        componentRestrictions: { country: 'us' },
        fields: ['geometry/location', 'name', 'formatted_address', 'types'],
        strictBounds: false,
      }
      
      if (streetRef.value) {
        const autocomplete = new google.maps.places.Autocomplete(streetRef.value, options)
        autocomplete.addListener('place_changed', () => {
          const placeResponse = autocomplete.getPlace()
          const lat = placeResponse.geometry.location.lat()
          const lng = placeResponse.geometry.location.lng()

          addressComponents.value = placeResponse?.address_components || ''
          coordinates.value = placeResponse ? { lat, lng } : ''
          formattedAddress.value = placeResponse?.formatted_address || ''
          addressUrl.value = placeResponse?.url || ''
        })
      }
    })
  } catch (error) {
    console.warn('Google Maps API not available:', error)
  }
}

// Event handlers
const setFormattedOpen = (e: any, i: number) => {
  businessHours.value[i].open = e.value
}

const setFormattedClose = (e: any, i: number) => {
  businessHours.value[i].close = e.value
}

const saveEdits = async () => {
  if (!merchant.value) return
  
  loading.value = true
  
  const updates = {
    updated_at: new Date(),
    merchant_name: merchant.value.merchant_name,
    merchant_description: merchant.value.merchant_description,
    address_components: addressComponents.value || merchant.value.address_components,
    coordinates: coordinates.value || merchant.value.coordinates,
    formatted_address: formattedAddress.value || merchant.value.formatted_address,
    address_url: addressUrl.value || merchant.value.address_url,
    phone: merchant.value.phone,
    website: merchant.value.website,
    instagram: merchant.value.instagram,
    email: merchant.value.email,
    preferred_vendors: merchant.value.preferred_vendors,
  }

  const { error } = await supabase
    .from('merchants')
    .update(updates)
    .eq('id', merchant.value.id)
    
  if (!error) {
    showToast('Information Updated!', 'success')
  } else {
    errType.value = 'Settings Update'
    errMsg.value = error.message
    errDialog.value = true
  }
  
  loading.value = false
}

const saveBusinessHours = async () => {
  if (!merchant.value) return
  
  loading.value = true
  
  const updates = {
    updated_at: new Date(),
    business_hours: businessHours.value
  }

  const { error } = await supabase
    .from('merchants')
    .update(updates)
    .eq('id', merchant.value.id)
    
  if (!error) {
    showToast('Business Hours Updated!', 'success')
  } else {
    errType.value = 'Business Hours Update'
    errMsg.value = error.message
    errDialog.value = true
  }
  
  loading.value = false
}

const updateImage = async (e: any) => {
  uploading.value = true
  const file = e.files[0]

  if (file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('merchant_avatars')
      .upload(filePath, file)

    if (uploadError) {
      errType.value = 'Image Upload'
      errMsg.value = uploadError.message
      errDialog.value = true
    } else {
      const { data } = supabase.storage
        .from('merchant_avatars')
        .getPublicUrl(filePath)
        
      if (data) {
        imageUrl.value = data.publicUrl

        const updates = {
          updated_at: new Date(),
          avatar_url: imageUrl.value,
        }

        const { error } = await supabase
          .from('merchants')
          .update(updates)
          .eq('id', merchant.value?.id)
        
        if (!error) {
          showToast('Merchant Avatar Updated!', 'success')
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

const showToast = (message: string, severity: string = 'info') => {
  toast.add({
    severity: severity,
    summary: severity === 'success' ? 'Success' : severity === 'error' ? 'Error' : 'Info',
    detail: message,
    life: 3000
  })
}

const onClose = () => {
  // Toast close handler
}
</script>

<style scoped>
:deep(.p-tabpanel) {
  background: transparent !important;
}
</style>