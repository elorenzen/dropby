<template>
    <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6 ma-2">
        <div class="flex flex-row md:flex-col justify-between items-start gap-2">
            {{ acctType.charAt(0).toUpperCase() + acctType.slice(1) }} Events
        </div>
        <div class="flex flex-col md:items-end gap-8">
            <Button
                v-if="user"
                outlined
                severity="secondary"
                icon="pi pi-plus-circle"
                @click="openAddDialog = true"
            />
        </div>
    </div>
    
    <DataTable
        v-model:selection="selectedEvt"
        :value="events"
        selectionMode="single"
        dataKey="id"
        @row-select="selectRow"
    >
        <Column field="start" header="Start">
            <template #body="slotProps">
                {{ new Date(slotProps.data.start).toLocaleString() }}
            </template>
        </Column>
        <Column field="end" header="End">
            <template #body="slotProps">
                {{ new Date(slotProps.data.end).toLocaleString() }}
            </template></Column>
        <Column field="status" header="Status">
            <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
            </template>
        </Column>
        <Column field="status" header="Notes">
            <template #body="slotProps">
                {{ slotProps.data.notes }}
            </template>
        </Column>
    </DataTable>
    <div class="card flex justify-center">
        <Dialog v-model:visible="openEditDialog" modal header="Edit Event" :style="{ width: '25rem' }">
            <div class="flex items-center gap-4 mb-4">
                <label for="evt_start">Event Start</label>
                <DatePicker v-model="selectedEvt.start" inputId="evt_start" showTime hourFormat="12" showIcon iconDisplay="input" dateFormat="dd/mm/yy" />
            </div>
            <div class="flex items-center gap-4 mb-8">
                <label for="evt_end">Event End</label>
                <DatePicker v-model="selectedEvt.end" inputId="evt_end" showTime hourFormat="12" showIcon iconDisplay="input" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="openEditDialog = false"></Button>
                <Button type="button" label="Save" @click="saveEdits"></Button>
            </div>
            <div class="flex justify-end mt-2">
                <Button type="button" label="Delete" severity="danger" @click="promptDeletion"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="openRequestDialog" modal header="Event Requests" :style="{ width: '50rem' }">
            <DataView :value="requestedVendors">
                <template #list="slotProps">
                    <div class="flex flex-col">
                        <div v-for="(item, index) in slotProps.items" :key="index">
                            <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                                <div class="md:w-40 relative">
                                    <img class="block xl:block mx-auto rounded w-full" :src="item.avatar_url" :alt="item.vendor_name" />
                                </div>
                                <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                        <div>
                                            <div class="text-lg font-medium mt-2">{{ item.vendor_name }}</div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.vendor_description }}</span>
                                        </div>
                                        <!-- <div class="bg-surface-100 p-1" style="border-radius: 30px">
                                            <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                                <span class="text-surface-900 font-medium text-sm">{{ item.rating }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div> -->
                                    </div>
                                    <div class="flex flex-col md:items-end gap-8">
                                        <div class="flex flex-row-reverse md:flex-row gap-2">
                                            <Button label="Approve" @click="approveRequest(item.id)" class="flex-auto md:flex-initial whitespace-nowrap"></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </Dialog>

        <Dialog v-model:visible="openViewDialog" modal header="Event Information" :style="{ width: '25rem' }">
            <MerchantCard :merchant="selectedEvt.merchant" />
            <div>{{ new Date(selectedEvt.start).toLocaleString() }} - {{ new Date(selectedEvt.end).toLocaleString() }}</div>
        </Dialog>

        <Dialog v-model:visible="openAddDialog" modal header="Add Event" :style="{ width: '25rem' }">
            <Fluid>
                <div>
                    <div class="col-span-full">
                        <FloatLabel variant="on" class="mb-4">
                            <DatePicker v-model="evtStart" inputId="evt_start" showTime hourFormat="12" showIcon iconDisplay="input" />
                            <label for="evt_start">Event Start</label>
                        </FloatLabel>
                    </div>
                    <div class="col-span-full">
                        <FloatLabel variant="on" class="mb-4">
                            <DatePicker v-model="evtEnd" inputId="evt_end" showTime hourFormat="12" showIcon iconDisplay="input" />
                            <label for="evt_end">Event End</label>
                        </FloatLabel>
                    </div>
                    <div class="col-span-full">
                        <FloatLabel variant="on" class="mb-4">
                            <Textarea id="notes" v-model="notes" rows="3" />
                            <label for="notes">Notes for Vendor</label>
                        </FloatLabel>
                    </div>
                </div>
            </Fluid>
            <v-btn
                @click="addEvent"
                color="#e28413"
                variant="outlined"
                :disabled="evtStart == '' || evtEnd == ''"
                :loading="loading"
            >Add Event</v-btn>
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :itemType="'event'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
    </div>
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

<script setup lang="ts">
import { v4 } from 'uuid';
const props    = defineProps(['acctId', 'acctType']);
const acctType = ref(props.acctType)
const acctId   = ref(props.acctId)

const supabase = useSupabaseClient()

const userStore     = useUserStore()
const vendorStore   = useVendorStore()
const merchantStore = useMerchantStore()

const user      = userStore.user
const vendors   = vendorStore.getAllVendors
const merchants = merchantStore.getAllMerchants

const loading           = ref(false)
const requestedVendors  = ref([])
const events            = ref()
const selectedEvt       = ref()
const openEditDialog    = ref(false)
const openRequestDialog = ref(false)
const openViewDialog    = ref(false)
const deleteDialog      = ref(false)
const snackbar          = ref(false)
const snacktext         = ref('')

const openAddDialog = ref(false)

// EVENT DATA
const evtStart = ref('')
const evtEnd = ref('')
const notes = ref('')

onMounted(async () => {
    const { data } = await supabase
        .from('events')
        .select()
        .eq(acctType.value, acctId.value)
    events.value = data
    const merchantData = merchants.find((i: any) => i.id == user.associated_merchant_id)
    notes.value = merchantData.notes
})

const addEvent = async () => {
    if (user) {
        const merchantData = merchants.find((i: any) => i.id == user.associated_merchant_id)
        const evtObj = {
            id: v4(),
            created_at: new Date(),
            merchant: user.associated_merchant_id,
            vendor: null,
            start: evtStart.value,
            end: evtEnd.value,
            location_coordinates: merchantData.coordinates,
            location_address: merchantData.formatted_address,
            location_url: merchantData.address_url,
            status: 'open',
            vendor_rating: null,
            merchant_rating: null,
            vendor_comment: null,
            merchant_comment: null,
            notes: notes.value !== '' ? notes.value : merchantData.notes
        }
        const { error } = await supabase.from('events').insert(evtObj)
        if (!error) await resetFields('created')
    }
}
const selectRow = (event: any) => {
    selectedEvt.value = event.data
    console.log('user: ', user.is_admin)

    if (user && user.is_admin && user.type == 'merchant') {
        // 'pending' dialog is request dialog for admin merchants
        if (selectedEvt.value.status == 'pending') {
            selectedEvt.value.pending_requests.forEach(id => {
                const found = vendors.find(vendor => vendor.id === id)
                requestedVendors.value.push(found)
            })
            openRequestDialog.value = true
        } else openEditDialog.value = true
    } else openViewDialog.value = true
}
const saveEdits = async () => {
    const updates = {
        updated_at: new Date(),
        start: selectedEvt.value.start,
        end: selectedEvt.value.end
    }
    const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', selectedEvt.value.id)

    if (!error) await resetFields('edited')
}
const promptDeletion = () => { deleteDialog.value = true }
const confirmDelete = async () => {
    const { error } = await supabase
        .from('events').delete().eq('id', selectedEvt.value.id)

    if (!error) await resetFields('deleted')
    deleteDialog.value = false
}
const cancelDelete = () => { deleteDialog.value = false }
const resetFields = async (action: any) => {
    const { data } = await supabase
            .from('events')
            .select()
            .eq(acctType.value, acctId.value)
        events.value = data

        snacktext.value = `Event ${action}!`
        snackbar.value = true
        selectedEvt.value = null
        openEditDialog.value = false
        openAddDialog.value = false

        evtStart.value = ''
        evtEnd.value = ''
}
const getStatusLabel = (status: any) => {
    switch (status) {
        case 'open':
            return 'secondary';

        case 'pending':
            return 'warn';

        case 'booked':
            return 'success';

        case 'unfulfilled':
            return 'danger';
        
        case 'closed':
            return 'secondary';

        default:
            return null;
    }
};
const approveRequest = async (id: any) => {
    const updates = {
        updated_at: new Date(),
        status: 'booked',
        vendor: id
    }
    const { error: dbErr } = await supabase
        .from('events')
        .update(updates)
        .eq('id', selectedEvt.value.id)

    const { error: emailErr } = await useFetch(
        `/api/sendBookingConfirmation?eventId=${selectedEvt.value.id}&vendorId=${id}&merchantId=${user.associated_merchant_id}`)

    if (!dbErr && !emailErr) {
        openRequestDialog.value = false
        selectedEvt.value = ''
        snacktext.value = 'Event approved!'
        snackbar.value = true
    }
}
watch(openRequestDialog, (newVal) => {
    if (!newVal) requestedVendors.value = []
    else console.log(requestedVendors.value)
})
</script>

<style scoped>

</style>