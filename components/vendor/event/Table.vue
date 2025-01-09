<template>
    <div>
        <DataTable
            v-model:selection="selectedEvt"
            :value="events"
            selectionMode="single"
            dataKey="id"
            @row-select="selectRow"
        >
            <template #header>
                <div class="flex flex-wrap items-center justify-around gap-2">
                    <span class="text-xl font-bold">Events</span>
                </div>
            </template>
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
                <template #body="{ data }">
                    <Tag
                        v-if="data.pending_requests && data.pending_requests.includes(user.associated_vendor_id)"
                        value="PENDING"
                        severity="warn"
                    />
                    
                    <Tag
                        v-else-if="!data.pending_requests || (data.pending_requests && !data.pending_requests.includes(user.associated_vendor_id))"
                        :value="(data.status).toUpperCase()"
                        severity="success"
                    />

                </template>
            </Column>
        </DataTable>

        <div v-if="selectedMerchant" class="card flex justify-center">
            <Dialog v-model:visible="openViewDialog" modal :header="selectedMerchant.merchant_name" :style="{ width: '35rem' }">
                <Card style="width: 30rem; overflow: hidden">
                    <template #title>
                        {{ new Date(selectedEvt.start).toLocaleTimeString('en-US') }} - {{ new Date(selectedEvt.end).toLocaleTimeString('en-US') }}
                    </template>
                    <template #subtitle>
                        <NuxtLink :to="selectedEvt.location_url" target="_blank">{{ selectedEvt.location_address }}</NuxtLink>
                    </template>
                    <template #content>
                        <p class="m-0">{{ selectedEvt.notes }}</p>
                    </template>
                    <template #footer>
                        <Button
                            v-if="!selectedEvt.pending_requests || !selectedEvt.pending_requests.includes(user.associated_vendor_id)"
                            type="button"
                            label="Request Event"
                            @click="requestEvent"
                        ></Button>
                    </template>
                </Card>
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

    <ErrorDialog v-if="errDialog" :errType="'Event Request'" :errMsg="errMsg" @errorClose="errDialog = false" />
</template>

<script setup lang="ts">
    const supabase      = useSupabaseClient()
    const eventStore    = useEventStore()
    const merchantStore = useMerchantStore()
    const userStore     = useUserStore()
    const events        = eventStore.getAllOpenEvents
    const merchants     = merchantStore.getAllMerchants
    const user          = ref(userStore.user)

    const selectedEvt      = ref()
    const selectedMerchant = ref()
    const openViewDialog   = ref(false)

    const snackbar  = ref(false)
    const snacktext = ref('')
    const errDialog = ref(false)
    const errMsg    = ref()
    const loading   = ref(false)

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
        loading.value = true
        let reqArr =
            selectedEvt.value.pending_requests ?
            selectedEvt.value.pending_requests : []

        reqArr.push(user.value.associated_vendor_id)
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