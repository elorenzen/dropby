<template>
    <DataTable
        :value="vendors"
        sortField="average_merchant_rating"
        :sort-order="-1"
        :expandedRows="expandedRows"
        dataKey="id"
        @rowExpand="onRowExpand"
        @rowCollapse="onRowCollapse"
    >
        <template #header>
            <div class="flex flex-wrap justify-end gap-2">
                <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
            </div>
        </template>
        <Column expander style="width: 5rem" />
        <Column field="vendor_name" header="Vendor" sortable>
            <template #body="slotProps">
                <p class="m-0 font-semibold">{{ slotProps.data.vendor_name }}</p>
            </template>
        </Column>
        <Column field="cuisine" header="Cuisine">
            <template #body="slotProps">
                <Badge class="mx-1" v-for="(i, index) in slotProps.data.cuisine" :key="`${i}-${index}`">{{ i }}</Badge>
            </template>
        </Column>
        <Column field="average_merchant_rating" header="Rating" :sortable="true">
            <template #body="slotProps">
                <Rating v-model="slotProps.data.average_merchant_rating" />
            </template>
        </Column>
        <Column field="socials" header="">
            <template #body="slotProps">
                <Button
                    as="a"
                    size="small"
                    class="mr-1"
                    icon="pi pi-globe"
                    variant="text"
                    :href="slotProps.data.website"
                    rounded
                    target="_blank"
                />
                <Button
                    as="a"
                    size="small"
                    class="mr-1"
                    icon="pi pi-instagram"
                    variant="text"
                    :href="slotProps.data.instagram"
                    rounded
                    target="_blank"
                />
                <Button
                    as="a"
                    size="small"
                    class="mr-1"
                    icon="pi pi-envelope"
                    variant="text"
                    :href="`mailto:${slotProps.data.email}`"
                    rounded
                    target="_blank"
                />
            </template>
        </Column>
        <template #expansion="slotProps">
            <MenuTableView :vendorId="slotProps.data.id" />
        </template>
    </DataTable>
</template>

<script setup>
const vendorStore = useVendorStore()
const vendors = vendorStore.getAllVendors
const expandedRows = ref({})

const expandAll = () => {
    expandedRows.value = vendors.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
    expandedRows.value = null;
};
</script>

<style lang="scss" scoped>

</style>