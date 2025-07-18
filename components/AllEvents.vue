<template>
    <div>
        <div class="flex justify-center p-2 text-xl"><h3>All Events</h3></div>
        <DataTable
            v-model:selection="selectedEvt"
            :value="events"
            selectionMode="single"
            dataKey="id"
            @row-select="selectRow"
        >
            <Column field="start" header="Start">
                <template #body="slotProps">
                    {{ new Date(slotProps.data.start).toLocaleString('en-US') }}
                </template>
            </Column>
            <Column field="end" header="End">
                <template #body="slotProps">
                    {{ new Date(slotProps.data.end).toLocaleString('en-US') }}
                </template></Column>
            <Column field="merchant_name" header="Establishment">
                <template #body="slotProps">
                    {{ getMerchantName(slotProps.data.merchant) }}
                </template>
            </Column>
            <Column field="location_address" header="Location">
                <template #body="slotProps">
                    {{ slotProps.data.location_address }}
                </template>
            </Column>
            <Column field="status" header="Status">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
                </template>
            </Column>
        </DataTable>

        <div v-if="selectedMerchant" class="card flex justify-center">
            <Dialog v-model:visible="openViewDialog" modal :header="selectedMerchant.merchant_name" :style="{ width: '35rem' }">
                <Card style="width: 30rem; overflow: hidden">
                    <template #title>
                        {{ new Date(selectedEvt.start).toLocaleTimeString('en-US') }} - {{ new Date(selectedEvt.end).toLocaleTimeString('en-US') }}
                        <span>
                        <Tag :value="selectedEvt.status" :severity="getStatusLabel(selectedEvt.status)" />
                        </span>
                    </template>
                    <template #subtitle>
                        <NuxtLink :to="selectedEvt.location_url" target="_blank">{{ selectedEvt.location_address }}</NuxtLink>
                    </template>
                    <template #content>
                        <p class="m-0">{{ selectedEvt.notes }}</p>
                    </template>
                    <template #footer>
                        <Button
                            v-if="!selectedEvt.pending_requests || !selectedEvt.pending_requests.includes(vendor)"
                            type="button"
                            label="Request Event"
                            @click="requestEvent"
                        ></Button>
                    </template>
                </Card>
            </Dialog>
        </div>
        <Toast ref="toast" />
    </div>

    <ErrorDialog v-if="errDialog" :errType="'Event Request'" :errMsg="errMsg" @errorClose="errDialog = false" />
</template>

<script setup lang="ts">
    const props  = defineProps(['vendor'])
    const vendor = ref(props.vendor)

    const supabase      = useSupabaseClient()
    const eventStore    = useEventStore()
    const merchantStore = useMerchantStore()
    const userStore     = useUserStore()
    const events        = eventStore.getAllOpenEvents
    const merchants     = merchantStore.getAllMerchants
    const user          = userStore.getUser

    const selectedEvt      = ref()
    const selectedMerchant = ref()
    const openViewDialog   = ref(false)

    const snackbar  = ref(false)
    const snacktext = ref('')
    const errDialog = ref(false)
    const errMsg    = ref()
    const loading   = ref(false)

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
    const getMerchantName = (id: any) => {
        const found = merchants.find(merchant => merchant.id === id)
        if (found) return found.merchant_name
    }
    const selectRow = (event: any) => {
        selectedEvt.value = event.data
        console.log('event: ', selectedEvt.value)
        selectedMerchant.value = merchants.find(merchant => merchant.id === event.data.merchant)
        openViewDialog.value = true
    }
    const requestEvent = async () => {
        loading.value = true
        let reqArr =
            selectedEvt.value.pending_requests ?
            selectedEvt.value.pending_requests : []

        reqArr.push(vendor.value)
        const updates = {
            updated_at: new Date(),
            pending_requests: reqArr
        }
        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', selectedEvt.value.id)
        
        if (!error) {
            openViewDialog.value = false
            selectedEvt.value = ''
            selectedMerchant.value = ''
            snacktext.value = 'Event requested!'
            snackbar.value = true
        } else {
            errDialog.value = true
            errMsg.value = error.message
        }
        loading.value = false
    }
</script>

<style scoped>

</style>