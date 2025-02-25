<template>
    <div>
        <Card class="ma-2 bg-transparent border border-black">
            <template #title>
                Bars & Taprooms
            </template>
            <template #content>
                <Carousel :value="merchants" :numVisible="3" :numScroll="3" :responsive="responsive">
                    <template #item="{ data }">
                        <GalleryCard>
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
                            <template #misc><p>{{ data.formatted_address ? data.formatted_address : '' }}</p></template>
                        </GalleryCard>
                    </template>
                </Carousel>
            </template>
        </Card>

        <Card class="ma-2 bg-transparent border border-black">
            <template #title>
                Food Trucks
            </template>
            <template #content>
                <Carousel :value="vendors" :numVisible="3" :numScroll="3" :responsive="responsive">
                    <template #item="{ data }">
                        <GalleryCard>
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
                                <Badge
                                    class="mx-1"
                                    v-for="(i, index) in data.cuisine"
                                    :key="`${i}-${index}`">
                                    {{ i }}
                                </Badge>
                            </template>
                        </GalleryCard>
                    </template>
                </Carousel>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
const merchStore  = useMerchantStore()
const vendorStore = useVendorStore()
const merchants   = merchStore.getAllMerchants
const vendors     = vendorStore.getAllVendors

const responsive  = ref([
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);
</script>

<style>

</style>