<template>
    <div class="ma-2">
        <DataTable :value="menuItems" tableStyle="width: 100%">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Menu Items</span>
                    <Button
                        outlined
                        severity="secondary"
                        icon="pi pi-plus-circle"
                        @click="addDialog = true"
                    />
                </div>
            </template>
            <Column field="name" header="Name" sortable></Column>
            <Column header="Image">
                <template #body="{ data }">
                    <img :src="data.image_url" :alt="data.name" class="w-24 h-24 rounded" />
                </template>
            </Column>
            <Column field="price" header="Price" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.price) }}
                </template>
            </Column>
            <Column field="description" header="Description" style="max-width: 20rem;"></Column>
            <Column field="type" header="Type" sortable></Column>
            <!-- <Column field="status" header="Status" sortable>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                </template>
            </Column> -->
            <Column :exportable="false" style="min-width:8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEditDialog(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="promptDeletion(slotProps.data)" />
                </template>
            </Column>
            <template #footer>
                <span class="font-medium text-surface-500 dark:text-surface-400 text-xs" style="color: gray;">
                    Total: {{ menuItems ? menuItems.length : 0 }}
                </span>
            </template>
        </DataTable>

        <!-- ADD ITEM -->
        <Dialog v-model:visible="addDialog" modal header="New Menu Item" :style="{ width: '50rem' }">
            <MenuAdd :id="user.id" :vendor="user.associated_vendor_id" @created="itemSuccess" @errored="itemErrored" />
        </Dialog>

        <!-- EDIT ITEM -->
        <Dialog v-model:visible="editDialog" modal header="Edit Item" :style="{ width: '50rem' }">
            <MenuEdit :item="itemToEdit" :vendor="user.associated_vendor_id" @edited="itemSuccess" @errored="itemErrored" />
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :itemType="'Inventory Item'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />

        <v-snackbar
          v-model="snackbar"
          timeout="6000"
        >
          {{ snacktext }}

          <template v-slot:actions>
            <Button
              color="#000022"
              variant="text"
              @click="snackbar = false"
            >
              Close
            </Button>
          </template>
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
const supabase     = useSupabaseClient()
const userStore    = useUserStore()
const store        = useMenuStore()

const user:any     = ref(userStore.user)
const vendorId     = user.value.associated_vendor_id

const menuItems    = computed(() => store.menuItems.filter((i:any) => i.vendor_id === vendorId))

const addDialog    = ref(false)
const editDialog   = ref(false)
const itemToEdit   = ref(null)
const itemToDelete = ref(null)
const deleteDialog = ref(false)
const errDialog    = ref(false)
const errMsg       = ref()
const errType      = ref()
const layout       = ref('grid')
const loading      = ref(false)
const snackbar     = ref(false)
const snacktext    = ref('')
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
};
const openEditDialog = (item:any) => {
    itemToEdit.value = item
    editDialog.value = true
}
const promptDeletion = (item:any) => {
    itemToDelete.value = item
    deleteDialog.value = true
}
const confirmDelete = async () => {
    const { error: itemErr } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemToDelete.value.id)
    const { error: imgErr } = await supabase
        .storage
        .from('menu_images')
        .remove([itemToDelete.value.image_name])
    
    if (!itemErr && !imgErr) await resetFields('Deleted')
    else throwErr('Item Deletion', itemErr ? itemErr.message : imgErr?.message)
}
const cancelDelete = () => {
    deleteDialog.value = false
    itemToDelete.value = null
}
const throwErr = (title: any, msg: any) => {
    errType.value = title
    errMsg.value = msg
    errDialog.value = true
}
const itemSuccess = async (str:any) => {
    await resetFields('Created')
}
const itemErrored = (str:any) => {
    errType.value = 'Item Save'
    errMsg.value = str
    errDialog.value = true
}
const formatCurrency = (value:any) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
const resetFields = async (action:any) => {
    snacktext.value    = `Menu Item ${action}!`
    snackbar.value     = true
    addDialog.value    = false
    editDialog.value   = false
    deleteDialog.value = false
}
const getStatusLabel = (status: any) => {
    switch (status) {
        case 'For Sale':
            return 'secondary';

        case 'On Hold':
            return 'warn';
        
        case 'Not For Sale':
            return 'danger';

        case 'Sold':
            return 'success';

        default:
            return null;
    }
};
</script>

<style scoped>

</style>