<template>
    <v-card>
        <v-toolbar color="#e28413" density="compact">
            <v-toolbar-title>Events</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="addDialog = true">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-toolbar>
        <!-- <v-container>
            <v-row v-if="!events || events.length == 0" >
                No items found.
            </v-row>
            <v-list v-else lines="three">
                <v-list-item v-for="event in events" :key="event.id">
                    {{ event }}
                </v-list-item>
            </v-list>
        </v-container> -->
    </v-card>
    <v-dialog v-model="addDialog">
        <v-card>
          <v-toolbar color="#e28413" density="compact">
              <v-toolbar-title>Create Event</v-toolbar-title>
          </v-toolbar>
          <v-row dense class="pa-2">
              {{ merchant }}
            <!-- <v-col cols="8">
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
              </v-col> -->
          </v-row>
          <v-card-actions class="flex justify-center pa-2">
              <v-btn
                  @click="addEvent"
                  color="#000022"
                  variant="outlined"
                  :loading="loading"
              >Add Event</v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup>
import { v4 } from 'uuid';
const props = defineProps(['merchant']);
const user = useSupabaseUser()
const merchant = ref(props.merchant)
const supabase = useSupabaseClient()
const addDialog = ref(false)
const loading = ref(false)

// EVENT DATA
const evtStart = ref('')
const evtEnd = ref('')

const addEvent = async () => {
    if (user) {
        const evtObj = {
            id: v4(),
            merchant: merchant.value.id,
            vendor: null,
            start: evtStart.value,
            end: evtEnd.value,
            location: '',
            status: 'open',
            vendorRtg: null,
            merchantRtg: null,
            vendorComment: null,
            merchantComment: null
        }

        // const { error: userErr } = await supabase.from('users').insert(userObj)
        // console.log('userErr: ', userErr)
        // const { error: merchErr } = await supabase.from('merchants').insert(merchantObj)
        // console.log('err: ', merchErr)
        // if (!merchErr && !userErr) {
        //     snackbar.value = true
        //     snacktext.value = 'New merchant created!'

        //     // reset fields
        //     firstName.value = ''
        //     lastName.value = ''
        //     phone.value = ''
        //     email.value = ''
        //     password.value = ''

        //     merchantName.value = ''
        //     merchantDesc.value = ''
        //     website.value = ''
        //     ig.value = ''
        //     merchantPhone.value = ''
        //     merchantEmail.value = ''

        //     navigateTo(`/merchants/${merchantId}`)
        // }
    }
}

</script>

<style scoped>

</style>