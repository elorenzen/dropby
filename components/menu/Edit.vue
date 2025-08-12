<template>
    <div>
        <Card style="overflow: hidden;">
            <template #content>
                <v-row>
                    <v-col cols="4">
                        <Avatar v-if="item.image_url == ''" icon="pi pi-image" class="mr-2" size="xlarge" />
                        <NuxtImg v-else :src="item.image_url" alt="Image" class="w-full rounded" />
                        
                        <v-row dense class="flex justify-center p-2 m-2">
                            <FileUpload
                                class="my-2 p-button-sm p-button-outlined"
                                mode="basic"
                                accept="image/*"
                                :maxFileSize="1000000"
                                @upload="updateImage($event, item.image_name)"
                                :auto="true"
                                chooseLabel="Upload Image"
                            />
                            <Button
                                size="small"
                                label="Generate Image"
                                icon="pi pi-microchip-ai"
                                iconPos="left"
                                class="p-button-outlined"
                                @click="generateImage"
                                :loading="loadingImg"
                            />
                            <div v-if="uploading" class="card flex justify-center mt-4">
                                <ProgressSpinner class="p-progress-spinner-circle" />
                            </div>
                        </v-row>
                    </v-col>
                    <v-col cols="8">
                        <Fluid>
                            <div class="my-2">
                                <FloatLabel variant="on">
                                    <InputText id="item_name" v-model="item.name" />
                                    <label for="item_name">Item Name</label>
                                </FloatLabel>
                            </div>
                            <div class="my-2">
                                <AutoComplete v-model="item.type" :suggestions="['Appetizer', 'Entree', 'Dessert', 'Side', 'Beverage']" placeholder="Menu Category"></AutoComplete>
                            </div>
                            <div class="my-2">
                                <FloatLabel variant="on">
                                    <Textarea id="desc" v-model="item.description" rows="5" cols="50" style="resize: none" />
                                    <label for="desc">Description</label>
                                </FloatLabel>
                            </div>
                            <div class="my-2">
                                <FloatLabel variant="on">
                                    <InputNumber v-model="item.price" inputId="item_price" mode="currency" currency="USD" locale="en-US" />
                                    <label for="item_price">Price</label>
                                </FloatLabel>
                            </div>
                            <div class="ma-2">
                                <v-switch density="compact" label="Seasonal/Limited Edition" v-model="item.special"></v-switch>
                            </div>
                        </Fluid>
                    </v-col>
                </v-row>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2 ma-4">
                    <Button @click="submitEdits" class="w-full" :loading="loading">Submit Edits</Button>
                </div>
            </template>
        </Card>
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
                const { error: dbErr } = await supabase
                    .from('menu_items')
                    .update({ image_url: data.publicUrl, image_name: filePath })
                    .eq('id', item.value.id)
                
                // 3. Finally, delete old file from storage
                if (!dbErr) {
                    const { error: storageDeleteErr } = await supabase
                        .storage
                        .from('menu_images')
                        .remove([oldFileName])
                    
                    if (storageDeleteErr) throwErr('Menu Item Image Upload', storageDeleteErr.message)
                }
            } else throwErr('Menu Item Image Upload', uploadError.message)
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