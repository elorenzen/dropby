<template>
    <div>
        <Card class="ma-2">
            <template #title>
                Food Trucks
            </template>
            <template #content>
                <Carousel :value="vendors" :numVisible="3" :numScroll="3" :responsiveOptions="responsiveOptions">
                    <template #item="{ data }">
                        <div class="border border-surface-200 dark:border-surface-700 rounded m-2  p-4">
                            <v-row>
                                <v-col>
                                    <div class="relative mx-auto">
                                        <img :src="data.avatar_url" class="w-48 h-36 rounded" />
                                    </div>
                                </v-col>
                                <v-col>
                                    <div class="flex justify-between items-center">
                                        <div class="mt-0 font-semibold text-xl">{{ data.vendor_name }}</div>
                                    </div>
                                    <Rating class="mt-2" :model-value="data.average_merchant_rating" />

                                    <div class="mt-2">
                                        <Badge class="mx-1" v-for="(i, index) in data.cuisine" :key="`${i}-${index}`">{{ i }}</Badge>
                                    </div>
                                </v-col>
                            </v-row>
                            <div class="my-4 font-medium">{{ data.vendor_description }}</div>
                        </div>
                    </template>
                </Carousel>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
const store = useVendorStore()
const vendors = store.getAllVendors

const responsiveOptions = ref([
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
