<template>
    <div class="ma-2">
        <DataTable :value="associatedUsers">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Menu Items</span>
                    <Button
                        outlined
                        severity="secondary"
                        icon="pi pi-plus-circle"
                        @click="addDialog = true"
                    />
                </div>
            </template>
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
            <Column field="actions">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEditDialog(data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="promptDeletion(data)" />
                </template>
            </Column>
        </DataTable>

        <!-- ADD USER -->
        <Dialog v-model:visible="openDialog" modal :header="`${headerTitle} User`" :style="{ width: '35rem' }">
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
                    <v-switch density="compact" label="Available to Contact" v-model="available"></v-switch>
                </v-col>
            </v-row>
            <v-row class="pa-2">
                <Button v-if="headerTitle == 'Add'" @click="addUser" block :loading="loading">Add User</Button>
                <Button v-if="headerTitle == 'Edit'" @click="submitEdits" block :loading="loading">Submit Edits</Button>
            </v-row>
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :itemType="'user'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />

        <v-snackbar
          v-model="snackbar"
          timeout="6000"
        >
          {{ snacktext }}

          <template v-slot:actions>
            <Button
              color="#000022"
              variant="text"
              @click="snackbar = false"
            >
              Close
            </Button>
          </template>
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid';
const supabase        = useSupabaseClient()
const store           = useUserStore()
const user:any        = store.getUser
const assocId         = user[`associated_${user.type}_id`]
const allUsers        = store.getAllUsers

const associatedUsers = ref()
const openDialog      = ref(false)
const headerTitle     = ref('')
const loading         = ref(false)
const snackbar        = ref(false)
const snacktext       = ref('')
const userToDelete    = ref(null)
const deleteDialog    = ref(false)
const editId          = ref('')

// USER DATA 
const first           = ref('')
const last            = ref('')
const isAdmin         = ref(false)
const available       = ref(true)
const email           = ref('')
const phone           = ref('')

const errDialog       = ref(false)
const errMsg          = ref()
const errType         = ref()

onMounted(() => {
    getAssociatedUsers()
})

const getAssociatedUsers = () => {
    associatedUsers.value = allUsers
        .filter((user:any) => user[`associated_${user.type}_id`] === assocId)
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
        available_to_contact: available.value,
        associated_merchant_id: user.type == 'merchant' ? user[`associated_${user.type}_id`] : null,
        associated_vendor_id: user.type == 'vendor' ? user[`associated_${user.type}_id`] : null,
    }
    const { error } = await supabase.from('users').insert(userObj)
    if (!error) {
        snackbar.value = true
        snacktext.value = 'New user added!'

        resetFields()

        getAssociatedUsers()
        openDialog.value = false
    } else {
        errType.value = 'User Creation'
        errMsg.value = error.message
        errDialog.value = true
    }
}
const openAddDialog = () => {
    headerTitle.value = 'Add'
    openDialog.value = true
}
const openEditDialog = (user: any) => {
    editId.value = user.id
    first.value = user.first_name
    last.value = user.last_name
    isAdmin.value = user.is_admin
    available.value = user.available_to_contact
    email.value = user.email
    phone.value = user.phone

    headerTitle.value = 'Edit'
    openDialog.value = true
}
const submitEdits = async () => {
    const userObj = {
        updated_at: new Date(),
        first_name: first.value,
        last_name: last.value,
        is_admin: isAdmin.value,
        available_to_contact: available.value,
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
        getAssociatedUsers()
        openDialog.value = false
    } else {
        errType.value = 'User Update(s)'
        errMsg.value = error.message
        errDialog.value = true
    }
}
const resetFields = () => {
    editId.value = ''
    first.value = ''
    last.value = ''
    isAdmin.value = false
    available.value = true
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

        getAssociatedUsers()
        deleteDialog.value = false
        userToDelete.value = null
    } else {
        errType.value = 'User Deletion'
        errMsg.value = error.message
        errDialog.value = true
    }
}
const cancelDelete = () => {
    console.log('delete canceled!')
    deleteDialog.value = false
    userToDelete.value = null
}
watch(openDialog, (newVal) => {
    if (!newVal) resetFields()
})

</script>