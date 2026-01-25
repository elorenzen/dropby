<template>
    <div>
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Image Section -->
                <div class="space-y-4">
                    <div class="relative">
                        <Avatar v-if="!item.image_url" icon="pi pi-image" size="xlarge" class="w-full aspect-square" />
                        <NuxtImg 
                            v-else 
                            :src="item.image_url" 
                            alt="Menu item image" 
                            class="w-full aspect-square rounded-lg object-cover border border-surface-border"
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <FileUpload
                            mode="basic"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @upload="updateImage($event, item.image_name)"
                            :auto="true"
                            chooseLabel="Upload Image"
                            class="w-full"
                        />
                        <Button
                            label="Generate Image"
                            icon="pi pi-microchip-ai"
                            iconPos="left"
                            outlined
                            size="small"
                            class="w-full"
                            @click="generateImage"
                            :loading="loadingImg"
                        />
                        <div v-if="uploading" class="flex justify-center mt-2">
                            <ProgressSpinner />
                        </div>
                    </div>
                </div>
                <!-- Form Fields -->
                <div class="md:col-span-2 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-text-main mb-2">Item Name *</label>
                        <InputText 
                            id="item_name" 
                            v-model="item.name" 
                            class="w-full"
                            placeholder="Enter item name"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-text-main mb-2">Menu Category *</label>
                        <AutoComplete 
                            v-model="item.type" 
                            :suggestions="filteredCategories" 
                            @complete="searchCategories"
                            placeholder="Select category"
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-text-main mb-2">Description</label>
                        <Textarea 
                            id="desc" 
                            v-model="item.description" 
                            rows="4" 
                            class="w-full resize-none"
                            placeholder="Describe your menu item..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-text-main mb-2">Price *</label>
                        <InputNumber 
                            v-model="item.price" 
                            inputId="item_price" 
                            mode="currency" 
                            currency="USD" 
                            locale="en-US"
                            class="w-full"
                            :min="0"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="special" 
                            v-model="item.special" 
                            class="w-4 h-4 rounded border-surface-border"
                        />
                        <label for="special" class="text-sm text-text-main">Seasonal/Limited Edition</label>
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t border-surface-border">
                <Button 
                    @click="submitEdits" 
                    class="px-8 py-3 font-semibold rounded-lg" 
                    :loading="loading"
                >
                    Submit Edits
                </Button>
            </div>
        </div>
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    </div>
</template>

<script setup lang="ts">
    import { v4 } from 'uuid'
    const props       = defineProps(['item', 'vendor'])
    const emit        = defineEmits(['edited', 'errored'])
    const menuStore   = useMenuStore()
    const item         = ref(props.item)
    const errDialog    = ref(false)
    const errType      = ref()
    const errMsg       = ref()
    const loading      = ref(false)
    const uploading    = ref(false)
    const loadingImg   = ref(false)
    const filteredCategories = ref<string[]>([])

    // Get categories from menu store
    const allCategories = computed(() => {
        const storeTypes = menuStore.getTypes
        // Fallback to default categories if store is empty
        return storeTypes && storeTypes.length > 0 
            ? storeTypes 
            : ['Appetizer', 'Entree', 'Dessert', 'Side', 'Beverage']
    })

    // Filter categories based on search query
    const searchCategories = (event: any) => {
        const query = event.query.toLowerCase()
        if (!query) {
            filteredCategories.value = allCategories.value
        } else {
            filteredCategories.value = allCategories.value.filter((category: string) =>
                category.toLowerCase().includes(query)
            )
        }
    }

    onMounted(() => {
        // Initialize with all categories
        filteredCategories.value = allCategories.value
    })

    const submitEdits = async () => {
        loading.value = true
        const itemObj = {
            name: item.value.name,
            description: item.value.description,
            category: item.value.category,
            image_url: item.value.image_url,
            image_name: item.value.image_name,
            type: item.value.type,
            qty: item.value.qty,
            updated_at: new Date(),
            price: item.value.price,
            status: item.value.status
        }

        try {
            await menuStore.updateMenuItem(item.value.id, itemObj)
            emit('edited', 'Edited')
        } catch (error: any) {
            emit('errored', error.message || 'Failed to update menu item')
        } finally {
            loading.value = false
        }
    }

    const updateImage = async (e: any, prevFile: any) => {
        uploading.value = true
        const file = e.files[0]
        const oldFileName = prevFile

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${v4()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage.from('menu_images').upload(filePath, file)

            if (!uploadError) {
                // 1. Upload new file to storage
                const { data } = supabase.storage.from('menu_images').getPublicUrl(filePath)
                if (data) item.value.image_url = data.publicUrl

                // 2. Replace fields on menu document in Db
                const menuStore = useMenuStore()
                await menuStore.updateMenuItem(item.value.id, { 
                  image_url: data.publicUrl, 
                  image_name: filePath 
                })
                
                // 3. Finally, delete old file from storage
                try {
                    const { error: storageDeleteErr } = await supabase
                        .storage
                        .from('menu_images')
                        .remove([oldFileName])
                    
                    if (storageDeleteErr) throwErr('Menu Item Image Upload', storageDeleteErr.message)
                } catch (storageError: any) {
                    console.error('Error deleting old file:', storageError)
                }
            } else {
                throwErr('Menu Item Image Upload', uploadError.message)
            }
        }
        uploading.value = false
    }
    const throwErr = (title: any, msg: any) => {
        errType.value = title
        errMsg.value = msg
        errDialog.value = true
    }
    const generateImage = async () => {
        loadingImg.value = true
        const response = await useFetch(`/api/generateImage?string=${item.value.name}`)
        if (response.data.value) item.value.image_url = response.data.value
        loadingImg.value = false
    }   
</script>

<style scoped>

</style>