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
          <div class="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
            <i class="pi pi-calendar-plus text-success"></i>
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

      <!-- Event Value -->
      <!-- COMMENTED OUT - Feature under consideration -->
      <!-- <div class="space-y-3">
        <FloatLabel variant="on">
          <InputNumber 
            v-model="eventValue" 
            inputId="event-value" 
            mode="currency" 
            currency="USD" 
            locale="en-US"
            :min="0"
            :max="10000"
            :invalid="!!errors.eventValue"
          />
          <label for="event-value">Event Value (USD) *</label>
        </FloatLabel>
        <p class="text-xs text-text-muted">
          This is the amount you'll pay to the vendor for this event
        </p>
        <small v-if="errors.eventValue" class="text-error">{{ errors.eventValue }}</small>
      </div> -->

      <!-- Notes -->
      <div class="space-y-3">
        <label for="event-notes" class="block text-sm font-medium text-text-main">Notes</label>
        <Textarea 
          id="event-notes" 
          v-model="eventNotes" 
          rows="4" 
          placeholder="e.g., Setup time: 8am, Special dietary requirements, Parking instructions..."
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
import { usageService } from '~/services/api/usageService'
import { useToast } from '~/composables/useToast'

import type { Merchant } from '~/types'

interface Props {
  visible: boolean
  merchant: Merchant
  preFilledDate?: Date
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'event-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { showToast } = useToast()
const eventStore = useEventStore()
const businessHoursStore = useBusinessHoursStore()

// Reactive data
const loading = ref(false)
const eventDate = ref(props.preFilledDate || new Date())
const eventStart = ref<Date | null>(null)

// Watch for changes to preFilledDate prop
watch(() => props.preFilledDate, (newDate) => {
  if (newDate) {
    eventDate.value = newDate
  }
}, { immediate: true })
const eventEnd = ref<Date | null>(null)
const eventNotes = ref(props.merchant?.notes || '')
// const eventValue = ref(props.merchant?.default_event_value || 150) // COMMENTED OUT - Feature under consideration
const errors = ref<Record<string, string>>({})

// Computed properties
const canCreateEvent = computed(() => {
  return eventDate.value && eventStart.value && eventEnd.value
  // && eventValue.value && eventValue.value > 0 // COMMENTED OUT - Feature under consideration
})

// Business hours are loaded in app.vue, just use getters

// Helper functions
const getBusinessHour = (day: number, type: 'open' | 'close'): string => {
  if (!props.merchant?.id) {
    return type === 'open' ? '09:00' : '17:00'
  }
  return businessHoursStore.getBusinessHour(props.merchant.id, 'merchant', day, type)
}

// Methods
const closeDialog = () => {
  eventDate.value = new Date()
  eventStart.value = null
  eventEnd.value = null
  eventNotes.value = props.merchant?.notes || ''
  // eventValue.value = props.merchant?.default_event_value || 150 // COMMENTED OUT - Feature under consideration
  errors.value = {}
  emit('update:visible', false)
}

const createEvent = async () => {
  // Clear previous errors
  errors.value = {}
  
  // Validate form
  if (!eventDate.value) {
    errors.value.date = 'Event date is required'
  }
  if (!eventStart.value) {
    errors.value.start = 'Start time is required'
  }
  if (!eventEnd.value) {
    errors.value.end = 'End time is required'
  }
  // COMMENTED OUT - Feature under consideration
  // if (!eventValue.value || eventValue.value <= 0) {
  //   errors.value.eventValue = 'Event value must be greater than 0'
  // }
  
  if (Object.keys(errors.value).length > 0) {
    showToast('error', 'Validation Error', 'Please fix the errors above')
    return
  }

  try {
    loading.value = true
    
    // Check usage limits before creating event
    const usageCheck = await usageService.check({
      businessId: props.merchant.id,
      businessType: 'merchant',
      usageType: 'events',
      requiredAmount: 1
    })

    if (!usageCheck?.allowed) {
      showToast('warn', 'Usage Limit Reached', usageCheck?.message || 'You have reached your event limit for this month. Please upgrade your plan to continue.', 5000)
      return
    }
    
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
      created_at: new Date().toISOString(),
      merchant: props.merchant.id,
      vendor: undefined,
      start: new Date(eventStartTime).toISOString(),
      end: new Date(eventEndTime).toISOString(),
      day_id: new Date(eventDate.value).toISOString().split('T')[0],
      location_coordinates: props.merchant.coordinates,
      location_address: props.merchant.formatted_address,
      location_url: props.merchant.address_url,
      status: 'open' as const,
      vendor_rating: null,
      merchant_rating: null,
      vendor_comment: null,
      merchant_comment: null,
      notes: eventNotes.value !== '' ? eventNotes.value : props.merchant.notes,
      event_value: null, // COMMENTED OUT - Feature under consideration (was: eventValue.value)
      payment_status: 'pending' as const
    }

    // Use Event Store to create event
    await eventStore.createEvent(evtObj)
    
    // Increment usage after successful event creation
    try {
      await usageService.increment({
        businessId: props.merchant.id,
        businessType: 'merchant',
        usageType: 'events',
        incrementAmount: 1
      })
    } catch (usageError) {
      // Don't fail the event creation if usage tracking fails
    }

    closeDialog()
    emit('event-created')

    showToast('success', 'Event Created', 'Your event has been created successfully')
  } catch (error) {
    console.error('Error creating event:', error)
    showToast('error', 'Error', 'Failed to create event. Please try again.')
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
/* Custom calendar width - PrimeVue handles dialog padding/borders and textarea styling */
:deep(.create-event-dialog .p-calendar) {
  width: 100%;
}
</style> 