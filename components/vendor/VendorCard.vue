<template>
  <div>
  <Card v-if="storeUser && storeUser.is_admin && storeUser.type == 'vendor'" style="overflow: hidden">
      <template #header>
        <v-row dense class="pa-2">
            <v-col cols="6">
              <img :src="imageUrl" />
            </v-col>
            <v-col>
                <v-file-input
                    :label="uploading ? 'Uploading ...' : 'Upload New Image'"
                    @change="updateImage"
                    :disabled="uploading"
                ></v-file-input>
            </v-col>
        </v-row>  
      </template>
      <template #title>
        <v-row>
          <v-col cols="7">
            <v-text-field density="compact" outlined v-model="vendor.vendor_name" placeholder="Vendor Name (e.g. 'McDonald's')"></v-text-field>
          </v-col>
          <v-col cols="5">
              <MultiSelect v-model="vendor.cuisine" display="chip" :options="cuisines" filter placeholder="Select Cuisine(s)"
              :maxSelectedLabels="3" class="w-full md:w-80" />
          </v-col>
        </v-row>
      </template>
      <template #subtitle>
        <v-textarea density="compact" outlined v-model="vendor.vendor_description" placeholder="Vendor Desciption (e.g. 'Fast food restaurant selling burgers & fries.')"
            ></v-textarea>
      </template>
      <template #content>
        <!-- <v-row>
          <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2" readonly>
            <template v-slot:prepend><v-icon></v-icon></template>
            <NuxtLink>{{ vendor.formatted_address ? vendor.formatted_address : 'No address on file' }}</NuxtLink>
          </v-btn>
        </v-row> -->
        <v-row>
          <v-text-field
            prepend-icon="mdi-phone"
            density="compact"
            outlined
            v-model="vendor.phone"
            placeholder="Contact Phone"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            prepend-icon="mdi-web"
            density="compact"
            outlined
            v-model="vendor.website"
            placeholder="Website URL"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            prepend-icon="mdi-instagram"
            density="compact"
            outlined
            v-model="vendor.instagram"
            placeholder="Instagram Link (optional)"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            prepend-icon="mdi-email"
            density="compact"
            outlined
            v-model="vendor.email"
            placeholder="Contact Email"
          ></v-text-field>
        </v-row>
      </template>
      <!-- <template #footer>
          <div class="flex gap-4 mt-1">
              <Button label="Cancel" severity="secondary" outlined class="w-full" />
              <Button label="Save" class="w-full" />
          </div>
      </template> -->
  </Card>
  <Card v-else style="overflow: hidden">
      <template #header>
          <img alt="user header" :src="vendor.avatar_url" />
      </template>
      <template #title>{{ vendor.vendor_name }}</template>
      <template #subtitle>{{ vendor.vendor_description }}</template>
      <template #content>
        <v-row>
          <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2" readonly>
            <template v-slot:prepend><v-icon></v-icon></template>
            <NuxtLink>{{ vendor.formatted_address ? vendor.formatted_address : 'No address on file' }}</NuxtLink>
          </v-btn>
        </v-row>
        <v-row>
          <v-btn prepend-icon="mdi-phone" variant="plain" readonly>
            <template v-slot:prepend><v-icon></v-icon></template>
            <NuxtLink>{{ vendor.phone }}</NuxtLink>
          </v-btn>
        </v-row>
        <v-row>
          <v-btn prepend-icon="mdi-web" variant="plain">
            <template v-slot:prepend><v-icon></v-icon></template>
            <NuxtLink :to="vendor.website" target="_blank">Website</NuxtLink>
          </v-btn>
        </v-row>
        <v-row>
          <v-btn prepend-icon="mdi-instagram" variant="plain">
            <template v-slot:prepend><v-icon></v-icon></template>
            <NuxtLink :to="vendor.instagram" target="_blank">Instagram</NuxtLink>
          </v-btn>
        </v-row>
        <v-row>
          <v-btn prepend-icon="mdi-email" variant="plain">
            <template v-slot:prepend><v-icon></v-icon></template>
            <NuxtLink :to="`mailto:${vendor.email}`" target="_blank">Email</NuxtLink>
          </v-btn>
        </v-row>
      </template>
      <!-- <template #footer>
          <div class="flex gap-4 mt-1">
              <Button label="Cancel" severity="secondary" outlined class="w-full" />
              <Button label="Save" class="w-full" />
          </div>
      </template> -->
  </Card>

  <v-snackbar
    v-model="snackbar"
    timeout="6000"
  >
    {{ snacktext }}

    <template v-slot:actions>
      <v-btn
        color="#000022"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
  </div>
</template>

<script setup>
import { v4 } from 'uuid'
const props = defineProps(['vendor']);
const vendor = ref(props.vendor)
const store = useUserStore()
const supabase = useSupabaseClient()
const storeUser = store.user
const uploading = ref(false)

const imageUrl = ref(props.vendor.avatar_url ? props.vendor.avatar_url : '')

const snackbar = ref(false)
const snacktext = ref('')

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
    'mediterranean',
    'Mexican',
    'Pizza',
    'Sandwich',
    'Seafood',
    'Snacks',
    'Tacos',
    'Vegan'
])

const updateImage = async (e) => {
    uploading.value = true
    const file = e.target.files[0]

    if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${v4()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('vendor_avatars').upload(filePath, file)

        if (uploadError) console.error(uploadError)
        else {
            const { data } = supabase.storage.from('vendor_avatars').getPublicUrl(filePath)
            if (data) {
              imageUrl.value = data.publicUrl

              const { error } = await supabase
                .from('vendors')
                .update({
                    updated_at: new Date(),
                    avatar_url: imageUrl.value,
                })
                .eq('id', vendor.value.id)
              
              if (!error) {
                snacktext.value = 'Vendor Avatar Updated!'
                snackbar.value = true
              }
            }
        }
    }
    uploading.value = false
}
</script>

<style lang="scss" scoped></style>
