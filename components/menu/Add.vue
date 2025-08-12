<template>
    <div>
        <Card style="overflow: hidden;">
            <template #content>
                <v-row>
                    <v-col cols="4">
                        <NuxtImg
                            :src="imageUrl"
                            class="rounded w-full"
                            :height="200"
                            :width="200"
                            sizes="sm:75px md:150px lg:200px"    
                        />
                        <v-row dense class="flex justify-center p-2 m-2">
                            <FileUpload
                                class="my-2 p-button-sm p-button-outlined"
                                mode="basic"
                                accept="image/*"
                                :maxFileSize="1000000"
                                @upload="addImage($event)"
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
                                    <InputText id="item_name" v-model="name" />
                                    <label for="item_name">Item Name</label>
                                </FloatLabel>
                            </div>
                            <div class="my-2">
                                <AutoComplete v-model="type" :suggestions="['Appetizer', 'Entree', 'Dessert', 'Side', 'Beverage']" placeholder="Menu Category"></AutoComplete>
                            </div>
                            <div class="my-2">
                                <FloatLabel variant="on">
                                    <Textarea id="desc" v-model="description" rows="5" cols="50" style="resize: none" />
                                    <label for="desc">Description</label>
                                </FloatLabel>
                                <Button
                                    size="small"
                                    label="Generate Description"
                                    icon="pi pi-microchip-ai"
                                    iconPos="left"
                                    class="p-button-outlined"
                                    @click="generateDescription"
                                    :loading="loadingDesc"
                                />
                            </div>
                            <div class="my-2">
                                <FloatLabel variant="on">
                                    <InputNumber v-model="price" inputId="item_price" mode="currency" currency="USD" locale="en-US" />
                                    <label for="item_price">Price</label>
                                </FloatLabel>
                            </div>
                            <div class="ma-2">
                                <v-switch density="compact" label="Seasonal/Limited Edition" v-model="special"></v-switch>
                            </div>
                        </Fluid>
                    </v-col>
                </v-row>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2 ma-4">
                    <Button class="w-full" @click="addItem" :loading="loading">Save</Button>
                </div>  
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
    import { v4 } from 'uuid'
    const props       = defineProps(['id', 'vendor'])
    const emit        = defineEmits(['created', 'errored'])
    const menuStore   = useMenuStore()
    const name        = ref()
    const description = ref()
    const type        = ref()
    const imageUrl    = ref('https://ionicframework.com/docs/img/demos/card-media.png')
    const imageName   = ref()
    const price       = ref(0)
    const special     = ref(false)
    const uploading   = ref(false)
    const loading     = ref(false)
    const errType     = ref()
    const errMsg      = ref()
    const errDialog   = ref(false)
    const loadingDesc = ref(false)
    const loadingImg  = ref(false)

    const addItem = async () => {
        loading.value = true
        const itemObj = {
            id: v4(),
            vendor_id: props.vendor,
            creator_id: props.id,
            name: name.value,
            description: description.value,
            type: type.value, // 'appetizer', 'entree', etc.,
            image_url: imageUrl.value,
            image_name: imageName.value,
            created_at: new Date(),
            updated_at: new Date(),
            price: price.value,
            special: special.value // default: FALSE, set to TRUE if item is seasonal/limited edition
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
        uploading.value = true
        const file = e.files[0]

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${v4()}.${fileExt}`
            imageName.value = fileName
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage.from('menu_images').upload(filePath, file)

            if (!uploadError) {
                const { data } = supabase.storage.from('menu_images').getPublicUrl(filePath)
                if (data) imageUrl.value = data.publicUrl
            } else throwErr('Menu Item Image Upload', uploadError.message)
        }
        uploading.value = false
    }
    const throwErr = (title: any, msg: any) => {
        errType.value = title
        errMsg.value = msg
        errDialog.value = true
    }
    const generateDescription = async () => {
        loadingDesc.value = true
        const response = await useFetch(`/api/generateMenuItemDescription?string=${name.value}`)
        if (response.data.value) description.value = response.data.value
        loadingDesc.value = false
    }
    const generateImage = async () => {
        loadingImg.value = true
        const response = await useFetch(`/api/generateImage?string=${name.value}`)
        if (response.data.value) imageUrl.value = response.data.value
        loadingImg.value = false
    }
</script>

<style scoped>

</style>