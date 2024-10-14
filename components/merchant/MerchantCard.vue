<template>
    <Card style="overflow: hidden">
        <template #header>
            <img alt="user header" :src="merchant.avatar_url" />
        </template>
        <template #title>
          {{ merchant.merchant_name }}
          <v-btn v-if="storeUser && storeUser.is_admin && storeUser.type == 'merchant'" size="xs" @click="editDialog = true" icon variant="plain">
              <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
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
    </Card>

    <Dialog v-model:visible="editDialog" modal header="Edit Information" :style="{ width: '50rem' }">
      <v-row>
        <v-text-field density="compact" outlined v-model="merchant.merchant_name" placeholder="Merchant Name (e.g. 'McDonald's')"></v-text-field>
      </v-row>
      <v-row>
        <v-textarea density="compact" outlined v-model="merchant.merchant_description" placeholder="Merchant Desciption (e.g. 'Fast food restaurant selling burgers & fries.')"></v-textarea>
      </v-row>
      <v-row>
        <v-btn prepend-icon="mdi-map-marker" variant="plain" class="mt-2" readonly>
          <template v-slot:prepend><v-icon></v-icon></template>
          <NuxtLink>{{ merchant.formatted_address ? merchant.formatted_address : 'No address on file' }}</NuxtLink>
        </v-btn>
      </v-row>
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
      <div class="flex justify-end gap-2">
          <Button type="button" label="Cancel" severity="secondary" @click="editDialog = false"></Button>
          <Button type="button" label="Save" @click="saveEdits"></Button>
      </div>
    </Dialog>
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
</template>

<script setup>
const supabase = useSupabaseClient()
const props = defineProps(['merchant']);
const merchant = ref(props.merchant)
const store = useUserStore()
const storeUser = store.user

const editDialog = ref(false)
const snackbar = ref(false)
const snacktext = ref('')

const saveEdits = async () => {
  const updates = {
    updated_at: new Date(),
    merchant_name: merchant.value.merchant_name,
    merchant_description: merchant.value.merchant_description,
    formatted_address: merchant.value.formatted_address ? merchant.value.formatted_address : '',
    phone: merchant.value.phone,
    website: merchant.value.website,
    instagram: merchant.value.instagram,
    email: merchant.value.email,
  }

  const { error } = await supabase.from('merchants').update(updates).eq('id', merchant.value.id)
  if (!error) {
      editDialog.value = false
      snacktext.value = 'Information Updated!'
      snackbar.value = true
  }
}
</script>

<style lang="scss" scoped></style>
