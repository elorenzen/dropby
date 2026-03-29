<template>
    <div>
        <div class="space-y-6">
            <Message
                v-if="!canUseMenuRichContent"
                severity="info"
                :closable="false"
                class="text-sm"
            >
                Free plan includes a simple menu (name, price & category). Upgrade to Pro or Premium for photos,
                descriptions, and seasonal items.
            </Message>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Image Section (Pro / Premium) -->
                <div v-if="canUseMenuRichContent" class="space-y-4">
                    <div class="relative">
                        <NuxtImg
                            v-if="imageUrl"
                            :src="imageUrl"
                            class="rounded-lg w-full aspect-square object-cover border border-surface-border"
                            sizes="sm:150px md:200px lg:250px"
                        />
                        <div
                            v-else
                            class="rounded-lg w-full aspect-square border border-dashed border-surface-border bg-surface-ground flex items-center justify-center text-text-muted text-sm"
                        >
                            No image
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <FileUpload
                            mode="basic"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @select="addImage"
                            chooseLabel="Upload Image"
                            class="w-full"
                        />
                        <div v-if="storageStore.uploading" class="flex justify-center mt-2">
                            <ProgressSpinner />
                        </div>
                    </div>
                </div>
                <!-- Form Fields -->
                <div :class="canUseMenuRichContent ? 'md:col-span-2' : 'md:col-span-3'" class="space-y-4">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-text-main mb-2">Item Name *</label>
                            <InputText 
                                id="item_name" 
                                v-model="name" 
                                class="w-full"
                                placeholder="Enter item name"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-text-main mb-2">Menu Category *</label>
                            <AutoComplete 
                                v-model="type" 
                                :suggestions="filteredCategories" 
                                @complete="searchCategories"
                                placeholder="Select category"
                                class="w-full"
                            />
                        </div>
                        <div v-if="canUseMenuRichContent">
                            <label class="block text-sm font-medium text-text-main mb-2">Description</label>
                            <div class="space-y-3">
                                <Textarea 
                                    id="desc" 
                                    v-model="description" 
                                    rows="4" 
                                    class="w-full resize-none"
                                    placeholder="Add a description and click 'Generate' to enhance it with AI, or write your own..."
                                />
                                <Button
                                    label="Generate with AI"
                                    icon="pi pi-microchip-ai"
                                    iconPos="left"
                                    class="w-full"
                                    @click="handleGenerateDescription"
                                    :loading="generatingDescription"
                                    :disabled="!name"
                                />
                                <small v-if="!name" class="text-text-muted">
                                    Enter an item name to enable AI description generation
                                </small>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-text-main mb-2">Price *</label>
                            <InputNumber 
                                v-model="price" 
                                inputId="item_price" 
                                mode="currency" 
                                currency="USD" 
                                locale="en-US"
                                class="w-full"
                                :min="0"
                            />
                        </div>
                        <div v-if="canUseMenuRichContent" class="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="special" 
                                v-model="special" 
                                class="w-4 h-4 rounded border-surface-border"
                            />
                            <label for="special" class="text-sm text-text-main">Seasonal/Limited Edition</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t border-surface-border">
                <Button class="px-8 py-3 font-semibold rounded-lg" @click="addItem" :loading="loading">Save</Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { v4 } from 'uuid'
    const props       = defineProps(['id', 'vendor'])
    const emit        = defineEmits(['created', 'errored'])
    const menuStore   = useMenuStore()
    const storageStore = useStorageStore()
    const subscriptionStore = useSubscriptionStore()
    const canUseMenuRichContent = computed(() => subscriptionStore.canUseMenuRichContent)
    const { generateDescription, generatingDescription } = useMenu()
    const name        = ref()
    const description = ref()
    const type        = ref()
    const imageUrl    = ref('')
    const imageName   = ref()
    const price       = ref(0)
    const special     = ref(false)
    const loading     = ref(false)
    const errType     = ref()
    const errMsg      = ref()
    const errDialog   = ref(false)
    const filteredCategories = ref<string[]>([])

    // Get categories from menu store
    const allCategories = computed(() => {
        const storeTypes = menuStore.getTypes
        return storeTypes && storeTypes.length > 0 
            ? storeTypes 
            : ['Appetizer', 'Entree', 'Dessert', 'Side', 'Beverage']
    })

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
        filteredCategories.value = allCategories.value
    })

    const addItem = async () => {
        loading.value = true
        const itemObj = {
            id: v4(),
            vendor_id: props.vendor,
            creator_id: props.id,
            name: name.value,
            description: description.value,
            type: type.value,
            image_url: imageUrl.value || null,
            image_name: imageName.value || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            price: price.value,
            special: special.value
        }
        try {
            await menuStore.createMenuItem(itemObj)
            emit('created', 'Created')
        } catch (error: any) {
            emit('errored', error.message || 'Failed to create menu item')
        }
        loading.value = false
    }
    const addImage = async (e: any) => {
        if (!canUseMenuRichContent.value) {
            throwErr('Menu', 'Photos are available on Pro and Premium plans.')
            return
        }
        const file = e?.files?.[0]
        
        if (file) {
            await storageStore.addImage('menu_images', file, {
                onSuccess: (publicUrl, fileName) => {
                    imageUrl.value = publicUrl
                    imageName.value = fileName
                },
                onError: (error) => {
                    throwErr('Menu Item Image Upload', error.message)
                }
            })
        }
    }
    const throwErr = (title: any, msg: any) => {
        errType.value = title
        errMsg.value = msg
        errDialog.value = true
    }
    const handleGenerateDescription = async () => {
        try {
            const result = await generateDescription(name.value)
            if (result) description.value = result
        } catch (error: any) {
            throwErr('Description Generation', error.message || 'Failed to generate description')
        }
    }
</script>

<style scoped>

</style>