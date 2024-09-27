<template>
    <div>
        
        <v-card>
            <v-toolbar color="#e28413" density="compact">
                <v-toolbar-title>Menu Items</v-toolbar-title>
            </v-toolbar>
            <v-container>
                <v-row v-if="!menuItems || menuItems.length == 0" >
                    No items found.
                </v-row>
                <v-row v-else>
                    {{ menuItems }}
                </v-row>
                <v-btn @click="addDialog = true" block>Add Menu Item</v-btn>
            </v-container>
            
        </v-card>
        <v-dialog v-model="addDialog" width="40%">
            <v-card>
                <v-toolbar color="#e28413" density="compact">
                    <v-toolbar-title>New Menu Item</v-toolbar-title>
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
                <v-row class="pa-2">
                    <v-btn @click="addItem" block :loading="loading">Add Menu Item</v-btn>
                </v-row>
                    <template v-slot:actions>
                    <v-btn
                        class="ms-auto"
                        text="Ok"
                        @click="addDialog = false"
                    ></v-btn>
                    </template>
            </v-card>
        </v-dialog>
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
        <!-- <v-data-table :headers="headers" :items="vendors">
            <template v-slot:item.actions="{ item }">
                <v-btn icon variant="plain">
                    <NuxtLink :to="`/vendors/${item.id}`">
                        <v-icon>mdi-eye</v-icon>
                    </NuxtLink>
                </v-btn>
            </template>
        </v-data-table> -->
    </div>
</template>

<script setup>
    import { v4 } from 'uuid'
    const loading = ref(true)
    const snackbar = ref(false)
    const snacktext = ref('')

    const props = defineProps(['vendor']);
    const vendor = ref(props.vendor)
    const supabase = useSupabaseClient()
    const sessionUser = useSupabaseUser()
    const isAdmin = ref(false)
    const addDialog = ref(false)
    const menuItems = ref(null)

    // MENU ITEM DATA
    const name = ref('')
    const description = ref('')
    const type = ref('')
    const imageUrl = ref('')
    const price = ref(0)
    const special = ref(false)

    const getMenuItems = async (vId) => {
        const { data } = await supabase
          .from('menu_items')
          .select()
          .eq('vendor_id', vId)

        return data ? data : null
    }
    
    onMounted(async () => {
      menuItems.value = await getMenuItems(vendor.value.id)
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
      loading.value = false
    })

    const addItem = async () => {
        if (isAdmin) {
            const vendorId = vendor.value.id
            const itemId = v4()

            const itemObj = {
                id: itemId,
                vendor_id: vendorId,
                name: name.value,
                description: description.value,
                type: type.value, // 'appetizer', 'entree', etc.,
                image_url: imageUrl.value,
                created_at: new Date(),
                updated_at: new Date(),
                price: price.value,
                special: special.value // default: FALSE, set to TRUE if item is seasonal/limited edition
            }
            const { error } = await supabase.from('menu_items').insert(itemObj)
            if (!error) {
                snackbar.value = true
                snacktext.value = 'Menu item added!'

                // reset fields
                name.value = ''
                description.value = ''
                type.value = ''
                imageUrl.value = ''
                price.value = 0
                special.value = false

                menuItems.value = await getMenuItems(vendor.value.id)
                addDialog.value = false
            }
        }
    }
</script>

<style scoped>

</style>