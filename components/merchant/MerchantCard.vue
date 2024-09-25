<template>
    <v-card
      :loading="loading"
      class="mx-auto my-12"
      max-width="800"
    >
    <v-toolbar color="#e28413" density="compact">
      <v-toolbar-title>{{ merchant.merchant_name }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-toolbar>
    <v-row>
      <v-col cols="4">
        <v-img
          v-if="merchant.avatar_url"
          height="250"
          :src="merchant.avatar_url"
        ></v-img>
        <Avatar v-else v-model:path="avatar_path" @upload="updateAvatar" bucketType="merchant" />
      </v-col>
      
      <v-col cols="8">
        <v-row class="mt-2">
          {{ merchant.merchant_description }}
        </v-row>

        <v-divider class="my-2" />

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
      </v-col>
    </v-row>
    </v-card>
</template>

<script setup>
const loading = ref(true)
const props = defineProps(['merchant']);
const merchant = ref(props.merchant)
const supabase = useSupabaseClient()

const avatar_path = ref('')

loading.value = true

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
