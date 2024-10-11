<template>
    <div>
        <DataTable
            v-model:selection="selectedEvt"
            :value="events"
            selectionMode="single"
            dataKey="id"
            @row-select="selectRow"
        >
            <Column field="merchant_name" header="Establishment">
                <template #body="slotProps">
                    {{ getMerchantName(slotProps.data.merchant) }}
                </template>
            </Column>
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
        </DataTable>

        <div class="card flex justify-center">
            <Dialog v-model:visible="openViewDialog" modal header="Event Information" :style="{ width: '25rem' }">
                <MerchantCard :merchant="selectedMerchant" />
                <div>{{ new Date(selectedEvt.start).toLocaleString() }} - {{ new Date(selectedEvt.end).toLocaleString() }}</div>
                <Button v-if="!selectedEvt.pending_requests || !selectedEvt.pending_requests.includes(vendor)" type="button" label="Request Event" @click="requestEvent"></Button>
            </Dialog>
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
    </div>
</template>

<script setup lang="ts">
    const props = defineProps(['vendor'])
    const vendor = ref(props.vendor)

    const supabase = useSupabaseClient()
    const { data: eventData } = await supabase.from('events').select()

    const eventStore = useEventStore()
    await eventStore.setAllEvents(eventData)
    const events = eventStore.getAllEvents

    const merchantStore = useMerchantStore()
    const merchants = merchantStore.getAllMerchants
    console.log('merchants: ', merchantStore.getAllMerchants)

    const selectedEvt = ref()
    const selectedMerchant = ref()
    const openViewDialog = ref(false)

    const snackbar = ref(false)
    const snacktext = ref('')

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
        selectedMerchant.value = merchants.find(merchant => merchant.id === event.data.merchant)
        openViewDialog.value = true
    }
    const requestEvent = async () => {
        let reqArr =
            selectedEvt.value.pending_requests ?
            selectedEvt.value.pending_requests : []

        reqArr.push(vendor.value)
        const updates = {
            updated_at: new Date(),
            status: 'pending',
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
        }
    }
</script>

<style scoped>

</style>