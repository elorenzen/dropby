<template>
    <div style="background: var(--surface-ground); padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem;">
        <div class="gallery-section">
            <div class="section-header">
                <div class="font-bold mb-4" style="font-size: 1.5rem;">Bars & Taprooms</div>
                <Button 
                    label="View All" 
                    icon="pi pi-arrow-right"
                    outlined
                    size="small"
                    @click="navigateTo('/establishments')"
                />
            </div>
            <Carousel :value="merchantsWithDistance" :numVisible="3" :numScroll="1">
                <template #item="{ data }">
                    <GalleryCard class="gallery-carousel-item">
                        <template #title>{{ data.merchant_name }}</template>
                        <template #description>{{ data.merchant_description }}</template>
                        <template #image>
                            <NuxtImg
                                :src="data.avatar_url"
                                width="400"
                                height="300"
                                loading="lazy"
                                fit="inside"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                class="rounded w-full h-full aspect-[4/3]"
                            />
                        </template>
                        <template #rating>
                            <Rating class="mt-2" :model-value="data.average_vendor_rating" />
                        </template>
                        <template #misc>
                            <p>{{ data.formatted_address ? data.formatted_address : 'Location not specified' }}</p>
                        </template>
                    </GalleryCard>
                </template>
            </Carousel>
        </div>
        <div class="gallery-section">
            <div class="section-header">
                <div class="font-bold mb-4" style="font-size: 1.5rem;">Food Trucks</div>
                <Button 
                    label="View All" 
                    icon="pi pi-arrow-right"
                    outlined
                    size="small"
                    @click="navigateTo('/food-trucks')"
                />
            </div>
            <Carousel :value="vendors" :numVisible="3" :numScroll="1">
                <template #item="{ data }">
                    <GalleryCard class="gallery-carousel-item">
                        <template #title>{{ data.vendor_name }}</template>
                        <template #description>{{ data.vendor_description }}</template>
                        <template #image>
                            <NuxtImg
                                :src="data.avatar_url"
                                width="400"
                                height="300"
                                loading="lazy"
                                fit="inside"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                class="rounded w-full h-full aspect-[4/3]"
                            />
                        </template>
                        <template #rating>
                            <Rating class="mt-2" :model-value="data.average_merchant_rating" />
                        </template>
                        <template #misc>
                            <div class="cuisine-badges">
                                <Badge
                                    class="mx-1 mb-1"
                                    v-for="(cuisine, index) in data.cuisine"
                                    :key="`${cuisine}-${index}`"
                                    :value="cuisine"
                                    severity="secondary"
                                    size="small"
                                />
                            </div>
                        </template>
                    </GalleryCard>
                </template>
            </Carousel>
        </div>

        <!-- Merchant Details Dialog -->
        <Dialog 
            v-model="merchantDialogVisible" 
            :header="selectedMerchant?.merchant_name || 'Merchant Details'"
            :style="{ width: '50vw' }"
            :modal="true"
            :closable="true"
        >
            <div v-if="selectedMerchant" class="merchant-details">
                <div class="merchant-header">
                    <NuxtImg
                        :src="selectedMerchant.avatar_url"
                        width="200"
                        height="150"
                        loading="lazy"
                        fit="inside"
                        class="rounded-lg mb-4"
                    />
                    <div class="merchant-info">
                        <h3 class="text-xl font-bold mb-2">{{ selectedMerchant.merchant_name }}</h3>
                        <Rating :model-value="selectedMerchant.average_vendor_rating" class="mb-3" />
                        <p class="text-text-muted mb-2">{{ selectedMerchant.formatted_address || 'Location not specified' }}</p>
                        <Badge 
                            v-if="selectedMerchant.distance" 
                            :value="`${selectedMerchant.distance} miles away`" 
                            severity="info" 
                            class="mt-2"
                        />
                    </div>
                </div>
                
                <div class="merchant-description">
                    <h4 class="font-semibold mb-2">About</h4>
                    <p class="text-text-muted">{{ selectedMerchant.merchant_description || 'No description available.' }}</p>
                </div>
            </div>
        </Dialog>

        <!-- Vendor Details Dialog -->
        <Dialog 
            v-model="vendorDialogVisible" 
            :header="selectedVendor?.vendor_name || 'Vendor Details'"
            :style="{ width: '50vw' }"
            :modal="true"
            :closable="true"
        >
            <div v-if="selectedVendor" class="vendor-details">
                <div class="vendor-header">
                    <NuxtImg
                        :src="selectedVendor.avatar_url"
                        width="200"
                        height="150"
                        loading="lazy"
                        fit="inside"
                        class="rounded-lg mb-4"
                    />
                    <div class="vendor-info">
                        <h3 class="text-xl font-bold mb-2">{{ selectedVendor.vendor_name }}</h3>
                        <Rating :model-value="selectedVendor.average_merchant_rating" class="mb-3" />
                    </div>
                </div>
                
                <div v-if="selectedVendor.cuisine && selectedVendor.cuisine.length > 0" class="vendor-cuisine mb-4">
                    <h4 class="font-semibold mb-2">Cuisine Types</h4>
                    <div class="cuisine-badges">
                        <Badge
                            class="mx-1 mb-1"
                            v-for="(cuisine, index) in selectedVendor.cuisine"
                            :key="`${cuisine}-${index}`"
                            :value="cuisine"
                            severity="secondary"
                            size="small"
                        />
                    </div>
                </div>

                <div class="vendor-description">
                    <h4 class="font-semibold mb-2">About</h4>
                    <p class="text-text-muted">{{ selectedVendor.vendor_description || 'No description available.' }}</p>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
const merchStore  = useMerchantStore()
const vendorStore = useVendorStore()
const merchants   = merchStore.getAllMerchants
const vendors     = vendorStore.getAllVendors

// Dialog state
const merchantDialogVisible = ref(false)
const vendorDialogVisible = ref(false)
const selectedMerchant = ref<any>(null)
const selectedVendor = ref<any>(null)

// Location services
const userLocation = ref<{lat: number, lng: number} | null>(null)
const locationPermission = ref<boolean>(false)

// Get user location on component mount
onMounted(async () => {
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })
      
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      locationPermission.value = true
    } catch (error) {
      console.log('Location permission denied or unavailable')
      locationPermission.value = false
    }
  }
})

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}

// Add distance to merchants if location is available
const merchantsWithDistance = computed(() => {
  if (!userLocation.value || !locationPermission.value) {
    return merchants
  }
  
  return merchants.map((merchant: any) => {
    if (merchant.latitude && merchant.longitude) {
      const distance = calculateDistance(
        userLocation.value!.lat,
        userLocation.value!.lng,
        merchant.latitude,
        merchant.longitude
      )
      return { ...merchant, distance }
    }
    return merchant
  })
})

// Navigation functions - show dialogs
const viewMerchantDetails = (merchant: any) => {
    selectedMerchant.value = merchant
    merchantDialogVisible.value = true
}

const viewVendorDetails = (vendor: any) => {
    selectedVendor.value = vendor
    vendorDialogVisible.value = true
}

// Navigation functions for dashboard access
const navigateToMerchant = (merchant: any) => {
    navigateTo(`/merchant/${merchant.id}/dashboard`)
}

const navigateToVendor = (vendor: any) => {
    navigateTo(`/vendor/${vendor.id}/dashboard`)
}
</script>

<style scoped>
.cuisine-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.cuisine-badges :deep(.p-badge) {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
}

.view-button {
    width: 100%;
}

.merchant-details,
.vendor-details {
    padding: 1rem 0;
}

.merchant-header,
.vendor-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.merchant-info,
.vendor-info {
    flex: 1;
}

.merchant-description,
.vendor-description,
.vendor-cuisine {
    margin-bottom: 1.5rem;
}

.merchant-actions,
.vendor-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.section-header .font-bold {
    margin-bottom: 0;
}

@media (max-width: 768px) {
    .merchant-header,
    .vendor-header {
        flex-direction: column;
        text-align: center;
    }
}
</style>