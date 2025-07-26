<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :style="{ width: '90vw', maxWidth: '600px' }"
    :closable="true"
    :closeOnEscape="true"
    class="create-event-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <i class="pi pi-calendar-plus text-green-600 dark:text-green-400"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-text-main">Create New Event</h3>
          <p class="text-sm text-text-muted">Schedule a new food truck event</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Event Date -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-text-main">Event Date *</label>
        <Calendar 
          v-model="eventDate" 
          :min-date="new Date()"
          class="w-full"
          :pt="{
            input: { class: 'w-full' }
          }"
        />
      </div>

              <!-- Event Time Range -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-3">
            <label class="block text-sm font-medium text-text-main">Start Time *</label>
            <DatePicker 
              v-model="eventStart" 
              timeOnly 
              hourFormat="12"
              class="w-full"
            />
          </div>
          <div class="space-y-3">
            <label class="block text-sm font-medium text-text-main">End Time *</label>
            <DatePicker 
              v-model="eventEnd" 
              timeOnly 
              hourFormat="12"
              class="w-full"
            />
          </div>
        </div>

      <!-- Notes -->
      <div class="space-y-3">
        <label for="event-notes" class="block text-sm font-medium text-text-main">Notes</label>
        <Textarea 
          id="event-notes" 
          v-model="eventNotes" 
          rows="4" 
          placeholder="Add any special notes or requirements for this event..."
          class="w-full resize-none"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button 
          label="Cancel" 
          severity="secondary" 
          outlined
          @click="closeDialog" 
        />
        <Button 
          label="Create Event" 
          :loading="loading" 
          :disabled="!canCreateEvent"
          @click="createEvent"
          class="min-w-[120px]"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

interface Props {
  visible: boolean
  merchant: any
  businessHours: any[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'event-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const supabase = useSupabaseClient()
const toast = useToast()

// Reactive data
const loading = ref(false)
const eventDate = ref(new Date())
const eventStart = ref<Date | null>(null)
const eventEnd = ref<Date | null>(null)
const eventNotes = ref(props.merchant?.notes || '')

// Computed properties
const canCreateEvent = computed(() => {
  return eventDate.value && eventStart.value && eventEnd.value
})

// Helper functions
const getBusinessHour = (day: number, type: 'open' | 'close'): string => {
  const hours = props.businessHours
  
  // Check if business hours exist and are valid
  if (!hours || !Array.isArray(hours) || hours.length === 0) {
    // Default to 9am-5pm if no business hours
    return type === 'open' ? '09:00' : '17:00'
  }
  
  // Ensure we have all 7 days of business hours
  const safeHours = hours.length >= 7 ? hours : Array(7).fill({ open: '09:00', close: '17:00' })
  
  switch (day) {
    case 0: // Sunday
      return safeHours[6]?.[type] || (type === 'open' ? '09:00' : '17:00')
    case 1: // Monday
      return safeHours[0]?.[type] || (type === 'open' ? '09:00' : '17:00')
    case 2: // Tuesday
      return safeHours[1]?.[type] || (type === 'open' ? '09:00' : '17:00')
    case 3: // Wednesday
      return safeHours[2]?.[type] || (type === 'open' ? '09:00' : '17:00')
    case 4: // Thursday
      return safeHours[3]?.[type] || (type === 'open' ? '09:00' : '17:00')
    case 5: // Friday
      return safeHours[4]?.[type] || (type === 'open' ? '09:00' : '17:00')
    case 6: // Saturday
      return safeHours[5]?.[type] || (type === 'open' ? '09:00' : '17:00')
    default:
      return type === 'open' ? '09:00' : '17:00'
  }
}

const addTimelineEvent = async (timelineObj: any) => {
  const { error } = await supabase.from('timeline_items').insert({
    id: uuidv4(),
    owner_id: timelineObj.ownerId,
    title: timelineObj.title,
    description: timelineObj.description,
    type: timelineObj.type
  } as any)
  if (error) {
    console.error('Timeline Event Creation Error:', error.message)
  }
}

// Methods
const closeDialog = () => {
  eventDate.value = new Date()
  eventStart.value = null
  eventEnd.value = null
  eventNotes.value = props.merchant?.notes || ''
  emit('update:visible', false)
}

const createEvent = async () => {
  if (!canCreateEvent.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields',
      group: 'main',
      life: 3000
    })
    return
  }

  try {
    loading.value = true
    
    // Get business hours for the selected day
    const dayOfWeek = new Date(eventDate.value).getDay()
    const dayOpen = getBusinessHour(dayOfWeek, 'open')
    const dayClose = getBusinessHour(dayOfWeek, 'close')
    
    // Set start and end times if not already set
    if (!eventStart.value) {
      const [openHour, openMinute] = dayOpen.split(':').map(Number)
      const startDate = new Date(eventDate.value)
      startDate.setHours(openHour, openMinute, 0, 0)
      eventStart.value = startDate
    }
    
    if (!eventEnd.value) {
      const [closeHour, closeMinute] = dayClose.split(':').map(Number)
      const endDate = new Date(eventDate.value)
      endDate.setHours(closeHour, closeMinute, 0, 0)
      eventEnd.value = endDate
    }

    const startHours = new Date(eventStart.value).getHours()
    const endHours = new Date(eventEnd.value).getHours()
    const day = new Date(eventDate.value)
    const eventStartTime = day.setHours(startHours)
    const eventEndTime = day.setHours(endHours)

    const evtObj = {
      id: uuidv4(),
      created_at: new Date(),
      merchant: props.merchant.id,
      vendor: null,
      start: new Date(eventStartTime),
      end: new Date(eventEndTime),
      day_id: new Date(eventDate.value).toISOString().split('T')[0],
      location_coordinates: props.merchant.coordinates,
      location_address: props.merchant.formatted_address,
      location_url: props.merchant.address_url,
      status: 'open',
      vendor_rating: null,
      merchant_rating: null,
      vendor_comment: null,
      merchant_comment: null,
      notes: eventNotes.value !== '' ? eventNotes.value : props.merchant.notes
    }

    const { error } = await supabase.from('events').insert(evtObj as any)
    
    if (error) {
      throw error
    }

    // Add timeline event
    await addTimelineEvent({
      ownerId: props.merchant.id,
      title: 'Event Created',
      description: `Event created for ${new Date(eventStartTime).toLocaleDateString()} ${new Date(eventStartTime).toLocaleTimeString()} - ${new Date(eventEndTime).toLocaleTimeString()}`,
      type: 'event'
    })

    closeDialog()
    emit('event-created')

    toast.add({
      severity: 'success',
      summary: 'Event Created',
      detail: 'Your event has been created successfully',
      group: 'main',
      life: 3000
    })
  } catch (error) {
    console.error('Error creating event:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create event. Please try again.',
      group: 'main',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Watch for date changes to pre-populate business hours
watch(eventDate, (newDate: Date) => {
  if (newDate) {
    try {
      const dayOfWeek = new Date(newDate).getDay()
      const dayOpen = getBusinessHour(dayOfWeek, 'open')
      const dayClose = getBusinessHour(dayOfWeek, 'close')
      
      // Parse the time strings safely
      const [openHour, openMinute] = dayOpen.split(':').map(Number)
      const [closeHour, closeMinute] = dayClose.split(':').map(Number)
      
      // Validate that we got valid numbers
      if (!isNaN(openHour) && !isNaN(openMinute) && !isNaN(closeHour) && !isNaN(closeMinute)) {
        const startDate = new Date(newDate)
        startDate.setHours(openHour, openMinute, 0, 0)
        eventStart.value = startDate
        
        const endDate = new Date(newDate)
        endDate.setHours(closeHour, closeMinute, 0, 0)
        eventEnd.value = endDate
      } else {
        // Fallback to default times if parsing fails
        const startDate = new Date(newDate)
        startDate.setHours(9, 0, 0, 0)
        eventStart.value = startDate
        
        const endDate = new Date(newDate)
        endDate.setHours(17, 0, 0, 0)
        eventEnd.value = endDate
      }
    } catch (error) {
      console.error('Error setting business hours:', error)
      // Fallback to default times
      const startDate = new Date(newDate)
      startDate.setHours(9, 0, 0, 0)
      eventStart.value = startDate
      
      const endDate = new Date(newDate)
      endDate.setHours(17, 0, 0, 0)
      eventEnd.value = endDate
    }
  }
}, { immediate: true })
</script>

<style scoped>
/* Create Event Dialog Styles */
:deep(.create-event-dialog .p-dialog-header) {
  border-bottom: 1px solid rgb(229 231 235);
  padding: 1.5rem;
}

:deep(.create-event-dialog .p-dialog-content) {
  padding: 1.5rem;
}

:deep(.create-event-dialog .p-dialog-footer) {
  border-top: 1px solid rgb(229 231 235);
  padding: 1rem 1.5rem;
}

:deep(.create-event-dialog .p-calendar) {
  width: 100%;
}

:deep(.create-event-dialog .p-textarea) {
  border-radius: 0.5rem;
  border: 1px solid rgb(209 213 219);
  transition: border-color 0.2s ease;
}

:deep(.create-event-dialog .p-textarea:focus) {
  border-color: rgb(249 115 22);
  box-shadow: 0 0 0 3px rgb(254 215 170);
}
</style> 