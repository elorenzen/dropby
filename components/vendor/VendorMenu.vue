<template>
    <div>
                <v-row dense class="flex justify-center pa-2 text-xl"><h3>Menu Items</h3></v-row>
                <v-row v-if="!menuItems || menuItems.length == 0" >
                    No items found.
                </v-row>
                <DataView v-else :value="menuItems" :sortOrder="sortOrder" :sortField="sortField">
                    <template #header>
                        <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                            <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                <Select v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By Price" @change="onSortChange($event)" />
                            </div>
                            <div class="flex flex-col md:items-end gap-8">
                                <span class="text-xl font-semibold">
                                    <v-btn size="xs" icon variant="plain" color="green" @click="addDialog = true">
                                      <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #list="slotProps">
                        <div class="flex flex-col">
                            <div v-for="(item, index) in slotProps.items" :key="index">
                                <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                                    <div class="md:w-40 relative">
                                        <img class="block xl:block mx-auto rounded w-full" :src="item.image_url" :alt="item.name" />
                                    </div>
                                    <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                        <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                            <div>
                                                <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.type }}</span>
                                                <div class="text-lg font-medium mt-2">{{ item.name }}</div>
                                            </div>
                                        </div>
                                        <div class="flex flex-col md:items-end gap-8">
                                            <span class="text-xl font-semibold">${{ item.price }}</span>
                                            <div class="flex flex-row-reverse md:flex-row gap-2">
                                                <v-btn size="xs" @click="promptDeletion(item)" color="red" icon variant="plain">
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                                <v-btn size="xs" @click="openEditDialog(item)" icon variant="plain">
                                                    <v-icon>mdi-pencil</v-icon>
                                                </v-btn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
                <!-- <v-list v-else lines="three">
                    <v-list-item
                        v-for="item in menuItems"
                        :key="item.id"
                        :subtitle="item.description"
                        :title="item.name"
                    >
                        <template v-slot:prepend>
                        <v-avatar v-if="item.image_url" color="grey-lighten-1">
                            <v-img :src="item.image_url"></v-img>
                        </v-avatar>
                        <MenuImage v-else v-model:path="image_path" @upload="updateImage" :menuId="item.id" />
                        </template>

                        <template v-if="isAdmin" v-slot:append>
                            <v-btn @click="openEditDialog(item)" icon variant="plain">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn @click="promptDeletion(item)" icon variant="plain">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </template>
                        <v-divider inset></v-divider>
                    </v-list-item>
                </v-list> -->

        <!-- ADD ITEM -->
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
                <v-card-actions class="flex justify-center pa-2">
                    <v-btn
                        @click="addItem"
                        color="#000022"
                        variant="outlined"
                        :loading="loading"
                    >Add Menu Item</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- EDIT ITEM -->
        <v-dialog v-model="editDialog" width="40%">
            <v-card>
                <v-toolbar color="#e28413" density="compact">
                    <v-toolbar-title>Edit Menu Item</v-toolbar-title>
                </v-toolbar>
                <v-row dense class="pa-2">
                    <v-col cols="8">
                        <v-text-field
                            density="compact"
                            outlined
                            v-model="editName"
                            label="Name"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-combobox
                            density="compact"
                            outlined
                            v-model="editType"
                            label="Item Type"
                            :items="['Appetizer', 'Entree', 'Dessert', 'Side', 'Beverage']"
                        ></v-combobox>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea density="compact" outlined v-model="editDescription" label="Description"
                        ></v-textarea>
                    </v-col>
                    <v-divider class="my-2" />
                    <v-col cols="6">
                        <v-text-field
                            density="compact"
                            outlined
                            v-model="editPrice"
                            label="Price (optional)"
                            prepend-inner-icon="mdi-currency-usd"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="6" class="pl-2">
                        <v-switch density="compact" label="Seasonal/Limited Edition" v-model="editSpecial"></v-switch>
                    </v-col>
                </v-row>
                <v-row class="pa-2">
                    <v-btn @click="submitEdits" block :loading="loading">Submit Edits</v-btn>
                </v-row>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" width="20%">
            <v-card>
                <v-toolbar color="warning" density="compact">
                    <v-toolbar-title>Delete Menu Item</v-toolbar-title>
                </v-toolbar>
                <v-row class="pa-2">
                    {{ itemToDelete }}
                    <v-btn @click="confirmDelete" :loading="loading">Delete Item</v-btn>
                </v-row>
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
    </div>
</template>

<script setup>
    import { v4 } from 'uuid'
import MenuImage from './MenuImage.vue';
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
    const image_path = ref('')

    const editId = ref('')
    const editVendorId = ref('')
    const editName = ref('')
    const editDescription = ref('')
    const editType = ref('')
    // const editImageUrl = ref('')
    const editPrice = ref(0)
    const editSpecial = ref(false)
    const editDialog = ref(false)

    const itemToDelete = ref(null)
    const deleteDialog = ref(false)

    // MENU ITEM DATA
    const name = ref('')
    const description = ref('')
    const type = ref('')
    const imageUrl = ref('')
    const price = ref(0)
    const special = ref(false)

    const sortKey = ref();
    const sortOrder = ref();
    const sortField = ref();
    const sortOptions = ref([
        {label: 'Price High to Low', value: '!price'},
        {label: 'Price Low to High', value: 'price'},
    ]);
    const onSortChange = (event) => {
        const value = event.value.value;
        const sortValue = event.value;

        if (value.indexOf('!') === 0) {
            sortOrder.value = -1;
            sortField.value = value.substring(1, value.length);
            sortKey.value = sortValue;
        }
        else {
            sortOrder.value = 1;
            sortField.value = value;
            sortKey.value = sortValue;
        }
    };

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
    const openEditDialog = (item) => {
        editId.value = item.id
        editVendorId.value = item.vendor_id
        editName.value = item.name
        editDescription.value = item.description
        editType.value = item.type
        editPrice.value = item.price
        editSpecial.value = item.special
        editDialog.value = true
    }
    const submitEdits = async () => {
        const itemObj = {
            updated_at: new Date(),
            name: editName.value,
            description: editDescription.value,
            price: editPrice.value,
            type: editType.value, // 'appetizer', 'entree', etc.,
            // image_url: imageUrl.value,
            special: editSpecial.value // default: FALSE, set to TRUE if item is seasonal/limited edition
        }

        const { error } = await supabase
            .from('menu_items')
            .update(itemObj)
            .eq('id', editId.value)

        if (!error) {
            snackbar.value = true
            snacktext.value = 'Menu item edited!'

            menuItems.value = await getMenuItems(editVendorId.value)
            // reset fields
            editId.value = ''
            editVendorId.value = ''
            editName.value = ''
            editDescription.value = ''
            editType.value = ''
            // editImageUrl.value = ''
            editPrice.value = 0
            editSpecial.value = false

            editDialog.value = false
        }
    }

    const promptDeletion = (item) => {
        itemToDelete.value = item
        deleteDialog.value = true
    }
    const confirmDelete = async () => {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', itemToDelete.value.id)
        if (!error) {
            snackbar.value = true
            snacktext.value = 'Menu item deleted.'

            menuItems.value = await getMenuItems(vendor.value.id)
            deleteDialog.value = false
            itemToDelete.value = null
        }
    }
    async function updateImage(e) {
        if (e) {
            try {
                loading.value = true

                const updates = {
                    image_url: e.path,
                    updated_at: new Date(),
                }

                const { error } = await supabase
                    .from('menu_items')
                    .update(updates)
                    .eq('id', e.id)

                if (error) throw error
            } catch (error) {
                alert(error.message)
            } finally {
                menuItems.value = await getMenuItems(vendor.value.id)
                loading.value = false
            }
        }
    }
</script>

<style scoped>

</style>