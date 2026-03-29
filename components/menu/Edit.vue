<template>
    <div>
        <div class="space-y-6">
            <Message
                v-if="!canUseMenuRichContent && hasExistingRichContent"
                severity="warn"
                :closable="false"
                class="text-sm"
            >
                This item includes photos or descriptions from a previous plan. Upgrade to Pro or Premium to edit
                those fields again. You can still update name, category, and price.
            </Message>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Image Section (Pro / Premium) -->
                <div v-if="canUseMenuRichContent" class="space-y-4">
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
                            @select="(e) => updateImage(e, item.image_name)"
                            chooseLabel="Upload Image"
                            class="w-full"
                        />
                        <div v-if="storageStore.uploading" class="flex justify-center mt-2">
                            <ProgressSpinner />
                        </div>
                    </div>
                </div>
                <div v-else-if="item.image_url" class="space-y-4">
                    <p class="text-sm text-text-muted">Image (view only on Free)</p>
                    <NuxtImg
                        :src="item.image_url"
                        alt="Menu item image"
                        class="w-full aspect-square rounded-lg object-cover border border-surface-border"
                    />
                </div>
                <!-- Form Fields -->
                <div :class="canUseMenuRichContent || item.image_url ? 'md:col-span-2' : 'md:col-span-3'" class="space-y-4">
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
                    <div v-if="canUseMenuRichContent">
                        <label class="block text-sm font-medium text-text-main mb-2">Description</label>
                        <div class="space-y-3">
                            <Textarea 
                                id="desc" 
                                v-model="item.description" 
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
                                :disabled="!item.name"
                            />
                            <small v-if="!item.name" class="text-text-muted">
                                Enter an item name to enable AI description generation
                            </small>
                        </div>
                    </div>
                    <div v-else-if="item.description" class="rounded-lg border border-surface-border p-3 bg-surface-ground">
                        <p class="text-xs font-medium text-text-muted mb-1">Description (view only on Free)</p>
                        <p class="text-sm text-text-main whitespace-pre-wrap">{{ item.description }}</p>
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
                    <div v-if="canUseMenuRichContent" class="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="special" 
                            v-model="item.special" 
                            class="w-4 h-4 rounded border-surface-border"
                        />
                        <label for="special" class="text-sm text-text-main">Seasonal/Limited Edition</label>
                    </div>
                    <div v-else-if="item.special" class="text-sm text-text-muted">
                        Marked as seasonal/special (upgrade to edit)
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
    const props       = defineProps(['item', 'vendor'])
    const emit        = defineEmits(['edited', 'errored'])
    const menuStore   = useMenuStore()
    const storageStore = useStorageStore()
    const subscriptionStore = useSubscriptionStore()
    const canUseMenuRichContent = computed(() => subscriptionStore.canUseMenuRichContent)
    const hasExistingRichContent = computed(() => {
        const i = item.value
        return !!(
            (i.description && String(i.description).trim()) ||
            (i.image_url && String(i.image_url).trim()) ||
            i.special === true
        )
    })
    const { generateDescription, generatingDescription } = useMenu()
    const item         = ref({ ...props.item })
    const errDialog    = ref(false)
    const errType      = ref()
    const errMsg       = ref()
    const loading      = ref(false)
    const filteredCategories = ref<string[]>([])

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

    watch(
        () => props.item,
        (next) => {
            if (next) item.value = { ...next }
        },
        { deep: true }
    )

    const submitEdits = async () => {
        loading.value = true
        const itemObj: Record<string, unknown> = {
            name: item.value.name,
            type: item.value.type,
            price: item.value.price,
            special: item.value.special,
            updated_at: new Date().toISOString(),
            description: item.value.description,
            image_url: item.value.image_url,
            image_name: item.value.image_name
        }

        try {
            await menuStore.updateMenuItem(item.value.id, itemObj as any)
            emit('edited', 'Edited')
        } catch (error: any) {
            emit('errored', error.message || 'Failed to update menu item')
        } finally {
            loading.value = false
        }
    }

    const updateImage = async (e: any, prevFile: any) => {
        if (!canUseMenuRichContent.value) {
            throwErr('Menu', 'Photos are available on Pro and Premium plans.')
            return
        }
        const file = e?.files?.[0]
        const oldFileName = prevFile

        if (file) {
            await storageStore.editImage('menu_images', file, oldFileName, {
                onSuccess: async (publicUrl, fileName) => {
                    item.value.image_url = publicUrl
                    item.value.image_name = fileName
                    
                    await menuStore.updateMenuItem(item.value.id, { 
                        image_url: publicUrl, 
                        image_name: fileName 
                    })
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
            const result = await generateDescription(item.value.name)
            if (result) item.value.description = result
        } catch (error: any) {
            throwErr('Description Generation', error.message || 'Failed to generate description')
        }
    }
</script>

<style scoped>

</style>