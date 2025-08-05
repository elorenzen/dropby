<template>
  <div class="min-h-screen" style="background: var(--surface-ground); color: var(--text-color);">
    <!-- Header -->
    <div class="border-b px-8 py-6" style="border-color: var(--surface-border);">
      <h1 class="text-3xl font-bold mb-1" style="color: var(--text-color);">Merchant Settings</h1>
      <p class="text-sm" style="color: var(--text-color-secondary);">Manage your business profile, hours, payments, and compliance</p>
    </div>

    <div class="flex">
      <!-- Sidebar Navigation -->
      <div class="w-64 border-r min-h-screen" style="border-color: var(--surface-border);">
        <nav class="p-6">
          <ul class="space-y-2">
            <li v-for="(tab, index) in tabs" :key="index">
              <button
                @click="activeTab = index"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left"
                :class="activeTab === index 
                  ? 'text-white' 
                  : 'hover:text-white hover:bg-opacity-80'"
                :style="activeTab === index 
                  ? 'background: var(--primary-color); color: var(--primary-color-text);' 
                  : 'color: var(--text-color-secondary); background: transparent;'"
              >
                <i :class="tab.icon" class="text-lg"></i>
                <span class="font-medium">{{ tab.label }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-8">
        <!-- GENERAL INFORMATION TAB -->
        <div v-if="activeTab === 0" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--text-color);">General Information</h2>
          
          <div class="flex gap-8">
            <!-- Image Upload Section -->
            <div class="w-1/3">
              <div class="bg-white rounded-lg p-4 mb-4">
                <NuxtImg 
                  :src="imageUrl || '/placeholder-business.jpg'" 
                  alt="Business Image" 
                  class="w-full h-64 object-cover rounded-lg" 
                />
              </div>
              <FileUpload
                ref="fileUpload"
                mode="basic"
                accept="image/*"
                :maxFileSize="1000000"
                @upload="updateImage($event)"
                :auto="true"
                chooseLabel="Upload New Image"
                class="hidden"
              />
              <div v-if="uploading" class="flex justify-center mt-4">
                <ProgressSpinner />
              </div>
            </div>

            <!-- Form Fields -->
            <div class="w-2/3 space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <!-- Business Name -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Business Name</label>
                  <InputText 
                    v-model="merchant.merchant_name" 
                    class="w-full rounded-lg px-4 py-3 focus:ring-2" 
                    style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                    placeholder="Enter business name"
                  />
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Location Address</label>
                  <div class="relative">
                    <i class="pi pi-map-marker absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-color-secondary);"></i>
                    <input
                      ref="streetRef"
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2"
                      style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                      :placeholder="merchant.formatted_address || 'Enter address'"
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Phone</label>
                  <div class="relative">
                    <i class="pi pi-phone absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-color-secondary);"></i>
                    <InputText 
                      v-model="merchant.phone" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Email</label>
                  <div class="relative">
                    <i class="pi pi-envelope absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-color-secondary);"></i>
                    <InputText 
                      v-model="merchant.email" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <!-- Website -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Website</label>
                  <div class="relative">
                    <i class="pi pi-link absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-color-secondary);"></i>
                    <InputText 
                      v-model="merchant.website" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                      placeholder="Website URL"
                    />
                  </div>
                </div>

                <!-- Instagram -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Instagram</label>
                  <div class="relative">
                    <i class="pi pi-instagram absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-color-secondary);"></i>
                    <InputText 
                      v-model="merchant.instagram" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                      placeholder="Instagram handle"
                    />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Business Description</label>
                <Textarea 
                  v-model="merchant.merchant_description" 
                  rows="4" 
                  class="w-full rounded-lg px-4 py-3 focus:ring-2" 
                  style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                  placeholder="Describe your business..."
                />
              </div>

              <!-- Vendor Notes -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Directions/Notes for Vendors</label>
                <Textarea 
                  v-model="merchant.notes" 
                  rows="4" 
                  class="w-full rounded-lg px-4 py-3 focus:ring-2" 
                  style="background: var(--surface-card); border-color: var(--surface-border); color: var(--text-color);"
                  placeholder="Instructions for vendors..."
                />
              </div>

              <!-- Preferred Vendors -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--text-color-secondary);">Preferred Vendor(s)</label>
                <MultiSelect
                  v-model="merchant.preferred_vendors"
                  :options="vendors"
                  optionLabel="vendor_name"
                  display="chip"
                  filter
                  :maxSelectedLabels="3"
                  class="w-full"
                  placeholder="Select preferred vendors"
                />
              </div>

              <!-- Save Button -->
              <div class="flex justify-end pt-6">
                <Button 
                  class="px-8 py-3 font-semibold rounded-lg" 
                  style="background: var(--primary-color); border-color: var(--primary-color); color: var(--primary-color-text);"
                  label="Update Profile" 
                  @click="saveEdits" 
                  :loading="loading"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- BUSINESS HOURS TAB -->
        <div v-if="activeTab === 1" class="space-y-6">
          <h2 class="text-2xl font-bold text-text-main mb-6">Business Hours</h2>
          
          <div class="space-y-4">
            <div v-for="(day, index) in businessHours" :key="index" class="border-b border-surface-light pb-4 last:border-b-0">
              <div class="grid grid-cols-3 gap-6 items-center">
                <div class="text-lg font-semibold text-text-main">{{ day.name }}</div>
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">{{ day.name }} Open</label>
                  <Calendar 
                    v-model="day.open" 
                    timeOnly 
                    hourFormat="12"
                    class="w-full"
                    :showIcon="false"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">{{ day.name }} Close</label>
                  <Calendar 
                    v-model="day.close" 
                    timeOnly 
                    hourFormat="12"
                    class="w-full"
                    :showIcon="false"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-6">
            <Button 
              class="bg-accent text-background border-accent hover:bg-accent-dark px-8 py-3 font-semibold rounded-lg" 
              label="Save Hours" 
              @click="saveBusinessHours" 
              :loading="loading"
            />
          </div>
        </div>

        <!-- PAYMENTS & FINANCIAL TAB -->
        <div v-if="activeTab === 2" class="space-y-6">
          <h2 class="text-2xl font-bold text-text-main mb-6">Payments & Financial</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Payment Methods -->
            <div class="space-y-6">
              <h3 class="text-xl font-semibold text-text-main">Payment Methods</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border border-surface-light rounded-lg bg-surface-light">
                  <div class="flex items-center space-x-3">
                    <i class="pi pi-credit-card text-2xl text-accent"></i>
                    <div>
                      <p class="font-semibold text-text-main">Credit Card</p>
                      <p class="text-sm text-text-muted">**** **** **** 1234</p>
                    </div>
                  </div>
                  <Button icon="pi pi-pencil" class="p-button-text text-text-muted" />
                </div>
                
                <Button 
                  icon="pi pi-plus" 
                  label="Add Payment Method" 
                  class="w-full p-button-outlined border-surface text-text-muted"
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

        <!-- COMPLIANCE & DOCUMENTS TAB -->
        <div v-if="activeTab === 3" class="space-y-6">
          <h2 class="text-2xl font-bold text-text-main mb-6">Compliance & Documents</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Business Documents -->
            <div class="space-y-6">
              <h3 class="text-xl font-semibold text-text-main">Business Documents</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border border-surface-light rounded-lg bg-surface-light">
                  <div class="flex items-center space-x-3">
                    <i class="pi pi-file-pdf text-2xl text-red-500"></i>
                    <div>
                      <p class="font-semibold text-text-main">Business License</p>
                      <p class="text-sm text-text-muted">Uploaded 2 months ago</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <Button icon="pi pi-eye" class="p-button-text text-text-muted" />
                    <Button icon="pi pi-download" class="p-button-text text-text-muted" />
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border border-surface-light rounded-lg bg-surface-light">
                  <div class="flex items-center space-x-3">
                    <i class="pi pi-file-pdf text-2xl text-red-500"></i>
                    <div>
                      <p class="font-semibold text-text-main">Health Permit</p>
                      <p class="text-sm text-text-muted">Uploaded 1 month ago</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <Button icon="pi pi-eye" class="p-button-text text-text-muted" />
                    <Button icon="pi pi-download" class="p-button-text text-text-muted" />
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

        <!-- USER MANAGEMENT TAB -->
        <div v-if="activeTab === 4" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--text-color);">User Management</h2>
          <AssociatedUsers />
        </div>
      </div>
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
  { label: 'Compliance & Documents', icon: 'pi pi-file-pdf' },
  { label: 'User Management', icon: 'pi pi-users' }
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
:deep(.p-calendar) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-calendar input) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-multiselect) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-multiselect-label) {
  color: var(--text-color) !important;
}

:deep(.p-multiselect-trigger) {
  color: var(--text-color-secondary) !important;
}

:deep(.p-dropdown) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-label) {
  color: var(--text-color) !important;
}

:deep(.p-dropdown-trigger) {
  color: var(--text-color-secondary) !important;
}

:deep(.p-fileupload) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
}

:deep(.p-fileupload-choose) {
  background: var(--surface-overlay) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-fileupload-choose:hover) {
  background: var(--surface-section) !important;
}

:deep(.p-toast) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
}

:deep(.p-toast-message) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}
</style>