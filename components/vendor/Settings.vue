<template>
    <div>
      <Card style="overflow: hidden" class="ma-4">
          <template #content>
            <Tabs value="0">
              <TabList>
                  <Tab value="0">General Information</Tab>
                  <Tab value="1">Menu</Tab>
                  <Tab value="2">Associated Users</Tab>
              </TabList>
              <TabPanels>
                  <!-- GENERAL INFORMATION SETTINGS -->
                  <TabPanel value="0">
                    <v-row>
                        <v-col cols="4">
                          <img :src="imageUrl" alt="Image" class="w-full rounded" style="height: 60%;" />
                          <FileUpload
                            class="mt-2"
                            mode="basic"
                            accept="image/*"
                            :maxFileSize="1000000"
                            @upload="updateImage($event)"
                            :auto="true"
                            chooseLabel="Upload New Image"
                          />
                        </v-col>
                        <v-col cols="8">
                          <Fluid>
                            <span class="font-bold my-4 block">Vendor Information</span>
                            <div class="grid grid-cols-2 gap-4">
                                <!-- NAME -->
                                <div>
                                  <FloatLabel variant="on">
                                      <InputText id="name" v-model="vendor.vendor_name" :fluid="true" />
                                      <label for="name">Name</label>
                                  </FloatLabel>
                                </div>

                                <!-- CUISINE -->
                                <div>
                                    <FloatLabel variant="on">
                                        <MultiSelect
                                            id="cuisine"
                                            v-model="vendor.cuisine"
                                            display="chip"
                                            :options="cuisines"
                                            filter
                                            placeholder="Select Cuisine(s)"
                                            :maxSelectedLabels="3"
                                        />
                                        <label for="cuisine">Cuisine</label>
                                    </FloatLabel>
                                </div>

                                <!-- DESCRIPTION -->
                                <div class="col-span-full">
                                  <FloatLabel variant="on">
                                      <Textarea id="desc" v-model="vendor.vendor_description" rows="5" />
                                      <label for="desc">Description</label>
                                  </FloatLabel>
                                </div>

                                <!-- PHONE -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-phone" />
                                        <InputText id="phone" v-model="vendor.phone" placeholder="Phone" />
                                    </IconField>
                                    <label for="phone">Phone</label>
                                  </FloatLabel>
                                </div>

                                <!-- WEBSITE -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-link" />
                                        <InputText id="website" v-model="vendor.website" placeholder="Website" />
                                    </IconField>
                                    <label for="website">Website</label>
                                  </FloatLabel>
                                </div>

                                <!-- INSTAGRAM -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-instagram" />
                                        <InputText id="ig" v-model="vendor.instagram" placeholder="Instagram" />
                                    </IconField>
                                    <label for="ig">Instagram</label>
                                  </FloatLabel>
                                </div>

                                <!-- EMAIL -->
                                <div>
                                  <FloatLabel variant="on">
                                    <IconField>
                                        <InputIcon class="pi pi-envelope" />
                                        <InputText id="email" v-model="vendor.email" placeholder="Email" />
                                    </IconField>
                                    <label for="email">Email</label>
                                  </FloatLabel>
                                </div>
                            </div>
                          </Fluid>
                          <div class="flex justify-end gap-2 ma-4">
                              <Button type="button" label="Save Edits" @click="saveEdits" :loading="loading"></Button>
                          </div>
                        </v-col>
                    </v-row>
                  </TabPanel>

                  <!-- MENU SETTINGS -->
                  <TabPanel value="1">
                    <MenuTable />
                  </TabPanel>

                  <TabPanel value="2">
                      <AssociatedUsers :id="idParam" />
                  </TabPanel>
              </TabPanels>
            </Tabs>
          </template>
      </Card>

      <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />

      <v-snackbar v-model="snackbar" timeout="6000">
        {{ snacktext }}

        <template v-slot:actions>
            <v-btn
                color="#000022"
                variant="text"
                @click="snackbar = false"
            >Close</v-btn>
        </template>
      </v-snackbar>
    </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
import { v4 } from 'uuid';
const props = defineProps(['id'])
const vendorStore = useVendorStore()

const idParam    = ref(props.id)
const vendor     = ref(await vendorStore.getVendorById(idParam.value))
const editDialog = ref(false)
const snackbar   = ref(false)
const snacktext  = ref('')
const uploading  = ref(false)
const loading    = ref(false)

const errType = ref()
const errMsg = ref()
const errDialog = ref(false)

const imageUrl     = ref(vendor.value.avatar_url ? vendor.value.avatar_url : '')

const cuisines = ref([
    'Alcohol',
    'American',
    'Asian fusion',
    'Bakery',
    'Breaksfast',
    'Coffee',
    'Comfort food',
    'Dessert',
    'Healthy food',
    'Ice cream',
    'Italian',
    'Latin',
    'Mediterranean',
    'Mexican',
    'Pizza',
    'Sandwich',
    'Seafood',
    'Snacks',
    'Tacos',
    'Vegan'
])

const saveEdits = async () => {
  loading.value = true
  const updates = {
    updated_at: new Date(),
    vendor_name: vendor.value.vendor_name,
    cuisine: vendor.value.cuisine,
    vendor_description: vendor.value.vendor_description,
    phone: vendor.value.phone,
    website: vendor.value.website,
    instagram: vendor.value.instagram,
    email: vendor.value.email,
  }

  const { error } = await supabase.from('vendors').update(updates).eq('id', vendor.value.id)
  if (!error) {
      editDialog.value = false
      snacktext.value = 'Information Updated!'
      snackbar.value = true
  } else {
    errType.value = "Settings Update(s)"
    errMsg.value = error.message
    errDialog.value = true
  }
  loading.value = false
}

const updateImage = async (e: any) => {
    uploading.value = true
    const file = e.files[0]

    if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('vendor_avatars').upload(filePath, file)

            if (uploadError) {
              errType.value = 'Avatar Image Upload'
              errMsg.value = uploadError.message
              errDialog.value = true
            } else {
            const { data } = supabase.storage.from('vendor_avatars').getPublicUrl(filePath)
            if (data) {
              imageUrl.value = data.publicUrl

              const updates = {
                updated_at: new Date(),
                avatar_url: imageUrl.value,
              }

              const { error } = await supabase
                .from('vendors')
                .update(updates)
                .eq('id', vendor.value.id)
              
              if (!error) {
                snacktext.value = 'Vendor Avatar Updated!'
                snackbar.value = true
              } else {
                errType.value = 'Avatar Image Update'
                errMsg.value = error.message
                errDialog.value = true
              }
            }
        }
    }
    uploading.value = false
}
</script>