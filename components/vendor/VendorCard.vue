<template>
  <v-card
    v-if="!isAdmin"
    :loading="loading"
    class="mx-auto my-12"
    max-width="800"
  >
    <v-toolbar color="#e28413" density="compact">
      <v-toolbar-title>{{ vendor.vendor_name }}</v-toolbar-title>
    </v-toolbar>
    <v-row>
      <v-col cols="4">
        <v-img
          v-if="vendor.avatar_url"
          height="250"
          :src="vendor.avatar_url"
        ></v-img>
        <Avatar v-else v-model:path="avatar_path" @upload="updateAvatar" bucketType="vendor" />
        </v-col>
      
      <v-col cols="8">
        <v-row class="mt-2">
          {{ vendor.vendor_description }}
        </v-row>

        <v-divider class="my-2" />

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
      </v-col>
    </v-row>
  </v-card>
  <v-card
      v-else
      :loading="loading"
      class="mx-auto my-12"
      max-width="800"
    >
      <v-toolbar color="#e28413" density="compact">
        <v-toolbar-title>
          <v-text-field density="compact" outlined v-model="vendor.vendor_name" placeholder="Merchant Name (e.g. 'McDonald's')"
          ></v-text-field>
        </v-toolbar-title>
      </v-toolbar>
      <v-row>
        <v-col cols="4">
          <v-img
            v-if="vendor.avatar_url"
            height="250"
            :src="vendor.avatar_url"
          ></v-img>
          <Avatar v-else v-model:path="avatar_path" @upload="updateAvatar" bucketType="vendor" />
        </v-col>
        
        <v-col cols="8">
          <v-row class="mt-2">
            <v-textarea density="compact" outlined v-model="vendor.vendor_description" placeholder="Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')"
              ></v-textarea>
          </v-row>

          <v-divider class="my-2" />

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
        </v-col>
      </v-row>
    </v-card>
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

if (data) {
  avatar_path.value = data.avatar_url
} else console.log(error)

loading.value = false


async function updateAvatar(e) {
  if (e) {
    try {
      loading.value = true

      const updates = {
        avatar_url: e,
        updated_at: new Date(),
      }

      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendor.value.id)

      if (error) throw error
    } catch (error) {
      alert(error.message)
    } finally {
      loading.value = false
    }
  }
}
loading.value = false
</script>

<style lang="scss" scoped></style>
