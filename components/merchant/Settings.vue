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
          
          <!-- Top Row: Payment Methods and Financial Summary -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Payment Methods -->
            <SettingsPaymentMethods :stripeCustomerId="merchant.stripe_customer_id" />

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

          <!-- Current Subscription Plan Section -->
          <div v-if="hasActiveSubscription" class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-text-main">Current Subscription Plan</h3>
                <Button
                  label="Change Plan"
                  icon="pi pi-arrow-right"
                  class="p-button-outlined"
                  @click="openSubscriptionModal"
                />
              </div>
              
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <i class="pi pi-star text-primary-600 dark:text-primary-400 text-xl"></i>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-text-main capitalize">
                    {{ getCurrentPlanName() }}
                  </h4>
                  <p class="text-text-muted">
                    ${{ getCurrentPlanPrice() }}/month
                  </p>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <i class="pi pi-check-circle mr-1"></i>
                      Active
                    </span>
                    <span v-if="currentSubscription?.next_billing_date" class="text-xs text-text-muted">
                      Next billing: {{ formatDate(currentSubscription.next_billing_date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Middle Row: Event Pricing Configuration and Pricing Guide -->
          <div v-if="hasActiveSubscription" class="space-y-8">
              <!-- Payment History Section -->
              <PaymentHistory :merchantId="merchant.id" />
          </div>

          <!-- Bottom Row: Subscription Status -->
          <div v-if="!hasActiveSubscription" class="mb-8">
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-star text-xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-semibold">Upgrade Your Plan</h3>
                  <p class="text-orange-100">Get unlimited events and premium features</p>
                </div>
              </div>
              <p class="text-orange-100 mb-4">
                You're currently on the free plan. Upgrade to unlock unlimited events, advanced analytics, and priority support.
              </p>
              <Button
                label="View Plans"
                icon="pi pi-arrow-right"
                class="bg-white text-orange-600 hover:bg-orange-50"
                @click="openSubscriptionModal"
              />
            </div>
          </div>
        </div>

        <!-- Subscription Plans Section (shown when no active subscription) -->
        <div v-if="!hasActiveSubscription" class="mt-8">
          <SubscriptionPlans 
            :userTypeProp="'merchant'"
            :currentPlanId="currentSubscription?.plan_type || 'free'"
            :loading="subscriptionLoading"
            @plan-selected="handlePlanSelection" 
          />
        </div>

        <!-- Subscription Plans Modal -->
        <Dialog
          :visible="showSubscriptionPlans"
          @update:visible="showSubscriptionPlans = $event"
          modal
          header="Change Subscription Plan"
          :style="{ width: '90vw', maxWidth: '800px' }"
          :closable="true"
          :dismissable-mask="true"
        >
          <SubscriptionPlans 
            :userTypeProp="'merchant'"
            :currentPlanId="currentSubscription?.plan_type || 'free'"
            :loading="subscriptionLoading"
            @plan-selected="handlePlanSelection" 
          />
        </Dialog>

        <!-- COMPLIANCE & DOCUMENTS TAB -->
        <div v-if="activeTab === 3" class="space-y-6">
            <ComplianceUpload 
              :business-id="merchant.id" 
              business-type="merchant" 
            />
        </div>

        <!-- USER MANAGEMENT TAB -->
        <div v-if="activeTab === 4" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--text-color);">User Management</h2>
          <AssociatedUsers />
        </div>
      </div>
      
      <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
      <Toast group="main" position="bottom-center" @close="onClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

const route = useRoute()
const toast = useToast()
const supabase = useSupabaseClient()
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()
const { currentUser } = useAuth()

// Store data
const vendors = vendorStore.getAllVendors
const user = userStore.getUser
const assocId = user?.[`associated_${user?.type}_id`]

// Reactive data
const merchant = ref(await merchantStore.getMerchantById(assocId || ''))
const activeTab = ref(route.query.activeTab ? parseInt(route.query.activeTab as string) : 0)
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
// Subscription status
const hasActiveSubscription = ref(false)
const currentSubscription = ref<any>(null)

// Payment settings state
const paymentSettings = ref({
  seatingCapacity: merchant.value?.seating_capacity || 100,
  defaultEventValue: merchant.value?.default_event_value || 350,
  customPricing: merchant.value?.custom_event_pricing || false,
  minimumEventValue: merchant.value?.minimum_event_value || null,
  maximumEventValue: merchant.value?.maximum_event_value || null
})

// UI state
const saving = ref(false)
const errors = ref<Record<string, string>>({})
const showSubscriptionPlans = ref(false)
const subscriptionLoading = ref(false)


// Google Maps initialization
onMounted(async () => {
  await sdkInit()
  await checkSubscriptionStatus()
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

const savePaymentSettings = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    const updates = {
      seating_capacity: paymentSettings.value.seatingCapacity,
      default_event_value: paymentSettings.value.defaultEventValue,
      custom_event_pricing: paymentSettings.value.customPricing,
      minimum_event_value: paymentSettings.value.minimumEventValue,
      maximum_event_value: paymentSettings.value.maximumEventValue,
      updated_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('merchants')
      .update(updates as any)
      .eq('id', merchant.value?.id as string)
    
    if (error) {
      throw error
    }
    
    // Update local merchant data
    Object.assign(merchant.value, updates)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Payment settings updated successfully!',
      group: 'main',
      life: 3000
    })
    
  } catch (error: any) {
    console.error('Error saving payment settings:', error)
    errType.value = 'Payment Settings Update'
    errMsg.value = error.message || 'Failed to save payment settings'
    errDialog.value = true
  } finally {
    saving.value = false
  }
}

const openSubscriptionModal = () => {
  showSubscriptionPlans.value = true
}

// Check subscription status
const checkSubscriptionStatus = async () => {
  if (!currentUser.value) return

  try {
    const merchantId = merchant.value?.id as string
    
    // Check for business subscription (not user subscription)
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', merchantId)
      .eq('business_type', 'merchant')
      .eq('status', 'active')
      .single()

    currentSubscription.value = subscriptionData
    hasActiveSubscription.value = !!subscriptionData
  } catch (error) {
    console.error('Error checking subscription status:', error)
    hasActiveSubscription.value = false
  }
}

// Calculate default event value based on seating capacity
const calculateDefaultEventValue = (capacity: number): number => {
  if (!capacity || capacity <= 0) return 100
  if (capacity <= 25) return 100
  if (capacity <= 50) return 150
  if (capacity <= 100) return 300
  if (capacity <= 300) return 600
  if (capacity <= 500) return 1200
  return 2000
}

// Watch for seating capacity changes and update default event value
watch(() => paymentSettings.value.seatingCapacity, (newCapacity: number) => {
  if (!paymentSettings.value.customPricing) {
    paymentSettings.value.defaultEventValue = calculateDefaultEventValue(newCapacity)
  }
})

// Validate form
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!paymentSettings.value.seatingCapacity || paymentSettings.value.seatingCapacity < 1) {
    errors.value.seatingCapacity = 'Seating capacity must be at least 1'
  }
  
  if (paymentSettings.value.customPricing) {
    if (!paymentSettings.value.defaultEventValue || paymentSettings.value.defaultEventValue < 0) {
      errors.value.defaultEventValue = 'Default event value must be a positive number'
    }
  }
  
  if (paymentSettings.value.minimumEventValue && paymentSettings.value.maximumEventValue) {
    if (paymentSettings.value.minimumEventValue > paymentSettings.value.maximumEventValue) {
      errors.value.minimumEventValue = 'Minimum value cannot be greater than maximum value'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// Handle plan selection
const handlePlanSelection = async (plan: { id: string; name: string; price: number; description: string; features: string[]; buttonText: string; featured: boolean; stripePriceId: string; paymentData?: any }) => {
  console.log('Plan selected:', plan)
  
  // If plan has payment data, it means payment was completed
  if (plan.paymentData) {
    console.log('Payment completed for plan:', plan.name)
    // Refresh subscription status
    await checkSubscriptionStatus()
    showSubscriptionPlans.value = false
  } else {
    // For free plans, just close the modal
    showSubscriptionPlans.value = false
  }
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

// Helper functions for subscription plan display
const getCurrentPlanName = () => {
  if (!currentSubscription.value) return 'Free'
  
  const planType = currentSubscription.value.plan_type
  switch (planType) {
    case 'pro':
      return 'Pro'
    case 'enterprise':
      return 'Enterprise'
    case 'premium':
      return 'Premium'
    default:
      return 'Free'
  }
}

const getCurrentPlanPrice = () => {
  if (!currentSubscription.value) return 0
  
  const planType = currentSubscription.value.plan_type
  switch (planType) {
    case 'pro':
      return 19
    case 'enterprise':
      return 49
    case 'premium':
      return 79
    default:
      return 0
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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