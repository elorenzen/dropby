<template>
    <v-row dense class="flex justify-center pa-2"><h3>Events</h3></v-row>
    <v-row v-if="user && user.type == 'merchant' && user.is_admin" dense class="mt-2 p-2">
        <v-col cols="6">
            <FloatLabel>
                <DatePicker v-model="evtStart" inputId="evt_start" showTime hourFormat="12" showIcon iconDisplay="input" />
                <label for="evt_start">Event Start</label>
            </FloatLabel>
        </v-col>
        <v-col cols="6">
        <FloatLabel>
            <DatePicker v-model="evtEnd" inputId="evt_end" showTime hourFormat="12" showIcon iconDisplay="input" />
            <label for="evt_end">Event End</label>
        </FloatLabel>
        </v-col>
    </v-row>
    <v-row v-if="user && user.type == 'merchant' && user.is_admin" dense class="flex justify-end pa-2">
        <v-btn
            @click="addEvent"
            color="#e28413"
            variant="outlined"
            :disabled="evtStart == '' || evtEnd == ''"
            :loading="loading"
        >Add Event</v-btn>
    </v-row>
    <v-divider class="my-2" />
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
                <Button type="button" label="Delete" severity="danger" @click="deleteEvent"></Button>
            </div>
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
</template>

<script setup lang="ts">
import { v4 } from 'uuid';
const supabase = useSupabaseClient()
const userStore = useUserStore()
const user = userStore.user
const props = defineProps(['acctId', 'acctType']);
const acctType = ref(props.acctType)
const acctId = ref(props.acctId)

const loading = ref(false)
const events = ref()
const selectedEvt = ref()
const openEditDialog = ref(false)

const statuses = ref([
    { label: 'Open', value: 'open' }, // blue?
    { label: 'Request Pending', value: 'pending' }, // yellow
    { label: 'Booked', value: 'booked' }, // green
    { label: 'Closed', value: 'closed' }, // grey
    { label: 'Unfulfilled', value: 'unfulfilled'} //
]);

const snackbar = ref(false)
const snacktext = ref('')

// EVENT DATA
const evtStart = ref('')
const evtEnd = ref('')

onMounted(async () => {
    if (user) {
        const { data } = await supabase
            .from('events')
            .select()
            .eq(user.type, user[`associated_${user.type}_id`])
        events.value = data
    } else {
        const { data } = await supabase
            .from('events')
            .select()
            .eq(acctType.value, acctId.value)
        events.value = data
    }
})

const addEvent = async () => {
    if (user) {
        const evtObj = {
            id: v4(),
            created_at: new Date(),
            merchant: user.associated_merchant_id,
            vendor: null,
            start: evtStart.value,
            end: evtEnd.value,
            location: '',
            status: 'open',
            vendor_rating: null,
            merchant_rating: null,
            vendor_comment: null,
            merchant_comment: null
        }
        const { error } = await supabase.from('events').insert(evtObj)
        if (!error) await resetFields('created')
    }
}
const selectRow = (event: any) => {
    selectedEvt.value = event.data
    openEditDialog.value = true
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
const deleteEvent = async () => {
    const { error } = await supabase
        .from('events').delete().eq('id', selectedEvt.value.id)

    if (!error) await resetFields('deleted')
}
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
</script>

<style scoped>

</style>