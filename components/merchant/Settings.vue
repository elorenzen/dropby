<template>
  <div class="min-h-screen" style="background: var(--p-surface-ground); color: var(--p-text-color);">
    <!-- Header -->
    <div class="border-b px-8 py-6" style="border-color: var(--p-surface-border);">
      <h1 class="text-3xl font-bold mb-1" style="color: var(--p-text-color);">Merchant Settings</h1>
      <p class="text-sm" style="color: var(--text-md-gray);">Manage your business profile, hours, payments, and compliance</p>
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
          <h2 class="text-2xl font-bold mb-6" style="color: var(--p-text-color);">General Information</h2>
          
          <div class="flex gap-8">
            <!-- Image Upload Section -->
            <div class="w-1/3">
              <div class="bg-surface-card rounded-lg p-4 mb-4">
                <NuxtImg 
                  :src="imageUrl || '/placeholder-business.jpg'" 
                  alt="Business Image" 
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
                <!-- Business Name -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Business Name</label>
                  <InputText 
                    v-model="merchant.merchant_name" 
                    class="w-full rounded-lg px-4 py-3 focus:ring-2" 
                    style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                    placeholder="Enter business name"
                  />
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Location Address</label>
                  <div class="relative">
                    <i class="pi pi-map-marker absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-md-gray);"></i>
                    <input
                      ref="streetRef"
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2"
                      style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                      :placeholder="merchant.formatted_address || 'Enter address'"
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Phone</label>
                  <div class="relative">
                    <i class="pi pi-phone absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-md-gray);"></i>
                    <InputText 
                      v-model="merchant.phone" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Email</label>
                  <div class="relative">
                    <i class="pi pi-envelope absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-md-gray);"></i>
                    <InputText 
                      v-model="merchant.email" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <!-- Website -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Website</label>
                  <div class="relative">
                    <i class="pi pi-link absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-md-gray);"></i>
                    <InputText 
                      v-model="merchant.website" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                      placeholder="Website URL"
                    />
                  </div>
                </div>

                <!-- Instagram -->
                <div>
                  <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Instagram</label>
                  <div class="relative">
                    <i class="pi pi-instagram absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-md-gray);"></i>
                    <InputText 
                      v-model="merchant.instagram" 
                      class="w-full rounded-lg pl-10 pr-4 py-3 focus:ring-2" 
                      style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                      placeholder="Instagram handle"
                    />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Business Description</label>
                <Textarea 
                  v-model="merchant.merchant_description" 
                  rows="4" 
                  class="w-full rounded-lg px-4 py-3 focus:ring-2" 
                  style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                  placeholder="Describe your business..."
                />
              </div>

              <!-- Vendor Notes -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Directions/Notes for Vendors</label>
                <Textarea 
                  v-model="merchant.notes" 
                  rows="4" 
                  class="w-full rounded-lg px-4 py-3 focus:ring-2" 
                  style="background: var(--p-surface-card); border-color: var(--p-surface-border); color: var(--p-text-color);"
                  placeholder="e.g., Setup time: 8am, Special dietary requirements, Parking instructions, Loading dock location..."
                />
              </div>

              <!-- Preferred Vendors -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: var(--text-md-gray);">Preferred Vendor(s)</label>
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

        <!-- PAYMENTS & FINANCIAL TAB -->
        <div v-if="activeTab === 2" class="space-y-6">
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
            <SettingsPaymentMethods :stripeCustomerId="merchant.stripe_customer_id" />
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

          <!-- Middle Row: Event Pricing Configuration and Pricing Guide -->
          <div v-if="hasActiveSubscription" class="space-y-8">
              <!-- Payment History Section -->
              <PaymentHistory :merchantId="merchant.id" />
          </div>

          <!-- Bottom Row: Subscription Status -->
          <div v-if="!hasActiveSubscription" class="mb-8">
            <div class="bg-accent rounded-lg p-6" style="color: var(--p-primary-color-text);">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center bg-primary-light opacity-30">
                  <i class="pi pi-star text-xl" style="color: var(--p-primary-color-text);"></i>
                </div>
                <div>
                  <h3 class="text-xl font-semibold" style="color: var(--p-primary-color-text);">Upgrade Your Plan</h3>
                  <p style="color: var(--p-primary-color-text); opacity: 0.9;">Get unlimited events and premium features</p>
                </div>
              </div>
              <p class="mb-4" style="color: var(--p-primary-color-text); opacity: 0.9;">
                You're currently on the free plan. Upgrade to unlock unlimited events, advanced analytics, and priority support.
              </p>
              <Button
                label="View Plans"
                icon="pi pi-arrow-right"
                style="background: var(--p-surface-card); color: var(--p-warn-color);"
                class="hover:opacity-90"
                @click="openSubscriptionModal"
              />
            </div>
          </div>
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

        <!-- USER MANAGEMENT TAB (admin only) -->
        <div v-if="isAdmin && activeTab === 4" class="space-y-6">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--p-text-color);">User Management</h2>
          <AssociatedUsers :businessName="merchant.merchant_name" />
        </div>
      </div>
      
      <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
      <Toast group="main" position="bottom-center" @close="onClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dates'
import { useGooglePlacesAutocomplete } from '~/composables/useGooglePlacesAutocomplete'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const { showToast } = useToast()
const storageStore = useStorageStore()
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()
const businessHoursStore = useBusinessHoursStore()
const { currentUser } = useAuth()

// Store data
const vendors = vendorStore.getAllVendors
const user = userStore.getUser
const assocId = user?.[`associated_${user?.type}_id`]

// Reactive data
const merchant = ref(await merchantStore.getMerchantById(assocId || ''))
const activeTab = ref(route.query.activeTab ? parseInt(route.query.activeTab as string) : 0)
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

// Initialize Google Places Autocomplete
const { initialize: initializeAutocomplete } = useGooglePlacesAutocomplete(
  streetRef,
  {
    onPlaceSelected: (place) => {
      addressComponents.value = place.addressComponents || ''
      coordinates.value = place.coordinates || null
      formattedAddress.value = place.formattedAddress || ''
      addressUrl.value = place.addressUrl || ''
    }
  }
)

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

// Tab configuration - User Management only visible to admins
const isAdmin = computed(() => user?.is_admin === true)

const tabs = computed(() => {
  const baseTabs = [
    { label: 'General Information', icon: 'pi pi-info-circle' },
    { label: 'Business Hours', icon: 'pi pi-clock' },
    { label: 'Payments & Financial', icon: 'pi pi-credit-card' },
    { label: 'Compliance & Documents', icon: 'pi pi-file-pdf' },
  ]
  if (isAdmin.value) {
    baseTabs.push({ label: 'User Management', icon: 'pi pi-users' })
  }
  return baseTabs
})
// Subscription status
const hasActiveSubscription = ref(false)
const currentSubscription = ref<any>(null)
const subscriptionStore = useSubscriptionStore()

// Trial state
const trialAlertDismissed = ref(false)
const downgradingToFree = ref(false)

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

// UI state
const showSubscriptionPlans = ref(false)
const subscriptionLoading = ref(false)


// Google Maps initialization
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
  if (!merchant.value?.id) return
  
  try {
    const businessHoursStore = useBusinessHoursStore()
    
    // Get business hours for this merchant from store
    const hours = businessHoursStore.getBusinessHours(merchant.value.id, 'merchant')
    
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
    updated_at: new Date().toISOString(),
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

  try {
    await merchantStore.updateMerchant(merchant.value.id, updates)
    showToast('Information Updated!', 'success')
  } catch (error: any) {
    errType.value = 'Settings Update'
    errMsg.value = error.message || 'Failed to update merchant information'
    errDialog.value = true
  } finally {
    loading.value = false
  }
}

const saveBusinessHours = async () => {
  if (!merchant.value) return
  
  loading.value = true
  
  try {
    await businessHoursStore.updateBusinessHours(merchant.value.id, 'merchant', businessHours.value)
    showToast('Business Hours Updated!', 'success')
  } catch (error: any) {
    errType.value = 'Business Hours Update'
    errMsg.value = error.message || 'Failed to update business hours'
    errDialog.value = true
  } finally {
    loading.value = false
  }
}

const updateImage = async (e: any) => {
  const file = e.files[0]

  if (file) {
    const oldAvatar = merchant.value?.avatar_url || imageUrl.value || null
    await storageStore.editImage('merchant_avatars', file, oldAvatar || undefined, {
      onSuccess: async (publicUrl) => {
        imageUrl.value = publicUrl

        const updates = {
          updated_at: new Date().toISOString(),
          avatar_url: publicUrl,
        }

        try {
          await merchantStore.updateMerchant(merchant.value!.id, updates)
          // Update local merchant data
          if (merchant.value) {
            merchant.value.avatar_url = publicUrl
          }
          showToast('Merchant Avatar Updated!', 'success')
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

const openSubscriptionModal = () => {
  showSubscriptionPlans.value = true
}

// Check subscription status
const checkSubscriptionStatus = async () => {
  if (!currentUser.value || !merchant.value?.id) return

  try {
    const merchantId = merchant.value.id as string
    
    // Use subscription store to get active subscription (includes trialing)
    await subscriptionStore.setActiveSubscription(merchantId, 'merchant')
    
    currentSubscription.value = subscriptionStore.getActiveSubscription
    hasActiveSubscription.value = subscriptionStore.isActive
  } catch (error) {
    console.error('Error checking subscription status:', error)
    hasActiveSubscription.value = false
  }
}

// Handle downgrade to free plan after trial expiry
const handleDowngradeToFree = async () => {
  if (!merchant.value?.id) return
  downgradingToFree.value = true
  try {
    await subscriptionStore.downgradeToFree(merchant.value.id, 'merchant')
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
      return 19
    case 'premium':
      return 49
    default:
      return 0
  }
}

</script>

<style scoped>
/* PrimeVue handles all component styling by default - only override if absolutely necessary */
</style>