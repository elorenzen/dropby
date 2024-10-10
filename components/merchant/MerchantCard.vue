<template>
    <Card v-if="!isAdmin" style="overflow: hidden">
        <template #header>
            <img alt="user header" :src="merchant.avatar_url" />
        </template>
        <template #title>{{ merchant.merchant_name }}</template>
        <template #subtitle>{{ merchant.merchant_description }}</template>
        <template #content>
          <v-row>
            <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2" readonly>
              <template v-slot:prepend><v-icon></v-icon></template>
              <NuxtLink>{{ merchant.formatted_address ? merchant.formatted_address : 'No address on file' }}</NuxtLink>
            </v-btn>
          </v-row>
          <v-row>
            <v-btn prepend-icon="mdi-phone" variant="plain" readonly>
              <template v-slot:prepend><v-icon></v-icon></template>
              <NuxtLink>{{ merchant.phone }}</NuxtLink>
            </v-btn>
          </v-row>
          <v-row>
            <v-btn prepend-icon="mdi-web" variant="plain">
              <template v-slot:prepend><v-icon></v-icon></template>
              <NuxtLink :to="merchant.website" target="_blank">Website</NuxtLink>
            </v-btn>
          </v-row>
          <v-row>
            <v-btn prepend-icon="mdi-instagram" variant="plain">
              <template v-slot:prepend><v-icon></v-icon></template>
              <NuxtLink :to="merchant.instagram" target="_blank">Instagram</NuxtLink>
            </v-btn>
          </v-row>
          <v-row>
            <v-btn prepend-icon="mdi-email" variant="plain">
              <template v-slot:prepend><v-icon></v-icon></template>
              <NuxtLink :to="`mailto:${merchant.email}`" target="_blank">Email</NuxtLink>
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
            <img alt="user header" :src="merchant.avatar_url" />
        </template>
        <template #title>
          <v-text-field density="compact" outlined v-model="merchant.merchant_name" placeholder="Merchant Name (e.g. 'McDonald's')"></v-text-field>
        </template>
        <template #subtitle>
          <v-textarea density="compact" outlined v-model="merchant.merchant_description" placeholder="Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')"
              ></v-textarea>
        </template>
        <template #content>

          <!-- <v-row>
            <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2" readonly>
              <template v-slot:prepend><v-icon></v-icon></template>
              <NuxtLink>{{ merchant.formatted_address ? merchant.formatted_address : 'No address on file' }}</NuxtLink>
            </v-btn>
          </v-row> -->
          <v-row>
            <v-text-field
              prepend-icon="mdi-phone"
              density="compact"
              outlined
              v-model="merchant.phone"
              placeholder="Contact Phone"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              prepend-icon="mdi-web"
              density="compact"
              outlined
              v-model="merchant.website"
              placeholder="Website URL"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              prepend-icon="mdi-instagram"
              density="compact"
              outlined
              v-model="merchant.instagram"
              placeholder="Instagram Link (optional)"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              prepend-icon="mdi-email"
              density="compact"
              outlined
              v-model="merchant.email"
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
const props = defineProps(['merchant']);
const merchant = ref(props.merchant)
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
      foundUser.associated_merchant_id == merchant.value.id
    ) isAdmin.value = true
    console.log('admin value: ', isAdmin.value)
  }
  console.log('sessionUser: ', sessionUser.value)
})

const { data, error } = await supabase
  .from('merchants')
  .select(`id, avatar_url`)
  .eq('id', merchant.value.id)
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
        .from('merchants')
        .update(updates)
        .eq('id', merchant.value.id)

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
