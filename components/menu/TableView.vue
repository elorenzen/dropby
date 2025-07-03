<template>
    <div class="m-8">
        <Card v-if="vendor.vendor_description">
            <template #subtitle>Vendor Description</template>
            <template #content>
                <p class="m-0">{{ vendor.vendor_description }}</p>
            </template>
        </Card>
        <DataTable :value="menuItems" class="m-4" size="small">
            <Column field="name" header="Menu Item" sortable></Column>
            <Column header="Image">
                <template #body="{ data }">
                    <NuxtImg v-if="data.image_url" :src="data.image_url" :alt="data.name" class="w-24 h-16 rounded" />
                </template>
            </Column>
            <Column field="price" header="Price" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.price) }}
                </template>
            </Column>
            <Column field="description" header="Description" style="max-width: 20rem;">
                <template #body="{ data }">
                    <ScrollPanel style="height: 10vh;">
                        <p class="m-0">{{ data.description }}</p>
                    </ScrollPanel>
                </template>
            </Column>
            <Column field="type" header="Type" sortable></Column>
            <template #footer>
                <span class="font-medium text-surface-500 dark:text-surface-400 text-xs" style="color: gray;">
                    Total: {{ menuItems ? menuItems.length : 0 }}
                </span>
            </template>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
const props        = defineProps(['vendorId'])
const store        = useMenuStore()
const vendorStore  = useVendorStore()
const vendorId     = props.vendorId
const vendor       = ref(await vendorStore.getVendorById(vendorId))
const menuItems    = computed(() => store.menuItems.filter((i:any) => i.vendor_id === vendorId))
const sortKey      = ref();
const sortOrder    = ref();
const sortField    = ref();
const sortOptions  = ref([
    {label: 'Price High to Low', value: '!price'},
    {label: 'Price Low to High', value: 'price'},
]);

const onSortChange = (event:any) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    }
    else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
}
const formatCurrency = (value:any) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
</script>

<style scoped>

</style>