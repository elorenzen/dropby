<template>
  <div class="food-trucks-page">
    <div class="page-header">
      <h1 class="page-title">Food Trucks</h1>
      <p class="page-subtitle">Discover amazing food trucks in your area</p>
    </div>

    <!-- Search Filter -->
    <div class="search-filter">
      <div class="search-input-wrapper">
        <i class="pi pi-search search-icon"></i>
        <InputText
          v-model="searchQuery"
          placeholder="Search by vendor name..."
          class="search-input"
          @input="onSearchInput"
        />
        <Button
          v-if="searchQuery"
          icon="pi pi-times"
          text
          size="small"
          class="clear-button"
          @click="clearSearch"
        />
      </div>
      <p v-if="searchQuery" class="search-results-info">
        Showing {{ filteredVendors.length }} of {{ vendors.length }} vendors
      </p>
    </div>

    <div class="vendors-grid">
      <div v-for="vendor in filteredVendors" :key="vendor.id" class="vendor-card">
        <GalleryCard>
          <template #title>{{ vendor.vendor_name }}</template>
          <template #description>{{ vendor.vendor_description }}</template>
          <template #image>
            <NuxtImg
              :src="vendor.avatar_url"
              width="400"
              height="300"
              loading="lazy"
              fit="inside"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              class="rounded w-full h-full aspect-[4/3]"
            />
          </template>
          <template #rating>
            <Rating class="mt-2" :model-value="vendor.average_merchant_rating" />
          </template>
          <template #misc>
            <div class="cuisine-badges">
              <Badge
                class="mx-1 mb-1"
                v-for="(cuisine, index) in vendor.cuisine"
                :key="`${cuisine}-${index}`"
                :value="cuisine"
                severity="secondary"
                size="small"
              />
            </div>
          </template>
          <template #actions>
            <Button 
              label="View Details" 
              icon="pi pi-external-link"
              outlined
              size="small"
              class="view-button"
              @click="viewVendorDetails(vendor)"
            />
          </template>
        </GalleryCard>
      </div>
    </div>

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
const vendorStore = useVendorStore()
const vendors = vendorStore.getAllVendors

// Dialog state
const vendorDialogVisible = ref(false)
const selectedVendor = ref<any>(null)

// Search state
const searchQuery = ref('')
const filteredVendors = computed(() => {
  if (!searchQuery.value) {
    return vendors || []
  }
  return (vendors || []).filter((vendor: any) => 
    vendor.vendor_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Search functions
const onSearchInput = () => {
  // This function is not used in the current template,
  // but it's part of the search filter structure.
}

const clearSearch = () => {
  searchQuery.value = ''
}

// Navigation functions
const viewVendorDetails = (vendor: any) => {
  selectedVendor.value = vendor
  vendorDialogVisible.value = true
}
</script>

<style scoped>
.food-trucks-page {
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

.search-filter {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: var(--text-color-secondary);
  font-size: 1rem;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  width: 100%;
  font-size: 1rem;
  color: var(--text-color);
  background-color: var(--input-background);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.clear-button {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background-color: var(--input-background);
  border: none;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.clear-button:hover {
  background-color: var(--border-color);
}

.search-results-info {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.vendor-card {
  height: 100%;
}

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

.vendor-details {
  padding: 1rem 0;
}

.vendor-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.vendor-info {
  flex: 1;
}

.vendor-cuisine {
  margin-bottom: 1.5rem;
}

.vendor-description {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .food-trucks-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .vendors-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .vendor-header {
    flex-direction: column;
    text-align: center;
  }
}
</style> 