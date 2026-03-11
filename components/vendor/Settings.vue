<template>
  <div class="min-h-screen" style="background: var(--p-surface-ground); color: var(--p-text-color);">
    <!-- Header -->
    <div class="border-b px-8 py-6" style="border-color: var(--p-surface-border);">
      <h1 class="text-3xl font-bold mb-1" style="color: var(--p-text-color);">Vendor Settings</h1>
      <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Manage your business profile, hours, menu, and associated users</p>
    </div>

    <div class="flex">
      <!-- Sidebar Navigation -->
      <div class="w-64 border-r min-h-screen" style="border-color: var(--p-surface-border);">
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
                  : 'color: var(--text-md-gray); background: transparent;'"
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
              <div class="bg-surface-card rounded-lg p-4 mb-4">
                <NuxtImg 
                  :src="imageUrl || '/placeholder-vendor.jpg'" 
                  alt="Vendor Image" 
                  class="w-full h-64 object-cover rounded-lg" 
                />
              </div>
              <FileUpload
                mode="basic"
                accept="image/*"
                :maxFileSize="1000000"
                @select="updateImage"
                chooseLabel="Upload New Image"
                class="w-full"
              />
              <div v-if="storageStore.uploading" class="flex justify-center mt-4">
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
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-text-main">Business Hours</h2>
            <Button 
              label="Save Hours" 
              severity="success"
              @click="saveBusinessHours" 
              :loading="loading"
            />
          </div>
          
          <div class="space-y-4">
            <div v-for="(day, index) in businessHours" :key="index" class="border-b border-surface-light pb-4 last:border-b-0">
              <div class="grid grid-cols-4 gap-6 items-center">
                <div class="text-lg font-semibold text-text-main">{{ day.name }}</div>
                <div>
                  <label class="block text-sm font-medium text-text-muted mb-2">{{ day.name }} Open</label>
                  <Calendar 
                    v-model="day.open" 
                    timeOnly 
                    hourFormat="12"
                    class="w-full"
                    :showIcon="false"
                    :disabled="day.isClosed"
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
                    :disabled="day.isClosed"
                  />
                </div>
                <div class="flex items-center pt-6">
                  <Checkbox 
                    v-model="day.isClosed" 
                    :binary="true"
                    :inputId="`closed-${day.dayOfWeek}`"
                  />
                  <label :for="`closed-${day.dayOfWeek}`" class="ml-2 text-sm text-text-muted">Closed</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MENU TAB -->
        <div v-if="activeTab === 2" class="space-y-6">
          <MenuTable />
        </div>

        <!-- COMPLIANCE & DOCUMENTS TAB -->
        <div v-if="activeTab === 3" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--p-text-color);">Compliance & Documents</h2>
          <ComplianceUpload :business-id="vendor.id" business-type="vendor" />
        </div>

        <!-- FINANCIALS TAB -->
        <div v-if="activeTab === 4" class="space-y-6">
          <h2 class="text-2xl font-bold text-text-main mb-6">Payments & Financial</h2>

          <!-- Trial Expired Alert -->
          <div v-if="trialExpired && !trialAlertDismissed" class="bg-danger-light border border-danger-light rounded-lg p-4 mb-6 flex items-start gap-3">
            <i class="pi pi-exclamation-triangle text-xl mt-0.5 icon-danger"></i>
            <div class="flex-1">
              <h4 class="font-semibold mb-1 text-danger-dark">Your free trial has ended</h4>
              <p class="text-sm mb-3 text-danger">
                Your 7-day trial for the {{ getCurrentPlanName() }} plan has expired. Add a payment method below to continue your subscription, or your account will be downgraded to the free plan.
              </p>
              <div class="flex gap-2">
                <Button label="Add Payment Method" icon="pi pi-credit-card" size="small" severity="danger" />
                <Button label="Downgrade to Free" icon="pi pi-arrow-down" size="small" severity="secondary" outlined @click="handleDowngradeToFree" :loading="downgradingToFree" />
                <Button label="Dismiss" size="small" text @click="trialAlertDismissed = true" />
              </div>
            </div>
          </div>

          <!-- Trial Active Info -->
          <div v-if="isTrialing" class="bg-info-light border border-info-light rounded-lg p-4 mb-6 flex items-start gap-3">
            <i class="pi pi-clock text-xl mt-0.5 icon-info"></i>
            <div class="flex-1">
              <h4 class="font-semibold mb-1 text-info-dark">Free Trial Active</h4>
              <p class="text-sm text-info">
                You're on the {{ getCurrentPlanName() }} plan trial. 
                <span v-if="trialDaysRemaining !== null">{{ trialDaysRemaining }} day{{ trialDaysRemaining !== 1 ? 's' : '' }} remaining.</span>
                Add a payment method below to continue after your trial ends.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <SettingsPaymentMethods :stripeCustomerId="vendor.stripe_customer_id" />
          </div>
          
          <!-- Current Subscription Plan Section -->
          <div v-if="hasActiveSubscription" class="space-y-6">
            <div class="bg-surface-card rounded-lg border border-surface-border p-6">
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
                <div class="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                  <i class="pi pi-star text-primary text-xl"></i>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-text-main capitalize">
                    {{ getCurrentPlanName() }}
                  </h4>
                  <p class="text-text-muted">
                    ${{ getCurrentPlanPrice() }}/month
                  </p>
                  <div class="flex items-center space-x-2 mt-1">
                    <span v-if="isTrialing" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-info-medium text-info-dark">
                      <i class="pi pi-clock mr-1"></i>
                      Trial — {{ trialDaysRemaining }} day{{ trialDaysRemaining !== 1 ? 's' : '' }} left
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-light text-success-dark">
                      <i class="pi pi-check-circle mr-1"></i>
                      Active
                    </span>
                    <span v-if="currentSubscription?.next_billing_date" class="text-xs text-text-muted">
                      Next billing: {{ formatDate(currentSubscription.next_billing_date, { format: 'short' }) }}
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
                <div class="w-12 h-12 bg-surface-card/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-star text-xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-semibold">Upgrade Your Plan</h3>
                  <p class="text-accent-dark">Get unlimited events and premium features</p>
                </div>
              </div>
              <p class="text-accent-dark mb-4">
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

        <!-- NOTIFICATIONS TAB -->
        <div v-if="activeTab === 5" class="space-y-6">
          <SettingsNotificationSettings
            businessType="vendor"
            @error="(type, msg) => { errType = type; errMsg = msg; errDialog = true }"
          />
        </div>

        <!-- USER MANAGEMENT TAB (admin only) -->
        <div v-if="isAdmin && activeTab === 6" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--p-text-color);">User Management</h2>
          <AssociatedUsers :businessName="vendor.vendor_name" />
        </div>
      </div>
    </div>

    <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    <Toast group="main" position="bottom-center" @close="onClose" />
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dates'
import { useGooglePlacesAutocomplete } from '~/composables/useGooglePlacesAutocomplete'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const { currentUser } = useAuth()
const { showToast } = useToast()
const storageStore = useStorageStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()
const businessHoursStore = useBusinessHoursStore()
const user: any = userStore.getUser
const assocId = user[`associated_${user.type}_id`]
const vendor: any = ref(await vendorStore.getVendorById(assocId))

const editDialog = ref(false)
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

// Trial state
const trialAlertDismissed = ref(false)
const downgradingToFree = ref(false)
const subscriptionStore = useSubscriptionStore()

const isTrialing = computed(() => subscriptionStore.isTrialing)
const trialExpired = computed(() => subscriptionStore.trialExpired)
const trialDaysRemaining = computed(() => {
  const trialEnd = subscriptionStore.trialEndDate
  if (!trialEnd) return null
  const now = new Date()
  const end = new Date(trialEnd)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

// Initialize Google Places Autocomplete
const { initialize: initializeAutocomplete } = useGooglePlacesAutocomplete(
  streetRef,
  {
    onPlaceSelected: (place) => {
      if (place.coordinates) {
        baseLat.value = place.coordinates.lat
        baseLng.value = place.coordinates.lng
      }
      formattedAddr.value = place.formattedAddress || ''
    }
  }
)
const subscriptionLoading = ref(false)

// Business hours - Initialize with default structure
const businessHours = ref([
  { name: 'Monday', dayOfWeek: 1, open: null, close: null, isClosed: false },
  { name: 'Tuesday', dayOfWeek: 2, open: null, close: null, isClosed: false },
  { name: 'Wednesday', dayOfWeek: 3, open: null, close: null, isClosed: false },
  { name: 'Thursday', dayOfWeek: 4, open: null, close: null, isClosed: false },
  { name: 'Friday', dayOfWeek: 5, open: null, close: null, isClosed: false },
  { name: 'Saturday', dayOfWeek: 6, open: null, close: null, isClosed: false },
  { name: 'Sunday', dayOfWeek: 0, open: null, close: null, isClosed: false }
])

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

// Tab configuration - User Management only visible to admins
const isAdmin = computed(() => user?.is_admin === true)

const tabs = computed(() => {
  const baseTabs = [
    { label: 'General Information', icon: 'pi pi-info-circle' },
    { label: 'Business Hours', icon: 'pi pi-clock' },
    { label: 'Menu', icon: 'pi pi-list' },
    { label: 'Compliance & Documents', icon: 'pi pi-file-pdf' },
    { label: 'Financials & Payment Settings', icon: 'pi pi-credit-card' },
    { label: 'Notifications', icon: 'pi pi-bell' },
  ]
  if (isAdmin.value) {
    baseTabs.push({ label: 'User Management', icon: 'pi pi-users' })
  }
  return baseTabs
})

onMounted(async () => {
  await sdkInit()
  await checkSubscriptionStatus()
  await loadBusinessHours()
})

// Helper function to convert TIME string (HH:MM:SS) to Date object for Calendar component
const convertTimeStringToDate = (timeString: string): Date => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, seconds || 0, 0)
  return date
}

// Load business hours from store (data already loaded in app.vue)
const loadBusinessHours = async () => {
  if (!vendor.value?.id) return
  
  try {
    // Get business hours for this vendor from store
    const hours = businessHoursStore.getBusinessHours(vendor.value.id, 'vendor')
    
    // Map database records to businessHours structure
    if (hours && hours.length > 0) {
      const hoursMap = new Map()
      hours.forEach((record: any) => {
        hoursMap.set(record.day_of_week, {
          open: record.open_time ? convertTimeStringToDate(record.open_time) : null,
          close: record.close_time ? convertTimeStringToDate(record.close_time) : null,
          isClosed: record.is_closed || false
        })
      })
      
      // Update businessHours with loaded data
      businessHours.value.forEach((day) => {
        const record = hoursMap.get(day.dayOfWeek)
        if (record) {
          day.open = record.open
          day.close = record.close
          day.isClosed = record.isClosed
        }
      })
    }
  } catch (err) {
    console.error('Error loading business hours:', err)
  }
}

const sdkInit = async () => {
  await initializeAutocomplete()
}

// Check subscription status
const checkSubscriptionStatus = async () => {
  if (!currentUser.value) return

  try {
    const vendorId = route.params.id as string
    
    await subscriptionStore.setActiveSubscription(vendorId, 'vendor')
    
    currentSubscription.value = subscriptionStore.getActiveSubscription
    hasActiveSubscription.value = subscriptionStore.isActive
  } catch (error) {
    console.error('Error checking subscription status:', error)
    hasActiveSubscription.value = false
  }
}

// Handle downgrade to free plan after trial expiry
const handleDowngradeToFree = async () => {
  const vendorId = route.params.id as string
  if (!vendorId) return
  downgradingToFree.value = true
  try {
    await subscriptionStore.downgradeToFree(vendorId, 'vendor')
    trialAlertDismissed.value = true
    await checkSubscriptionStatus()
  } catch (error) {
    console.error('Error downgrading to free:', error)
  } finally {
    downgradingToFree.value = false
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
  
  try {
    const updates = {
      updated_at: new Date().toISOString(),
      vendor_name: vendor.value.vendor_name,
      cuisine: vendor.value.cuisine,
      vendor_description: vendor.value.vendor_description,
      phone: vendor.value.phone,
      website: vendor.value.website,
      instagram: vendor.value.instagram,
      email: vendor.value.email,
      service_radius: radius.value,
      base_latitude: baseLat.value,
      base_longitude: baseLng.value,
      formatted_address: formattedAddr.value
    }

    await vendorStore.updateVendor(vendor.value.id, updates)
    
    editDialog.value = false
    showToast('success', 'Success', 'Information Updated!', 6000)
  } catch (error: any) {
    errType.value = "Settings Update(s)"
    errMsg.value = error.message || 'Failed to update vendor information'
    errDialog.value = true
  } finally {
    loading.value = false
  }
}

const saveBusinessHours = async () => {
  if (!vendor.value) return
  
  loading.value = true
  
  try {
    await businessHoursStore.updateBusinessHours(vendor.value.id, 'vendor', businessHours.value)
    
    showToast('success', 'Success', 'Business Hours Updated!', 6000)
  } catch (error: any) {
    errType.value = 'Business Hours Update'
    errMsg.value = error.message || 'Failed to update business hours'
    errDialog.value = true
  } finally {
    loading.value = false
  }
}

const setFormattedOpen = (e: any, i: any) => {
  businessHours.value[i].open = e.value
}
const setFormattedClose = (e: any, i: any) => {
  businessHours.value[i].close = e.value
}

const updateImage = async (e: any) => {
  const file = e?.files?.[0]

  if (file) {
    const oldAvatar = vendor.value?.avatar_url || imageUrl.value || null
    await storageStore.editImage('vendor_avatars', file, oldAvatar || undefined, {
      onSuccess: async (publicUrl) => {
        imageUrl.value = publicUrl

        const updates = {
          updated_at: new Date().toISOString(),
          avatar_url: publicUrl,
        }

        try {
          await vendorStore.updateVendor(vendor.value.id, updates)
          if (vendor.value) {
            vendor.value.avatar_url = publicUrl
          }
          showToast('success', 'Success', 'Vendor Avatar Updated!', 6000)
        } catch (error: any) {
          errType.value = 'Image Upload'
          errMsg.value = error.message || 'Failed to update avatar'
          errDialog.value = true
        }
      },
      onError: (error) => {
        errType.value = 'Image Upload'
        errMsg.value = error.message
        errDialog.value = true
      }
    })
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

const openSubscriptionModal = () => {
  showSubscriptionPlans.value = true
}
</script>

<style scoped>
:deep(.p-calendar) {
  background: var(--p-surface-card) !important;
  border-color: var(--p-surface-border) !important;
  color: var(--p-text-color) !important;
}

:deep(.p-calendar input) {
  background: var(--p-surface-card) !important;
  border-color: var(--p-surface-border) !important;
  color: var(--p-text-color) !important;
}

:deep(.p-multiselect) {
  background: var(--p-surface-card) !important;
  border-color: var(--p-surface-border) !important;
  color: var(--p-text-color) !important;
}

:deep(.p-multiselect-label) {
  color: var(--p-text-color) !important;
}

:deep(.p-multiselect-trigger) {
  color: var(--text-md-gray) !important;
}

:deep(.p-inputnumber) {
  background: var(--p-surface-card) !important;
  border-color: var(--p-surface-border) !important;
  color: var(--p-text-color) !important;
}

:deep(.p-inputnumber-input) {
  background: var(--p-surface-card) !important;
  border-color: var(--p-surface-border) !important;
  color: var(--p-text-color) !important;
}

:deep(.p-dropdown) {
  background: var(--p-surface-card) !important;
  border-color: var(--p-surface-border) !important;
  color: var(--p-text-color) !important;
}

:deep(.p-dropdown-label) {
  color: var(--p-text-color) !important;
}

:deep(.p-dropdown-trigger) {
  color: var(--text-md-gray) !important;
}

</style>