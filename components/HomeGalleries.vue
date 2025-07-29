<template>
    <div style="background: var(--surface-ground); padding: 2rem; border-radius: 1.5rem; margin-bottom: 2rem;">
        <div class="gallery-section">
            <div class="font-bold mb-4" style="font-size: 1.5rem;">Bars & Taprooms</div>
            <Carousel :value="merchants" :numVisible="3" :numScroll="1">
                <template #item="{ data }">
                    <GalleryCard class="gallery-carousel-item">
                        <template #business-type>
                            <Badge value="Establishment" severity="info" />
                        </template>
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
                        <template #actions>
                            <Button 
                                label="View Details" 
                                icon="pi pi-external-link"
                                outlined
                                size="small"
                                class="view-button"
                                @click="viewMerchantDetails(data)"
                            />
                        </template>
                    </GalleryCard>
                </template>
            </Carousel>
        </div>
        <div class="gallery-section">
            <div class="font-bold mb-4" style="font-size: 1.5rem;">Food Trucks</div>
            <Carousel :value="vendors" :numVisible="3" :numScroll="1">
                <template #item="{ data }">
                    <GalleryCard class="gallery-carousel-item">
                        <template #business-type>
                            <Badge value="Food Truck" severity="warning" />
                        </template>
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
                        <template #actions>
                            <Button 
                                label="View Details" 
                                icon="pi pi-external-link"
                                outlined
                                size="small"
                                class="view-button"
                                @click="viewVendorDetails(data)"
                            />
                        </template>
                    </GalleryCard>
                </template>
            </Carousel>
        </div>
    </div>
</template>

<script setup lang="ts">
const merchStore  = useMerchantStore()
const vendorStore = useVendorStore()
const merchants   = merchStore.getAllMerchants
const vendors     = vendorStore.getAllVendors

// Navigation functions
const viewMerchantDetails = (merchant: any) => {
    // Navigate to merchant details page
    navigateTo(`/merchant/${merchant.id}/dashboard`)
}

const viewVendorDetails = (vendor: any) => {
    // Navigate to vendor details page
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
</style>