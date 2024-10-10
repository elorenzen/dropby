<template>
    <v-row dense class="flex justify-center pa-2"><h3>Events</h3></v-row>
    <v-row dense class="mt-2 p-2">
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
    <v-row dense class="flex justify-end pa-2">
        <v-btn
            @click="addEvent"
            color="#e28413"
            variant="outlined"
            :disabled="evtStart == '' || evtEnd == ''"
            :loading="loading"
        >Add Event</v-btn>
    </v-row>
    <v-divider class="my-2" />
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

// const eventStore = useEventStore()
// await eventStore.getEventsById(user.id, user.type)
// merchant = user.associated_merchant_id
// vendor = user.associated_vendor_id
// 'type' ('merchant' or 'vendor') = user.type
const addDialog = ref(false)
const loading = ref(false)

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
        console.log('evt data: ', data)
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
        if (!error) {
            snacktext.value = 'Event created!'
            snackbar.value = true

            // reset fields
            evtStart.value = ''
            evtEnd.value = ''

            // TODO: add event getter here to reset list
        }
    }
}
</script>

<style scoped>

</style>