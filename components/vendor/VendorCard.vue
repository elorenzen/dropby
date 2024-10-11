<template>
  <Card v-if="!isAdmin" style="overflow: hidden">
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

  <Card v-else style="overflow: hidden">
      <template #header>
          <img alt="user header" :src="vendor.avatar_url" />
      </template>
      <template #title>
        <v-text-field density="compact" outlined v-model="vendor.vendor_name" placeholder="Vendor Name (e.g. 'McDonald's')"></v-text-field>
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
</template>

<script setup>
const loading = ref(true)
const props = defineProps(['vendor']);
const vendor = ref(props.vendor)
const supabase = useSupabaseClient()
const sessionUser = useSupabaseUser()
const isAdmin = ref(false)
const avatar_path = ref('')

onMounted(async () => {
  if (sessionUser) {
    const { data } = await supabase
      .from('users')
      .select()
      .eq('id', sessionUser.value.id)
    const foundUser = data[0]
    console.log(foundUser)
    if (
      foundUser &&
      foundUser.is_admin &&
      foundUser.associated_vendor_id == vendor.value.id
    ) isAdmin.value = true
  }
})

const { data, error } = await supabase
  .from('vendors')
  .select(`id, avatar_url`)
  .eq('id', vendor.value.id)
  .single()

if (data) avatar_path.value = data.avatar_url
else console.log(error)

loading.value = false
</script>

<style lang="scss" scoped></style>
