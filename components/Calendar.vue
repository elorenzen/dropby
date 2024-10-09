<template>
  <v-row>
    <VDatePicker v-model="date" mode="time" @change="seeEvt" />
    <v-btn icon @click="addEventDialog = true">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog v-model="addEventDialog" width="40%">
      <v-card>
          <v-toolbar color="#e28413" density="compact">
              <v-toolbar-title>Create Event</v-toolbar-title>
          </v-toolbar>
          <v-row dense class="pa-2">
              <v-col cols="8">
                  <v-text-field
                      density="compact"
                      outlined
                      v-model="name"
                      label="Name"
                  ></v-text-field>
              </v-col>
              <v-col cols="4">
                  <v-combobox
                      density="compact"
                      outlined
                      v-model="type"
                      label="Item Type"
                      :items="['Appetizer', 'Entree', 'Dessert', 'Side', 'Beverage']"
                  ></v-combobox>
              </v-col>
              <v-col cols="12">
                  <v-textarea density="compact" outlined v-model="description" label="Description"
                  ></v-textarea>
              </v-col>
              <v-divider class="my-2" />
              <v-col cols="6">
                  <v-text-field
                      density="compact"
                      outlined
                      v-model="price"
                      label="Price (optional)"
                      prepend-inner-icon="mdi-currency-usd"
                  ></v-text-field>
              </v-col>
              <v-col cols="6" class="pl-2">
                  <v-switch density="compact" label="Seasonal/Limited Edition" v-model="special"></v-switch>
              </v-col>
              <!--
              imageUrl = file input
              -->
          </v-row>
          <v-card-actions class="flex justify-center pa-2">
              <v-btn
                  @click="addEvent"
                  color="#000022"
                  variant="outlined"
                  :loading="loading"
              >Add Menu Item</v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
  import { ref } from '#imports'
  const loading = ref(true)
  const props = defineProps(['merchant']);
  const merchant = ref(props.merchant)
  const supabase = useSupabaseClient()
  const date = ref(new Date())
  const addEventDialog = ref(false)

  watch(date, () => {
    if (date) console.log('date: ', date.value)
  })

  const attrs = ref([
    {
      key: 'today',
      highlight: {
        color: 'green',
        fillMode: 'solid'
      },
      dates: new Date()
    }
  ])
  function seeEvt (e) {
    console.log('e: ', e)
  }
</script>

<style scoped>

</style>