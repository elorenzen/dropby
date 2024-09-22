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
      <!-- <template slot="progress">
        <v-progress-linear
          color="deep-purple"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>
  
      <v-img
        height="250"
        src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
      ></v-img>
      <v-card-title>{{ merchant.merchant_name }}</v-card-title>
  
      <v-card-text>
        <v-row
          class="mx-0 align-middle"
        >
          <v-rating
            :value="4.5"
            color="amber"
            dense
            half-increments
            readonly
            size="14"
          ></v-rating>
  
          <div class="grey--text ms-4">
            4.5 (413)
          </div>
        </v-row>
  
        <div class="my-4 text-subtitle-1">
          $ • Italian, Cafe
        </div>
  
        <div>Small plates, salads & sandwiches - an intimate setting with 12 indoor seats plus patio seating.</div>
      </v-card-text>
  
      <v-divider class="mx-4"></v-divider>
  
      <v-card-title>Tonight's availability</v-card-title>
  
      <v-card-text>
        <v-chip-group
          v-model="selection"
          active-class="deep-purple accent-4 white--text"
          column
        >
          <v-chip>5:30PM</v-chip>
  
          <v-chip>7:30PM</v-chip>
  
          <v-chip>8:00PM</v-chip>
  
          <v-chip>9:00PM</v-chip>
        </v-chip-group>
      </v-card-text>
  
      <v-card-actions>
        <v-btn
          color="deep-purple lighten-2"
          text
          @click="reserve"
        >
          Reserve
        </v-btn>
      </v-card-actions> -->
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
