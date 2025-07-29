<template>
  <div class="establishments-page">
    <div class="page-header">
      <h1 class="page-title">Bars & Taprooms</h1>
      <p class="page-subtitle">Discover amazing bars and taprooms in your area</p>
    </div>

    <div class="merchants-grid">
      <div v-for="merchant in merchantsWithDistance" :key="merchant.id" class="merchant-card">
        <GalleryCard>
          <template #title>{{ merchant.merchant_name }}</template>
          <template #description>{{ merchant.merchant_description }}</template>
          <template #image>
            <NuxtImg
              :src="merchant.avatar_url"
              width="400"
              height="300"
              loading="lazy"
              fit="inside"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              class="rounded w-full h-full aspect-[4/3]"
            />
          </template>
          <template #rating>
            <Rating class="mt-2" :model-value="merchant.average_vendor_rating" />
          </template>
          <template #misc>
            <p>{{ merchant.formatted_address ? merchant.formatted_address : 'Location not specified' }}</p>
            <Badge 
              v-if="merchant.distance" 
              :value="`${merchant.distance} miles away`" 
              severity="info" 
              class="mt-2"
            />
          </template>
          <template #actions>
            <Button 
              label="View Details" 
              icon="pi pi-external-link"
              outlined
              size="small"
              class="view-button"
              @click="viewMerchantDetails(merchant)"
            />
          </template>
        </GalleryCard>
      </div>
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
  </div>
</template>

<script setup lang="ts">
const merchStore = useMerchantStore()
const merchants = merchStore.getAllMerchants

// Dialog state
const merchantDialogVisible = ref(false)
const selectedMerchant = ref<any>(null)

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

// Navigation functions
const viewMerchantDetails = (merchant: any) => {
  selectedMerchant.value = merchant
  merchantDialogVisible.value = true
}
</script>

<style scoped>
.establishments-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--heading-color);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.merchants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.merchant-card {
  height: 100%;
}

.view-button {
  width: 100%;
}

.merchant-details {
  padding: 1rem 0;
}

.merchant-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.merchant-info {
  flex: 1;
}

.merchant-description {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .establishments-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .merchants-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .merchant-header {
    flex-direction: column;
    text-align: center;
  }
}
</style> 