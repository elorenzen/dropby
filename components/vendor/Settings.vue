<template>
  <div class="min-h-screen" style="background: var(--surface-ground); color: var(--text-color);">
    <!-- Header -->
    <div class="border-b px-8 py-6" style="border-color: var(--surface-border);">
      <h1 class="text-3xl font-bold mb-1" style="color: var(--text-color);">Vendor Settings</h1>
      <p class="text-sm" style="color: var(--text-color-secondary);">Manage your business profile, hours, menu, and associated users</p>
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
          <h2 class="text-2xl font-bold text-text-main mb-6">General Information</h2>
          
          <div class="flex gap-8">
            <!-- Image Upload Section -->
            <div class="w-1/3">
              <div class="bg-white rounded-lg p-4 mb-4">
                <NuxtImg 
                  :src="imageUrl || '/placeholder-vendor.jpg'" 
                  alt="Vendor Image" 
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
                <!-- Name -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Name</label>
                  <InputText 
                    v-model="vendor.vendor_name" 
                    class="w-full bg-background border border-surface text-text-main rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                    placeholder="Enter vendor name"
                  />
                </div>

                <!-- Cuisine -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Cuisine</label>
                  <MultiSelect
                    v-model="vendor.cuisine"
                    :options="cuisines"
                    display="chip"
                    filter
                    placeholder="Select cuisine(s)"
                    :maxSelectedLabels="3"
                    class="w-full"
                  />
                </div>

                <!-- Address -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-text-muted mb-2">Base Address</label>
                  <div class="relative">
                    <i class="pi pi-map-marker absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                    <input
                      ref="streetRef"
                      class="w-full bg-background border border-surface text-text-main rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent"
                      :placeholder="vendor.formatted_address || 'Enter address'"
                    />
                  </div>
                </div>

                <!-- Service Radius -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Service Radius</label>
                  <InputNumber 
                    v-model="radius" 
                    suffix=" mi" 
                    class="w-full bg-background border border-surface text-text-main rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Phone</label>
                  <div class="relative">
                    <i class="pi pi-phone absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                    <InputText 
                      v-model="vendor.phone" 
                      class="w-full bg-background border border-surface text-text-main rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <!-- Website -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Website</label>
                  <div class="relative">
                    <i class="pi pi-link absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                    <InputText 
                      v-model="vendor.website" 
                      class="w-full bg-background border border-surface text-text-main rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                      placeholder="Website URL"
                    />
                  </div>
                </div>

                <!-- Instagram -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Instagram</label>
                  <div class="relative">
                    <i class="pi pi-instagram absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                    <InputText 
                      v-model="vendor.instagram" 
                      class="w-full bg-background border border-surface text-text-main rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                      placeholder="Instagram handle"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">Email</label>
                  <div class="relative">
                    <i class="pi pi-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                    <InputText 
                      v-model="vendor.email" 
                      class="w-full bg-background border border-surface text-text-main rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                      placeholder="Email address"
                    />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-text-muted mb-2">Description</label>
                <Textarea 
                  v-model="vendor.vendor_description" 
                  rows="5" 
                  class="w-full bg-background border border-surface text-text-main rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent" 
                  placeholder="Describe your business..."
                />
              </div>

              <!-- Save Button -->
              <div class="flex justify-end pt-6">
                <Button 
                  class="bg-accent text-background border-accent hover:bg-accent-dark px-8 py-3 font-semibold rounded-lg" 
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
              @click="saveEdits" 
              :loading="loading"
            />
          </div>
        </div>

        <!-- MENU TAB -->
        <div v-if="activeTab === 2" class="space-y-6">
          <h2 class="text-2xl font-bold text-text-main mb-6">Menu Management</h2>
          <MenuTable />
        </div>

        <!-- COMPLIANCE & DOCUMENTS TAB -->
        <div v-if="activeTab === 3" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--text-color);">Compliance & Documents</h2>
          <ComplianceUpload :business-id="vendor.id" business-type="vendor" />
        </div>

        <!-- FINANCIALS TAB -->
        <div v-if="activeTab === 4" class="space-y-6">
          <h2 class="text-2xl font-bold text-text-main mb-6">Payments & Financial</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <SettingsPaymentMethods :stripeCustomerId="vendor.stripe_customer_id" />
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

          <div v-if="hasActiveSubscription" class="space-y-8">
            <VendorPaymentHistory :vendorId="vendor.id" />
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
            :userTypeProp="'vendor'"
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
            :userTypeProp="'vendor'"
            :currentPlanId="currentSubscription?.plan_type || 'free'"
            :loading="subscriptionLoading"
            @plan-selected="handlePlanSelection" 
          />
        </Dialog>

        <!-- USER MANAGEMENT TAB -->
        <div v-if="activeTab === 5" class="space-y-6">
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
import { v4 } from 'uuid';
const route = useRoute()
const { currentUser } = useAuth()
const toast = useToast()
const supabase = useSupabaseClient()
const vendorStore = useVendorStore()
const userStore = useUserStore()
const user: any = userStore.getUser
const assocId = user[`associated_${user.type}_id`]
const vendor: any = ref(await vendorStore.getVendorById(assocId))

const editDialog = ref(false)
const uploading = ref(false)
const loading = ref(false)
const activeTab = ref(route.query.activeTab ? parseInt(route.query.activeTab as string) : 0)

// Subscription status
const hasActiveSubscription = ref(false)
const currentSubscription = ref<any>(null)

const errType = ref()
const errMsg = ref()
const errDialog = ref(false)
const imageUrl = ref(vendor.value.avatar_url ? vendor.value.avatar_url : '')
const radius = ref(vendor.value.service_radius ? vendor.value.service_radius : 10)
const streetRef = ref()
const baseLat = ref()
const baseLng = ref()
const formattedAddr = ref()
const showSubscriptionPlans = ref(false)
const subscriptionLoading = ref(false)

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
  'Mediterranean',
  'Mexican',
  'Pizza',
  'Sandwich',
  'Seafood',
  'Snacks',
  'Tacos',
  'Vegan'
])

// Tab configuration
const tabs = [
  { label: 'General Information', icon: 'pi pi-info-circle' },
  { label: 'Business Hours', icon: 'pi pi-clock' },
  { label: 'Menu', icon: 'pi pi-list' },
  { label: 'Compliance & Documents', icon: 'pi pi-file-pdf' },
  { label: 'Financials & Payment Settings', icon: 'pi pi-credit-card' },
  { label: 'User Management', icon: 'pi pi-users' }
]

onMounted(async () => {
  await sdkInit()
  await checkSubscriptionStatus()
})

const sdkInit = async () => {
  //initialize google sdk
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
        const autocomplete = new google.maps.places.Autocomplete(
          streetRef.value,
          options
        )
        autocomplete.addListener('place_changed', () => {
          const placeResponse = autocomplete.getPlace()
          if (placeResponse.geometry?.location) {
            baseLat.value = placeResponse.geometry.location.lat()
            baseLng.value = placeResponse.geometry.location.lng()
          }

          formattedAddr.value = placeResponse
            ? placeResponse.formatted_address
            : ''
        })
      }
    })
  } catch (error) {
    console.warn('Google Maps API not available:', error)
  }
}

// Check subscription status
const checkSubscriptionStatus = async () => {
  if (!currentUser.value) return

  try {
    // Get the vendor ID from the route
    const vendorId = route.params.id as string
    
    // Check for business subscription (not user subscription)
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', vendorId)
      .eq('business_type', 'vendor')
      .eq('status', 'active')
      .single()

    currentSubscription.value = subscriptionData
    hasActiveSubscription.value = !!subscriptionData
  } catch (error) {
    console.error('Error checking subscription status:', error)
    hasActiveSubscription.value = false
  }
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

const saveEdits = async () => {
  if (!vendor.value) return
  
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
    formatted_address: formattedAddr.value
  }

  const { error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', vendor.value.id)
    
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
      return 29
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

const openSubscriptionModal = () => {
  showSubscriptionPlans.value = true
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

:deep(.p-inputnumber) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-inputnumber-input) {
  background: var(--surface-card) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-color) !important;
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