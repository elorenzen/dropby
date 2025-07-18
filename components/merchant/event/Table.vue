<template>
    <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6 m-2">
        <div class="flex flex-row md:flex-col justify-between items-start gap-2">Events</div>
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
            <template #body="{ data }">
                <Tag
                    v-if="data.status === 'open' && (data.pending_requests && data.pending_requests.length > 0)"
                    value="PENDING"
                    severity="warn"
                />
                <Tag v-else :value="(data.status).toUpperCase()" :severity="getStatusLabel(data.status)" />
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
            <Fluid>
                <div>
                    <div class="col-span-full">
                        <FloatLabel variant="on" class="mb-4">
                            <DatePicker v-model="selectedEvt.start" inputId="evt_start" showTime hourFormat="12" showIcon iconDisplay="input" />
                            <label for="evt_start">Event Start</label>
                        </FloatLabel>
                    </div>
                    <div class="col-span-full">
                        <FloatLabel variant="on" class="mb-4">
                            <DatePicker v-model="selectedEvt.end" inputId="evt_end" showTime hourFormat="12" showIcon iconDisplay="input" />
                            <label for="evt_end">Event End</label>
                        </FloatLabel>
                    </div>
                    <div class="col-span-full">
                        <FloatLabel variant="on" class="mb-4">
                            <Textarea id="notes" v-model="selectedEvt.notes" rows="3" />
                            <label for="notes">Notes for Vendor</label>
                        </FloatLabel>
                    </div>
                </div>
            </Fluid>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Save" @click="saveEdits" :loading="loading"></Button>
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
                                    <NuxtImg class="block xl:block mx-auto rounded w-full" :src="item.avatar_url" :alt="item.vendor_name" />
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
                                            <Button
                                                :label="alreadyBooked(item.id) ? 'Booked' : 'Approve'"
                                                @click="approveRequest(item.id)"
                                                class="flex-auto md:flex-initial whitespace-nowrap"
                                                :disabled="alreadyBooked(item.id)"
                                                :loading="loading"
                                            ></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </Dialog>

        <Dialog v-model:visible="openAddDialog" modal header="Add Event" :style="{ width: '25rem' }">
            <Card style="overflow: hidden;">
                <template #content>
                    <Fluid>
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
                    </Fluid>
                </template>
                <template #footer>
                    <div class="flex justify-end gap-2 ma-4">
                        <Button
                            class="w-full"
                            @click="addItem"
                            :disabled="evtStart == '' || evtEnd == ''"
                            :loading="loading"
                        >Save</Button>
                    </div>  
                </template>
            </Card>
        </Dialog>

        <DeleteDialog v-if="deleteDialog" :itemType="'event'" @deleteConfirm="confirmDelete" @deleteCancel="cancelDelete" />
        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
        <Toast group="main" position="bottom-center" @close="onClose" />
    </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid';
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const supabase      = useSupabaseClient()
const userStore     = useUserStore()
const vendorStore   = useVendorStore()
const merchantStore = useMerchantStore()
const eventStore    = useEventStore()
const user          = ref(userStore.user)
const vendors       = vendorStore.getAllVendors

const loading           = ref(false)
const requestedVendors  = ref([])
const merchant          = ref(await merchantStore.getMerchantById(user.value?.associated_merchant_id || ''))
const events        = computed(() => {
  return eventStore.allEvents
    .filter((e: any) => e.merchant === user.value?.associated_merchant_id)
    .sort((a:any,b:any) => Date.parse(b.start) - Date.parse(a.start))
})
const selectedEvt       = ref()
const openAddDialog     = ref(false)
const openEditDialog    = ref(false)
const openRequestDialog = ref(false)
const deleteDialog      = ref(false)


// EVENT DATA
const evtStart = ref('')
const evtEnd = ref('')
const notes = ref('')

const errDialog = ref(false)
const errMsg = ref()
const errType = ref()

const onClose = () => {
  // Toast closed functionality
}

onMounted(async () => {
    const evts = events.value
    for (let evt of evts) {
        if (Date.now() > new Date(evt.end).getTime()) {
            const updates = {
                updated_at: new Date(),
                status: 'closed'
            }
            const { error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', evt.id)
        }
    }
})

const addEvent = async () => {
    loading.value = true
    if (user) {
        // date funcs for formatting 'day_id' val
        const start = evtStart.value
        const year = (new Date(start).getFullYear()).toString()
        let month = ((new Date(start).getMonth()) + 1).toString()
        if (month.length < 2) month = '0' + month
        let day = (new Date(start).getDate()).toString()
        if (day.length < 2) day = '0' + day

        const evtObj = {
            id: v4(),
            created_at: new Date(),
            merchant: user.value?.associated_merchant_id,
            vendor: null,
            start: evtStart.value,
            end: evtEnd.value,
            day_id: `${year}-${month}-${day}`,
            location_coordinates: merchant.value?.coordinates,
            location_address: merchant.value?.formatted_address,
            location_url: merchant.value?.address_url,
            status: 'open',
            vendor_rating: null,
            merchant_rating: null,
            vendor_comment: null,
            merchant_comment: null,
            notes: notes.value !== '' ? notes.value : merchant.value?.notes
        }
        const { error } = await supabase.from('events').insert(evtObj)

        if (!error) await resetFields('created')
        else {
            errType.value = 'Event Creation'
            errMsg.value = error.message
            errDialog.value = true
        }
    }
    loading.value = false
}
const selectRow = (event: any) => {
    selectedEvt.value = event.data

    // if event is 'open', 
    // but contains pending requests
    // that have yet to be approved...
    if (
        selectedEvt.value.status == 'open' &&
        !selectedEvt.value.vendor &&
        selectedEvt.value.pending_requests &&
        selectedEvt.value.pending_requests.length > 0
       ) {
        selectedEvt.value.pending_requests.forEach(id => {
            const found = vendors.find(vendor => vendor.id === id)
            requestedVendors.value.push(found)
        })
        openRequestDialog.value = true
    }
}
const saveEdits = async () => {
    loading.value = true
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
    else {
        errType.value = 'Event Update(s)'
        errMsg.value = error.message
        errDialog.value = true
    }
    loading.value = false
}
const promptDeletion = () => { deleteDialog.value = true }
const confirmDelete = async () => {
    const { error } = await supabase
        .from('events').delete().eq('id', selectedEvt.value.id)

    if (!error) await resetFields('deleted')
    else {
        errType.value = 'Event Deletion'
        errMsg.value = error.message
        errDialog.value = true
    }
    deleteDialog.value = false
}
const cancelDelete = () => { deleteDialog.value = false }
const resetFields = async (action: any) => { 
    toast.add({ severity: 'success', summary: 'Success', detail: `Event ${action}!`, group: 'main', life: 6000 })
    selectedEvt.value = null
    openEditDialog.value = false
    openAddDialog.value = false
    evtStart.value = ''
    evtEnd.value = ''
}
const getStatusLabel = (status: any) => {
    switch (status) {
        case 'open':
            return 'info';

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
    if (!user.value?.associated_merchant_id) {
        errType.value = 'Event Approval'
        errMsg.value = 'User not found'
        errDialog.value = true
        return
    }

    loading.value = true
    try {
        const updates = {
            updated_at: new Date(),
            status: 'booked',
            vendor: id,
            pending_requests: [] // Clear pending requests after approval
        }
        const { error: dbErr } = await supabase
            .from('events')
            .update(updates)
            .eq('id', selectedEvt.value.id)

        if (dbErr) {
            errType.value = 'Event Approval'
            errMsg.value = dbErr.message
            errDialog.value = true
        } else {
            // Send booking confirmation email
            try {
                await $fetch(`/api/sendBookingConfirmation?eventId=${selectedEvt.value.id}&vendorId=${id}&merchantId=${user.value.associated_merchant_id}`)
            } catch (emailErr) {
                console.error('Email notification failed:', emailErr)
                // Don't fail the whole operation if email fails
            }
            
            toast.add({ 
                severity: 'success', 
                summary: 'Success', 
                detail: 'Event approved and vendor notified!', 
                group: 'main', 
                life: 6000 
            })
            
            // Refresh the events list
            const { data: eventData } = await supabase.from('events').select()
            if (eventData) {
                await eventStore.setAllEvents(eventData)
            }
        }
    } catch (err) {
        console.error('Approval error:', err)
        errType.value = 'Event Approval'
        errMsg.value = 'An unexpected error occurred'
        errDialog.value = true
    } finally {
        loading.value = false
        openRequestDialog.value = false
        requestedVendors.value = []
    }
}
const alreadyBooked = (id: any) => {
    return (selectedEvt.value.status == 'Booked' && selectedEvt.value.pending_requests.includes(id))
}
watch(openRequestDialog, (newVal) => {
    if (!newVal) requestedVendors.value = []
    else console.log(requestedVendors.value)
})
</script>

<style scoped>

</style>