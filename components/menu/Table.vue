<template>
    <div class="space-y-6">
        <!-- Header Section -->
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-text-main">Menu Items</h2>
                <p class="text-text-muted mt-1">Manage your food and beverage offerings</p>
            </div>
            <Button
                label="Add Menu Item"
                icon="pi pi-plus"
                class="bg-accent text-background border-accent hover:bg-accent-dark px-6 py-3 font-semibold rounded-lg"
                @click="addDialog = true"
            />
        </div>

        <!-- View Toggle -->
        <div class="flex items-center gap-2">
            <Button
                :icon="layout === 'grid' ? 'pi pi-th-large' : 'pi pi-list'"
                :label="layout === 'grid' ? 'Grid View' : 'List View'"
                outlined
                severity="secondary"
                size="small"
                @click="toggleLayout"
            />
            <div class="text-sm text-text-muted">
                {{ menuItems ? menuItems.length : 0 }} items
            </div>
        </div>

        <!-- Grid View -->
        <div v-if="layout === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card
                v-for="item in filteredMenuItems"
                :key="item.id"
                class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                @click="openEditDialog(item)"
            >
                <template #header>
                    <div class="relative">
                        <NuxtImg 
                            :src="item.image_url" 
                            :alt="item.name" 
                            class="w-full h-48 object-cover rounded-t-lg"
                            loading="lazy"
                        />
                        <div class="absolute top-2 right-2">
                            <Tag 
                                :value="item.type" 
                                severity="info" 
                                class="text-xs"
                            />
                        </div>
                    </div>
                </template>
                <template #title>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-text-main truncate">{{ item.name }}</h3>
                        <span class="text-xl font-bold text-accent">{{ formatCurrency(item.price) }}</span>
                    </div>
                </template>
                <template #content>
                    <p class="text-text-muted text-sm line-clamp-3">{{ item.description || 'No description provided' }}</p>
                </template>
                <template #footer>
                    <div class="flex gap-2">
                        <Button 
                            icon="pi pi-pencil" 
                            outlined 
                            size="small"
                            class="flex-1"
                            @click.stop="openEditDialog(item)"
                        />
                        <Button 
                            icon="pi pi-trash" 
                            outlined 
                            severity="danger"
                            size="small"
                            class="flex-1"
                            @click.stop="promptDeletion(item)"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <!-- List View -->
        <div v-else>
            <DataTable :value="filteredMenuItems" tableStyle="width: 100%" class="p-datatable-sm">
                <template #header>
                    <div class="flex items-center gap-4">
                        <InputText 
                            v-model="searchQuery" 
                            placeholder="Search menu items..."
                            class="w-64"
                        />
                        <Dropdown
                            v-model="selectedType"
                            :options="typeOptions"
                            placeholder="Filter by type"
                            class="w-40"
                        />
                    </div>
                </template>
                <Column field="name" header="Name" sortable>
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <NuxtImg 
                                :src="data.image_url" 
                                :alt="data.name" 
                                class="w-12 h-12 rounded object-cover"
                            />
                            <div>
                                <div class="font-semibold">{{ data.name }}</div>
                                <div class="text-sm text-text-muted">{{ data.type }}</div>
                            </div>
                        </div>
                    </template>
                </Column>
                <Column field="price" header="Price" sortable>
                    <template #body="{ data }">
                        <span class="font-bold text-accent">{{ formatCurrency(data.price) }}</span>
                    </template>
                </Column>
                <Column field="description" header="Description">
                    <template #body="{ data }">
                        <p class="text-sm text-text-muted line-clamp-2">{{ data.description || 'No description' }}</p>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width:8rem">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <Button 
                                icon="pi pi-pencil" 
                                outlined 
                                rounded 
                                size="small"
                                @click="openEditDialog(data)" 
                            />
                            <Button 
                                icon="pi pi-trash" 
                                outlined 
                                rounded 
                                severity="danger"
                                size="small"
                                @click="promptDeletion(data)" 
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- ADD ITEM -->
        <Dialog v-model:visible="addDialog" modal header="Add Menu Item" :style="{ width: '50rem' }">
            <MenuAdd :id="user.id" :vendor="user.associated_vendor_id" @created="itemSuccess" @errored="itemErrored" />
        </Dialog>

        <!-- EDIT ITEM -->
        <Dialog v-model:visible="editDialog" modal header="Edit Menu Item" :style="{ width: '50rem' }">
            <MenuEdit :item="itemToEdit" :vendor="user.associated_vendor_id" @edited="itemSuccess" @errored="itemErrored" />
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :itemType="'Inventory Item'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
        <Toast group="main" position="bottom-center" @close="onClose" />
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
const toast = useToast()
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
const searchQuery  = ref('')
const selectedType = ref('')
const sortKey      = ref();
const sortOrder    = ref();
const sortField    = ref();
const sortOptions  = ref([
    {label: 'Price High to Low', value: '!price'},
    {label: 'Price Low to High', value: 'price'},
]);

// Type options for filtering
const typeOptions = ref([
    { label: 'All Types', value: '' },
    { label: 'Appetizer', value: 'appetizer' },
    { label: 'Entree', value: 'entree' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Beverage', value: 'beverage' },
    { label: 'Side', value: 'side' }
])

// Computed properties
const filteredMenuItems = computed(() => {
    let filtered = menuItems.value

    // Filter by search query
    if (searchQuery.value) {
        filtered = filtered.filter((item: any) => 
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }

    // Filter by type
    if (selectedType.value) {
        filtered = filtered.filter((item: any) => item.type === selectedType.value)
    }

    return filtered
})

// Methods
const toggleLayout = () => {
    layout.value = layout.value === 'grid' ? 'list' : 'grid'
}

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
    try {
        // Delete from database using store
        await store.deleteMenuItem(itemToDelete.value.id)
        
        // Delete image from storage
        const { error: imgErr } = await supabase
            .storage
            .from('menu_images')
            .remove([itemToDelete.value.image_name])
        
        if (imgErr) {
            console.warn('Image deletion failed:', imgErr.message)
        }
        
        await resetFields('Deleted')
    } catch (error: any) {
        throwErr('Item Deletion', error.message || 'Failed to delete menu item')
    }
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
    toast.add({ severity: 'success', summary: 'Success', detail: `Menu Item ${action}!`, group: 'main', life: 6000 })
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
const onClose = () => {
  // Toast closed functionality
}
</script>

<style scoped>

</style>