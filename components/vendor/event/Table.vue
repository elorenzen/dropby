<template>
    <div>
        <DataTable
            v-model:selection="selectedEvt"
            :value="events"
            selectionMode="single"
            dataKey="id"
            :refresh="refreshKey"
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
                    <div class="flex items-center justify-between gap-2 py-4 w-full">
                        <span>{{ slotProps.data.location_address }}</span>
                        <Badge
                            v-if="slotProps.data.location_coordinates && userCoords"
                            :value="getDistance(slotProps.data.location_coordinates)">
                        </Badge>
                    </div>
                </template>
            </Column>
            <Column field="status" header="Status">
                <template #body="{ data }">
                    <Tag
                        v-if="data.pending_requests && data.pending_requests.includes(vendor.id)"
                        value="PENDING"
                        severity="warn"
                    />
                    
                    <Tag
                        v-else-if="!data.pending_requests || (data.pending_requests && !data.pending_requests.includes(vendor.id))"
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
                        <div class="flex justify-end gap-2 ma-4">
                            <Button
                                v-if="!selectedEvt.pending_requests || !selectedEvt.pending_requests.includes(vendor.id)"
                                type="button"
                                label="Request Event"
                                @click="requestEvent"
                                class="w-full"
                            ></Button>
                            <Button
                                v-else-if="selectedEvt.pending_requests && selectedEvt.pending_requests.includes(vendor.id)"
                                type="button"
                                outlined
                                severity="danger"
                                label="Cancel Request"
                                @click="cancelRequest"
                                class="w-full"
                            ></Button>
                        </div>
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

    <ErrorDialog v-if="errDialog" :errType="'Event Request'" :errMsg="errMsg" @errorClose="errDialog = false" />
</template>

<script setup lang="ts">
    const supabase      = useSupabaseClient()
    const eventStore    = useEventStore()
    const merchantStore = useMerchantStore()
    const userStore     = useUserStore()
    const vendorStore   = useVendorStore()
    const events        = eventStore.getAllOpenEvents
    const merchants     = merchantStore.getAllMerchants
    const user          = ref(userStore.user)
    const vendor        = ref(await vendorStore.getVendorById(user.value.associated_vendor_id))

    const selectedEvt      = ref()
    const selectedMerchant = ref()
    const openViewDialog   = ref(false)

    const snackbar  = ref(false)
    const snacktext = ref('')
    const errDialog = ref(false)
    const errMsg    = ref()
    const loading   = ref(false)
    const userCoords = ref()
    const refreshKey = ref(0)
    onMounted(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const obj = position.coords.toJSON()
            const coords = {
            latitude: obj.latitude,
            longitude: obj.longitude
            }
            userCoords.value = coords
        });
    });

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

        reqArr.push(vendor.value.id)
        const updates = {
            updated_at: new Date(),
            pending_requests: reqArr
        }
        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', selectedEvt.value.id)
        
        if (!error) {
            refreshKey.value++
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
    const cancelRequest = async () => {
        loading.value = true

        let reqArr = selectedEvt.value.pending_requests
        reqArr = reqArr.filter((id: any) => id !== vendor.value.id)

        const updates = {
            updated_at: new Date(),
            pending_requests: reqArr
        }
        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', selectedEvt.value.id)
            
        if (!error) {
            refreshKey.value++
            openViewDialog.value = false
            selectedEvt.value = ''
            selectedMerchant.value = ''
            snacktext.value = 'Request cancelled!'
            snackbar.value = true
        } else {
            errDialog.value = true
            errMsg.value = error.message
        }
        loading.value = false
    }
    const getDistance = (coordinates: any) => {
        console.log(coordinates)
        const parsedCoords = JSON.parse(coordinates)

        // Convert degrees to radians
        const radLat1 = userCoords.value.latitude * Math.PI / 180;
        const radLon1 = userCoords.value.longitude * Math.PI / 180;
        const radLat2 = parsedCoords.lat * Math.PI / 180;
        const radLon2 = parsedCoords.lng * Math.PI / 180;

        // Radius of the Earth in miles
        const R = 3950; // mi

        // Differences in coordinates
        const dLat = radLat2 - radLat1;
        const dLon = radLon2 - radLon1;

        // Haversine formula
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(radLat1) * Math.cos(radLat2) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return `${distance.toFixed(2)} mi.`; // Return distance rounded to 2 decimal places
    };
</script>

<style scoped>

</style>