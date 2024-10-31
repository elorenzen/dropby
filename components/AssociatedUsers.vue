<template>
    <div>
        <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6 ma-2">
            <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                Associated Users
            </div>
            <div class="flex flex-col md:items-end gap-8">
                <Button
                    v-if="user"
                    outlined
                    severity="secondary"
                    icon="pi pi-plus-circle"
                    @click="addDialog = true"
                />
            </div>
        </div>
        <DataTable :value="associatedUsers">
            <Column field="user_name" header="Name">
                <template #body="slotProps">
                    {{ slotProps.data.first_name }} {{ slotProps.data.last_name }}
                </template>
            </Column>
            <Column field="is_admin" header="Admin">
                <template #body="slotProps">
                    <i v-if="slotProps.data.is_admin" class="pi pi-check-circle text-green-500"></i>
                </template>
            </Column>
            <Column field="email" header="Email">
                <template #body="slotProps">
                    {{ slotProps.data.email }}
                </template>
            </Column>
            <Column field="phone" header="Phone">
                <template #body="slotProps">
                    {{ slotProps.data.phone }}
                </template>
            </Column>
            <Column field="actions" header="Actions" class="flex flex-col md:flex-row justify-between md:items-center">
                <template #body="{ data }">
                    <Button outlined severity="contrast" type="button" icon="pi pi-user-edit" @click="openEditDialog(data)"></Button>
                    <Button outlined severity="danger" type="button" icon="pi pi-trash" @click="promptDeletion(data)"></Button>
                </template>
            </Column>
        </DataTable>

        <!-- ADD USER -->
        <Dialog v-model:visible="addDialog" modal header="New User" :style="{ width: '35rem' }">
            <v-row dense class="ma-2">
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputText id="first_name" v-model="first" />
                        <label for="first_name">First Name</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputText id="last_name" v-model="last" />
                        <label for="last_name">Last Name</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputText id="email" v-model="email" />
                        <label for="email">Email</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputMask id="phone" v-model="phone" mask="(999) 999-9999" />
                        <label for="phone">Phone</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <v-switch density="compact" label="Administrative Access" v-model="isAdmin"></v-switch>
                </v-col>
                <v-col cols="6">
                    <v-switch density="compact" label="Available to Contact" v-model="availableToContact"></v-switch>
                </v-col>
            </v-row>
            <v-row class="pa-2">
                <v-btn @click="addUser" block :loading="loading">Add User</v-btn>
            </v-row>
        </Dialog>

        <!-- EDIT ITEM -->
        <Dialog v-model:visible="editDialog" modal header="Edit User" :style="{ width: '35rem' }">
            <v-row dense class="ma-2">
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputText id="first_name" v-model="first" />
                        <label for="first_name">First Name</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputText id="last_name" v-model="last" />
                        <label for="last_name">Last Name</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputText id="email" v-model="email" />
                        <label for="email">Email</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <FloatLabel variant="on">
                        <InputMask id="phone" v-model="phone" mask="(999) 999-9999" />
                        <label for="phone">Phone</label>
                    </FloatLabel>
                </v-col>
                <v-col cols="6">
                    <v-switch density="compact" label="Administrative Access" v-model="isAdmin"></v-switch>
                </v-col>
                <v-col cols="6">
                    <v-switch density="compact" label="Available to Contact" v-model="availableToContact"></v-switch>
                </v-col>
            </v-row>
            <v-row class="pa-2">
                <v-btn @click="submitEdits" block :loading="loading">Submit Edits</v-btn>
            </v-row>
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :itemType="'user'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />

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

<script setup lang="ts">
import { v4 } from 'uuid';
const props = defineProps(['id'])
const idParam = props.id

const supabase = useSupabaseClient()

const store = useUserStore()
const user = store.getUser
const associatedUsers = ref()

const addDialog = ref(false)
const loading = ref(false)
const snackbar = ref(false)
const snacktext = ref('')

const userToDelete = ref(null)
const deleteDialog = ref(false)
const editDialog = ref(false)
const editId = ref('')

// USER DATA 
const first = ref('')
const last = ref('')
const isAdmin = ref(false)
const availableToContact = ref(true)
const email = ref('')
const phone = ref('')

onMounted(async () => {
    associatedUsers.value = await getAssociatedUsers(idParam, user.type)
})

const getAssociatedUsers = async (id: any, type: any) => {
    const { data } = await supabase
      .from('users')
      .select()
      .eq(`associated_${type}_id`, id)

    return data ? data : null
}

const addUser = async () => {
    const userObj = {
        created_at: new Date(),
        is_admin: isAdmin.value,
        first_name: first.value,
        last_name: last.value,
        phone: phone.value,
        email: email.value,
        type: user.type,
        id: v4(),
        available_to_contact: availableToContact.value,
        associated_merchant_id: user.type == 'merchant' ? user[`associated_${user.type}_id`] : null,
        associated_vendor_id: user.type == 'vendor' ? user[`associated_${user.type}_id`] : null,
    }
    const { error } = await supabase.from('users').insert(userObj)
    if (!error) {
        snackbar.value = true
        snacktext.value = 'New user added!'

        resetFields()

        associatedUsers.value = await getAssociatedUsers(idParam, user.type)
        addDialog.value = false
    }
}
const openEditDialog = (user) => {
    editId.value = user.id
    first.value = user.first_name
    last.value = user.last_name
    isAdmin.value = user.is_admin
    availableToContact.value = user.available_to_contact
    email.value = user.email
    phone.value = user.phone

    editDialog.value = true
}
const submitEdits = async () => {
    const userObj = {
        updated_at: new Date(),
        first_name: first.value,
        last_name: last.value,
        is_admin: isAdmin.value,
        available_to_contact: availableToContact.value,
        email: email.value,
        phone: phone.value
    }

    const { error } = await supabase
        .from('users')
        .update(userObj)
        .eq('id', editId.value)

    if (!error) {
        snackbar.value = true
        snacktext.value = 'Menu item edited!'

        resetFields()
        associatedUsers.value = await getAssociatedUsers(idParam, user.type)

        editDialog.value = false
    }
}
const resetFields = () => {
    editId.value = ''
    first.value = ''
    last.value = ''
    isAdmin.value = false
    availableToContact.value = true
    email.value = ''
    phone.value = ''
}
const promptDeletion = (item: any) => {
    userToDelete.value = item
    deleteDialog.value = true
}
const confirmDelete = async () => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.value.id)
    if (!error) {
        snackbar.value = true
        snacktext.value = 'User deleted.'

        associatedUsers.value = await getAssociatedUsers(idParam, user.type)
        deleteDialog.value = false
        userToDelete.value = null
    }
}
const cancelDelete = () => {
    console.log('delete canceled!')
    deleteDialog.value = false
    userToDelete.value = null
}

</script>