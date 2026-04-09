<template>
    <div class="m-2">
        <DataTable :value="associatedUsers">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Users</span>
                    <Button
                        outlined
                        severity="secondary"
                        icon="pi pi-plus-circle"
                        label="Invite User"
                        @click="openAddDialog"
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
                    <i v-if="slotProps.data.is_admin" class="pi pi-check-circle text-success"></i>
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
            <Column field="registered" header="Status">
                <template #body="slotProps">
                    <Tag v-if="slotProps.data.registered" severity="success" value="Active" />
                    <Tag v-else severity="warn" value="Invited" />
                </template>
            </Column>
            <Column field="actions">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEditDialog(data)" />
                    <Button
                        icon="pi pi-trash"
                        outlined
                        rounded
                        severity="danger"
                        :disabled="!canDeleteUser(data)"
                        :title="deleteDisabledReason(data)"
                        @click="promptDeletion(data)"
                    />
                </template>
            </Column>
        </DataTable>

        <!-- ADD/EDIT USER DIALOG -->
        <Dialog v-model:visible="openDialog" modal :header="`${headerTitle} User`" :style="{ width: '35rem' }">
            <div class="flex flex-wrap gap-4 m-2">
                <div class="w-full md:w-1/2 p-2">
                    <FloatLabel variant="on">
                        <InputText id="first_name" v-model="first" />
                        <label for="first_name">First Name</label>
                    </FloatLabel>
                </div>
                <div class="w-full md:w-1/2 p-2">
                    <FloatLabel variant="on">
                        <InputText id="last_name" v-model="last" />
                        <label for="last_name">Last Name</label>
                    </FloatLabel>
                </div>
                <div class="w-full md:w-1/2 p-2">
                    <FloatLabel variant="on">
                        <InputText id="email" v-model="email" :disabled="headerTitle === 'Edit'" />
                        <label for="email">Email</label>
                    </FloatLabel>
                </div>
                <div class="w-full md:w-1/2 p-2">
                    <FloatLabel variant="on">
                        <InputMask id="phone" v-model="phone" mask="(999) 999-9999" />
                        <label for="phone">Phone</label>
                    </FloatLabel>
                </div>
                <div class="w-full md:w-1/2 p-2">
                    <InputSwitch v-model="isAdmin" />
                    <label class="m-2">Administrative Access</label>
                </div>
                <div class="w-full md:w-1/2 p-2">
                    <InputSwitch v-model="available" />
                    <label class="m-2">Available to Contact</label>
                </div>
            </div>
            <div class="flex gap-2 p-2">
                <Button v-if="headerTitle == 'Add'" @click="inviteUser" block :loading="loading">Send Invite</Button>
                <Button v-if="headerTitle == 'Edit'" @click="submitEdits" block :loading="loading">Submit Edits</Button>
            </div>
        </Dialog>

        <DeleteDialog :visible="deleteDialog" :itemType="'user'" :loading="deleteLoading" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />

        <Toast ref="toast" />
    </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const props = defineProps<{ businessName?: string }>()

const store           = useUserStore()
const { showToast }   = useToast()
const user: any       = store.getUser
const assocId         = user[`associated_${user.type}_id`]
const associatedUsers = computed(() =>
    store.getAllUsers.filter((u: any) => u[`associated_${user.type}_id`] === assocId)
)
const adminCount = computed(() => associatedUsers.value.filter((u: any) => u.is_admin).length)

/** Disable delete for: own account, or last admin in the business */
const canDeleteUser = (row: any) => {
    if (!row || !user) return false
    if (row.id === user.id) return false
    if (row.is_admin && adminCount.value <= 1) return false
    return true
}
const deleteDisabledReason = (row: any) => {
    if (!row || !user) return ''
    if (row.id === user.id) return "You cannot delete your own account"
    if (row.is_admin && adminCount.value <= 1) return "Cannot remove the only admin user"
    return ''
}

const openDialog      = ref(false)
const headerTitle     = ref('')
const loading         = ref(false)
const snackbar        = ref(false)
const snacktext       = ref('')
const userToDelete    = ref<any>(null)
const deleteDialog    = ref(false)
const deleteLoading   = ref(false)
const editId          = ref('')

const first           = ref('')
const last            = ref('')
const isAdmin         = ref(false)
const available       = ref(true)
const email           = ref('')
const phone           = ref('')

const errDialog       = ref(false)
const errMsg          = ref()
const errType         = ref()

onMounted(async () => {
    await store.loadUsers()
})

const refreshUsers = () => store.loadUsers()

const inviteUser = async () => {
    if (!email.value) {
        errType.value = 'Validation'
        errMsg.value = 'Email is required to send an invite'
        errDialog.value = true
        return
    }

    loading.value = true
    try {
        const inviterName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || undefined

        await store.inviteUser({
            email: email.value,
            firstName: first.value || undefined,
            lastName: last.value || undefined,
            phone: phone.value || undefined,
            isAdmin: isAdmin.value,
            availableToContact: available.value,
            type: user.type,
            associatedMerchantId: user.type === 'merchant' ? assocId : null,
            associatedVendorId: user.type === 'vendor' ? assocId : null,
            businessName: props.businessName,
            inviterName
        })

        snackbar.value = true
        snacktext.value = 'Invite sent!'

        resetFields()
        refreshUsers()
        openDialog.value = false
    } catch (error: any) {
        errType.value = 'User Invite'
        errMsg.value = error.data?.statusMessage || error.message || 'Failed to invite user'
        errDialog.value = true
    } finally {
        loading.value = false
    }
}

const openAddDialog = () => {
    headerTitle.value = 'Add'
    openDialog.value = true
}
const openEditDialog = (userData: any) => {
    editId.value = userData.id
    first.value = userData.first_name
    last.value = userData.last_name
    isAdmin.value = userData.is_admin
    available.value = userData.available_to_contact
    email.value = userData.email
    phone.value = userData.phone

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

    loading.value = true
    try {
        await store.updateUser(editId.value, userObj)
        snackbar.value = true
        snacktext.value = 'User updated!'

        resetFields()
        refreshUsers()
        openDialog.value = false
    } catch (error: any) {
        errType.value = 'User Update(s)'
        errMsg.value = error.message || 'Failed to update user'
        errDialog.value = true
    } finally {
        loading.value = false
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
    if (!canDeleteUser(item)) return
    userToDelete.value = item
    deleteDialog.value = true
}
const confirmDelete = async () => {
    if (!userToDelete.value || !canDeleteUser(userToDelete.value)) {
        deleteDialog.value = false
        userToDelete.value = null
        return
    }
    deleteLoading.value = true
    try {
        await store.deleteUser(userToDelete.value.id)
        showToast('success', 'User Deleted', 'The user has been removed successfully.', 5000)
        refreshUsers()
        deleteDialog.value = false
        userToDelete.value = null
    } catch (error: any) {
        errType.value = 'User Deletion'
        errMsg.value = error.message || 'Failed to delete user'
        errDialog.value = true
    } finally {
        deleteLoading.value = false
    }
}
const cancelDelete = () => {
    deleteDialog.value = false
    userToDelete.value = null
}
watch(openDialog, (newVal) => {
    if (!newVal) resetFields()
})

</script>