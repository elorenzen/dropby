<template>
    <div>
        <Card style="overflow: hidden;">
            <template #content>
                <v-row>
                    <v-col cols="4">
                        <Avatar v-if="item.image_url == ''" icon="pi pi-image" class="mr-2" size="xlarge" />
                        <img v-else :src="item.image_url" alt="Image" class="w-full rounded" />
                        
                        <FileUpload
                            class="mt-2"
                            mode="basic"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @upload="updateImage($event, item.image_name)"
                            :auto="true"
                            chooseLabel="Upload Image"
                        />
                        <div v-if="uploading" class="card flex justify-center mt-4">
                            <ProgressSpinner class="p-progress-spinner-circle" />
                        </div>
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
                <v-row class="pa-2">
                    <Button @click="submitEdits" block :loading="loading">Submit Edits</Button>
                </v-row>
            </template>
        </Card>
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    </div>
</template>

<script setup lang="ts">
    import { v4 } from 'uuid'
    const supabase    = useSupabaseClient()
    const props       = defineProps(['item', 'vendor'])
    const emit        = defineEmits(['edited', 'errored'])
    const item         = ref(props.item)
    const errDialog    = ref(false)
    const errType      = ref()
    const errMsg       = ref()
    const loading      = ref(false)
    const uploading    = ref(false)

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

        const { error } = await supabase
            .from('menu_items')
            .update(itemObj)
            .eq('id', item.value.id)
        loading.value = false
        if (!error) emit('edited', 'Edited')
        else emit('errored', error.message)
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
</script>

<style scoped>

</style>