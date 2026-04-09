<template>
    <div class="space-y-6">
        <Message
            v-if="!canUseMenuRichContent"
            severity="info"
            :closable="false"
            class="text-sm"
        >
            Free plan: add menu items with name, price, and category. Upgrade to Pro or Premium for photos,
            descriptions, and seasonal items.
        </Message>
        <!-- Header Section -->
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-text-main">Menu Items</h2>
                <p class="text-text-muted mt-1">Manage your food and beverage offerings</p>
            </div>
            <Button
                label="Add Menu Item"
                icon="pi pi-plus"
                iconPos="left"
                class="px-6 py-3 font-semibold rounded-lg"
                @click="addDialog = true"
            />
        </div>

        <!-- Search and Filter Section -->
        <SearchAndFilter
            class="mb-8"
            :has-active-filters="hasActiveFilters"
            @clear-filters="clearFilters"
        >
            <template #search-bar>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="pi pi-search text-color-secondary"></i>
                    </div>
                    <InputText 
                        v-model="searchQuery" 
                        placeholder="Search menu items..."
                        class="w-full pl-10 pr-4"
                        size="small"
                    />
                </div>
            </template>

            <template #sort-by>
                <div class="w-48">
                    <Button
                        :icon="layout === 'grid' ? 'pi pi-list' : 'pi pi-th-large'"
                        :label="layout === 'grid' ? 'List View' : 'Grid View'"
                        outlined
                        severity="secondary"
                        size="small"
                        class="w-full"
                        @click="toggleLayout"
                    />
                </div>
            </template>

            <template #filters>
                <div>
                    <label class="block text-sm font-medium text-text-main mb-2">Meal Type</label>
                    <Select
                        v-model="selectedType"
                        :options="typeOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All types"
                        class="w-full"
                        size="small"
                    />
                </div>
            </template>

            <template #results-count>
                Showing {{ filteredMenuItems.length }} of {{ menuItems.length }} items
                <span v-if="searchQuery || selectedType" class="text-primary">
                    (filtered)
                </span>
            </template>
        </SearchAndFilter>

        <!-- Grid View -->
        <div v-if="layout === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card
                v-for="item in filteredMenuItems"
                :key="item.id"
                class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                @click="openEditDialog(item)"
            >
                <template #header>
                    <div class="relative h-48 rounded-t-lg overflow-hidden bg-surface-ground">
                        <NuxtImg 
                            v-if="item.image_url"
                            :src="item.image_url" 
                            :alt="item.name || 'Menu item'" 
                            class="w-full h-48 object-cover"
                            loading="lazy"
                        />
                        <div
                            v-else
                            class="w-full h-48 flex items-center justify-center text-text-muted text-sm"
                        >
                            No photo
                        </div>
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
                        <span class="text-xl font-bold text-primary">{{ formatCurrency(item.price) }}</span>
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
            <!-- Menu Items Table -->
            <DataTable :value="filteredMenuItems" tableStyle="width: 100%" class="p-datatable-sm menu-data-table" scrollable>
                <Column field="name" header="Name" sortable>
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <NuxtImg 
                                v-if="data.image_url"
                                :src="data.image_url" 
                                :alt="data.name || 'Menu item'" 
                                class="w-12 h-12 rounded object-cover"
                            />
                            <div
                                v-else
                                class="w-12 h-12 rounded bg-surface-ground border border-surface-border shrink-0"
                                aria-hidden="true"
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
                        <span class="font-bold text-primary">{{ formatCurrency(data.price) }}</span>
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
        <Dialog :visible="addDialog" @update:visible="addDialog = $event" modal header="Add Menu Item" :style="{ width: '90vw', maxWidth: '50rem' }" class="menu-dialog">
            <MenuAdd :id="user.id" :vendor="user.associated_vendor_id" @created="itemSuccess" @errored="itemErrored" />
        </Dialog>

        <!-- EDIT ITEM -->
        <Dialog :visible="editDialog" @update:visible="editDialog = $event" modal header="Edit Menu Item" :style="{ width: '90vw', maxWidth: '50rem' }" class="menu-dialog">
            <MenuEdit :item="itemToEdit" :vendor="user.associated_vendor_id" @edited="itemSuccess" @errored="itemErrored" />
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :visible="deleteDialog" :itemType="'Inventory Item'" :loading="deleting" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
        <Toast group="main" position="bottom-center" @close="onClose" />
    </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { showToast } = useToast()
const storageStore = useStorageStore()
const userStore    = useUserStore()
const store        = useMenuStore()

const user:any     = ref(userStore.user)
const vendorId     = user.value.associated_vendor_id
const subscriptionStore = useSubscriptionStore()
const canUseMenuRichContent = computed(() => subscriptionStore.canUseMenuRichContent)

const menuItems    = computed(() => store.menuItems.filter((i:any) => i.vendor_id === vendorId))

const addDialog    = ref(false)
const editDialog   = ref(false)
const itemToEdit   = ref<any>(null)
const itemToDelete = ref<any>(null)
const deleteDialog = ref(false)
const deleting     = ref(false)
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

const hasActiveFilters = computed(() => {
    return !!(searchQuery.value || selectedType.value)
})

const clearFilters = () => {
    searchQuery.value = ''
    selectedType.value = ''
}

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
    if (!itemToDelete.value) return
    
    deleting.value = true
    try {
        await store.deleteMenuItem(itemToDelete.value.id)
        
        if (itemToDelete.value.image_name) {
            await storageStore.deleteImage('menu_images', itemToDelete.value.image_name)
        }
        
        await resetFields('Deleted')
    } catch (error: any) {
        throwErr('Item Deletion', error.message || 'Failed to delete menu item')
    } finally {
        deleting.value = false
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
    showToast('success', 'Success', `Menu Item ${action}!`, 6000)
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

// Load menu items on mount if store is empty
onMounted(async () => {
    if (store.menuItems.length === 0) {
        try {
            // Get vendor ID from user's associated vendor
            const vendorId = user.value?.associated_vendor_id
            if (vendorId) {
                await store.loadMenuItems(vendorId)
            }
        } catch (error) {
            console.error('Error loading menu items:', error)
        }
    }
})
</script>

<style scoped>
/* Remove DataTable background - make it completely transparent */
:deep(.menu-data-table),
:deep(.menu-data-table .p-datatable-wrapper),
:deep(.menu-data-table .p-datatable-table),
:deep(.menu-data-table .p-datatable-thead),
:deep(.menu-data-table .p-datatable-thead > tr),
:deep(.menu-data-table .p-datatable-thead > tr > th),
/* Custom transparent datatable styling */
:deep(.menu-data-table .p-datatable-tbody),
:deep(.menu-data-table .p-datatable-tbody > tr),
:deep(.menu-data-table .p-datatable-tbody > tr > td) {
    background: transparent !important;
    background-color: transparent !important;
    border-color: var(--p-surface-border) !important;
}

:deep(.menu-data-table .p-datatable-thead > tr > th) {
    background: transparent !important;
    background-color: transparent !important;
    border-bottom: 1px solid var(--p-surface-border) !important;
}

:deep(.menu-data-table .p-datatable-tbody > tr:hover) {
    background: var(--p-surface-section) !important;
    background-color: var(--p-surface-section) !important;
}

/* Remove Dialog content border and background for menu forms */
:deep(.menu-dialog .p-dialog-content),
:deep(.menu-dialog .p-dialog-body) {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
}

@media (max-width: 768px) {
  :deep(.p-datatable) {
    font-size: 0.875rem;
  }
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
  }
}
</style>