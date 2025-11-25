<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :style="{ width: '90vw', maxWidth: '700px' }"
    :closable="true"
    :closeOnEscape="true"
    class="edit-recurring-event-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
          <i class="pi pi-pencil text-primary"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-text-main">Edit Recurring Event</h3>
          <p class="text-sm text-text-muted">Update your recurring event schedule</p>
        </div>
      </div>
    </template>

    <div class="space-y-6 max-h-[70vh] overflow-y-auto pt-2">
      <!-- First Event Section -->
      <div class="space-y-4 pb-4 border-b border-surface-border">
        <h4 class="text-lg font-semibold text-text-main">First Event Details</h4>
        
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
            This is the amount you'll pay to the vendor for each event
          </p>
          <small v-if="errors.eventValue" class="text-error">{{ errors.eventValue }}</small>
        </div> -->

        <!-- Notes -->
        <div class="space-y-3">
          <label for="event-notes" class="block text-sm font-medium text-text-main">Notes</label>
          <Textarea 
            id="event-notes" 
            v-model="eventNotes" 
            rows="3" 
            placeholder="Add any special notes or requirements for this event..."
            class="w-full resize-none"
          />
        </div>
      </div>

      <!-- Recurrence Settings Section -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-text-main">Recurrence Settings</h4>
        
        <!-- Recurrence Type -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-text-main">Recurrence Type *</label>
          <Select 
            v-model="recurrenceType" 
            :options="recurrenceTypeOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Select recurrence type"
            class="w-full"
            :invalid="!!errors.recurrenceType"
          />
          <small v-if="errors.recurrenceType" class="text-error">{{ errors.recurrenceType }}</small>
        </div>

        <!-- Daily Recurrence Options -->
        <div v-if="recurrenceType === 'daily'" class="space-y-3 pl-4 border-l-2 border-primary-light">
          <label class="block text-sm font-medium text-text-main">Repeat Every</label>
          <div class="flex items-center gap-3">
            <InputNumber 
              v-model="recurrenceInterval" 
              :min="1"
              :max="365"
              class="w-24"
            />
            <span class="text-sm text-text-muted">day(s)</span>
          </div>
          <p class="text-xs text-text-muted">
            Events will occur every {{ recurrenceInterval }} day{{ recurrenceInterval !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Weekly Recurrence Options -->
        <div v-if="recurrenceType === 'weekly'" class="space-y-3 pl-4 border-l-2 border-primary-light">
          <label class="block text-sm font-medium text-text-main mb-2">On Day(s) of Week *</label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="day in daysOfWeek"
              :key="day.value"
              :label="day.label"
              :severity="selectedDaysOfWeek.includes(day.value) ? 'primary' : 'secondary'"
              :outlined="!selectedDaysOfWeek.includes(day.value)"
              size="small"
              @click="toggleDayOfWeek(day.value)"
            />
          </div>
          <small v-if="errors.daysOfWeek" class="text-error">{{ errors.daysOfWeek }}</small>
          <p class="text-xs text-text-muted mt-2">
            Events will occur weekly on the selected day{{ selectedDaysOfWeek.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Monthly Recurrence Options -->
        <div v-if="recurrenceType === 'monthly'" class="space-y-3 pl-4 border-l-2 border-primary-light overflow-hidden">
          <label class="block text-sm font-medium text-text-main mb-3">On Day *</label>
          <div class="space-y-3">
            <div class="flex items-center p-3 rounded-lg border border-surface-border hover:bg-surface-hover cursor-pointer overflow-hidden" 
                 :class="{ 'bg-primary-light border-primary': monthlyRecurrenceType === 'day-of-month' }"
                 @click="monthlyRecurrenceType = 'day-of-month'"
                 style="padding-right: 0.5rem;">
              <RadioButton 
                v-model="monthlyRecurrenceType" 
                inputId="day-of-month" 
                value="day-of-month"
                class="flex-shrink-0"
                style="margin-right: 0.5rem;"
              />
              <label for="day-of-month" class="text-sm text-text-main cursor-pointer flex-shrink-0" style="margin: 0 !important; padding: 0 !important; margin-right: 0.75rem !important;">
                Specific day of month
              </label>
              <div class="flex-shrink-0" style="width: 2rem !important; min-width: 2rem !important; max-width: 2rem !important; margin-left: 0 !important;">
                <InputNumber 
                  v-model="recurrenceDayOfMonth" 
                  size="small"
                  :min="1"
                  :max="31"
                  :showButtons="false"
                  :disabled="monthlyRecurrenceType !== 'day-of-month'"
                  @click.stop
                  :pt="{
                    root: { style: 'width: 2rem !important; min-width: 2rem !important; max-width: 2rem !important;' },
                    input: { style: 'width: 100% !important; max-width: 100% !important; padding: 0.25rem 0.125rem !important; font-size: 0.875rem !important;' },
                    inputGroup: { style: 'width: 100% !important; max-width: 100% !important;' }
                  }"
                />
              </div>
            </div>
            
            <div class="flex items-center gap-3 p-3 rounded-lg border border-surface-border hover:bg-surface-hover cursor-pointer"
                 :class="{ 'bg-primary-light border-primary': monthlyRecurrenceType === 'first-day' }"
                 @click="monthlyRecurrenceType = 'first-day'">
              <RadioButton 
                v-model="monthlyRecurrenceType" 
                inputId="first-day" 
                value="first-day"
              />
              <label for="first-day" class="text-sm text-text-main cursor-pointer flex-1">
                First day of the month
              </label>
            </div>
            
            <div class="flex items-center gap-3 p-3 rounded-lg border border-surface-border hover:bg-surface-hover cursor-pointer"
                 :class="{ 'bg-primary-light border-primary': monthlyRecurrenceType === 'last-day' }"
                 @click="monthlyRecurrenceType = 'last-day'">
              <RadioButton 
                v-model="monthlyRecurrenceType" 
                inputId="last-day" 
                value="last-day"
              />
              <label for="last-day" class="text-sm text-text-main cursor-pointer flex-1">
                Last day of the month
              </label>
            </div>
          </div>
          <p class="text-xs text-text-muted mt-2">
            Events will occur monthly on the selected day
          </p>
        </div>

        <!-- End Date (Optional) -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-text-main">End Date (Optional)</label>
          <div class="flex items-center gap-3">
            <Checkbox 
              v-model="hasEndDate" 
              inputId="has-end-date"
              :binary="true"
            />
            <label for="has-end-date" class="text-sm text-text-muted">Set end date</label>
          </div>
          <Calendar 
            v-if="hasEndDate"
            v-model="endDate" 
            :min-date="eventDate || new Date()"
            class="w-full"
            :pt="{
              input: { class: 'w-full' }
            }"
          />
        </div>

        <!-- Scheduling Interval -->
        <div class="space-y-3 pt-4 border-t border-surface-border">
          <label class="block text-sm font-medium text-text-main">Schedule Events In Advance *</label>
          <p class="text-xs text-text-muted mb-2">
            How far in advance should individual events be created from the recurring schedule?
          </p>
          <div class="flex items-center gap-4 pt-4">
            <div class="flex-1 pt-2">
              <FloatLabel>
                <InputNumber 
                  v-model="scheduleIntervalAmount" 
                  inputId="schedule-interval-amount"
                  :min="1"
                  :max="365"
                  class="w-full"
                  :invalid="!!errors.scheduleInterval"
                />
                <label for="schedule-interval-amount">Amount</label>
              </FloatLabel>
            </div>
            <div class="flex-1 pt-2">
              <FloatLabel>
                <Select 
                  v-model="scheduleIntervalUnit" 
                  inputId="schedule-interval-unit"
                  :options="scheduleIntervalUnitOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                  :invalid="!!errors.scheduleInterval"
                />
                <label for="schedule-interval-unit">Unit</label>
              </FloatLabel>
            </div>
          </div>
          <small v-if="errors.scheduleInterval" class="text-error">{{ errors.scheduleInterval }}</small>
          <p class="text-xs text-text-muted">
            Events will be automatically created {{ scheduleIntervalAmount }} {{ getScheduleIntervalUnitLabel(scheduleIntervalUnit) }} before they occur
          </p>
        </div>
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
          label="Update Recurring Event" 
          :loading="loading" 
          :disabled="!canUpdateRecurringEvent"
          @click="updateRecurringEvent"
          class="min-w-[180px]"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { RecurringEvent } from '~/types'

interface Props {
  visible: boolean
  recurringEvent: RecurringEvent | null
  businessHours: any[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'recurring-event-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()
const recurringEventStore = useRecurringEventStore()

// Reactive data
const loading = ref(false)
const eventDate = ref<Date>(new Date())
const eventStart = ref<Date | null>(null)
const eventEnd = ref<Date | null>(null)
const eventNotes = ref('')
// const eventValue = ref(150) // COMMENTED OUT - Feature under consideration
const errors = ref<Record<string, string>>({})

// Recurrence settings
const recurrenceType = ref<'daily' | 'weekly' | 'monthly' | null>(null)
const recurrenceInterval = ref(1)
const recurrenceDayOfWeek = ref<number | null>(null)
const recurrenceDayOfMonth = ref<number | null>(null)
const selectedDaysOfWeek = ref<number[]>([])
const monthlyRecurrenceType = ref<'day-of-month' | 'first-day' | 'last-day'>('day-of-month')
const hasEndDate = ref(false)
const endDate = ref<Date | null>(null)

// Scheduling interval settings
const scheduleIntervalAmount = ref(1)
const scheduleIntervalUnit = ref<'days' | 'weeks' | 'months'>('days')
const scheduleIntervalUnitOptions = [
  { label: 'Day(s)', value: 'days' },
  { label: 'Week(s)', value: 'weeks' },
  { label: 'Month(s)', value: 'months' }
]

// Recurrence type options
const recurrenceTypeOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

// Days of week options
const daysOfWeek = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
]

// Populate form with existing recurring event data
const populateForm = () => {
  if (!props.recurringEvent) return

  const event = props.recurringEvent

  // Set event date and times
  eventDate.value = new Date(event.first_event_start)
  eventStart.value = new Date(event.first_event_start)
  eventEnd.value = new Date(event.first_event_end)

  // Set basic fields
  // eventValue.value = event.event_value // COMMENTED OUT - Feature under consideration
  eventNotes.value = event.notes || ''

  // Set recurrence settings
  recurrenceType.value = event.recurrence_type
  recurrenceInterval.value = event.recurrence_interval

  // Handle weekly recurrence
  if (event.recurrence_type === 'weekly') {
    if (event.recurrence_days_of_week && event.recurrence_days_of_week.length > 0) {
      selectedDaysOfWeek.value = [...event.recurrence_days_of_week]
    } else if (event.recurrence_day_of_week !== null) {
      selectedDaysOfWeek.value = [event.recurrence_day_of_week]
    }
  }

  // Handle monthly recurrence
  if (event.recurrence_type === 'monthly') {
    if (event.recurrence_day_of_month === -1) {
      monthlyRecurrenceType.value = 'last-day'
    } else if (event.recurrence_day_of_month === 1) {
      monthlyRecurrenceType.value = 'first-day'
    } else {
      monthlyRecurrenceType.value = 'day-of-month'
      recurrenceDayOfMonth.value = event.recurrence_day_of_month
    }
  }

  // Set end date
  if (event.recurrence_end_date) {
    hasEndDate.value = true
    endDate.value = new Date(event.recurrence_end_date)
  } else {
    hasEndDate.value = false
    endDate.value = null
  }

  // Set scheduling interval
  scheduleIntervalAmount.value = event.schedule_interval_amount
  scheduleIntervalUnit.value = event.schedule_interval_unit
}

// Watch for recurring event prop changes
watch(() => props.recurringEvent, () => {
  if (props.recurringEvent && props.visible) {
    populateForm()
  }
}, { immediate: true })

// Watch for visible prop to populate when dialog opens
watch(() => props.visible, (isVisible) => {
  if (isVisible && props.recurringEvent) {
    populateForm()
  }
})

// Computed properties
const canUpdateRecurringEvent = computed(() => {
  const hasBasicFields = eventDate.value && eventStart.value && eventEnd.value
  // && eventValue.value && eventValue.value > 0 // COMMENTED OUT - Feature under consideration
  const hasRecurrenceType = recurrenceType.value !== null
  const hasScheduleInterval = scheduleIntervalAmount.value > 0 && scheduleIntervalUnit.value !== null
  
  if (recurrenceType.value === 'weekly') {
    return hasBasicFields && hasRecurrenceType && selectedDaysOfWeek.value.length > 0 && hasScheduleInterval
  }
  
  if (recurrenceType.value === 'monthly') {
    if (monthlyRecurrenceType.value === 'day-of-month') {
      return hasBasicFields && hasRecurrenceType && recurrenceDayOfMonth.value !== null && recurrenceDayOfMonth.value >= 1 && recurrenceDayOfMonth.value <= 31 && hasScheduleInterval
    }
    return hasBasicFields && hasRecurrenceType && hasScheduleInterval
  }
  
  return hasBasicFields && hasRecurrenceType && hasScheduleInterval
})

const getScheduleIntervalUnitLabel = (unit: 'days' | 'weeks' | 'months' | null): string => {
  if (!unit) return ''
  switch (unit) {
    case 'days': return scheduleIntervalAmount.value === 1 ? 'day' : 'days'
    case 'weeks': return scheduleIntervalAmount.value === 1 ? 'week' : 'weeks'
    case 'months': return scheduleIntervalAmount.value === 1 ? 'month' : 'months'
    default: return ''
  }
}

// Helper functions
const toggleDayOfWeek = (day: number) => {
  const index = selectedDaysOfWeek.value.indexOf(day)
  if (index > -1) {
    selectedDaysOfWeek.value.splice(index, 1)
  } else {
    selectedDaysOfWeek.value.push(day)
  }
}

// Validation function
const validateForm = (): boolean => {
  errors.value = {}
  
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
  if (!recurrenceType.value) {
    errors.value.recurrenceType = 'Recurrence type is required'
  }
  if (recurrenceType.value === 'weekly' && selectedDaysOfWeek.value.length === 0) {
    errors.value.daysOfWeek = 'Please select at least one day of the week'
  }
  if (recurrenceType.value === 'monthly' && monthlyRecurrenceType.value === 'day-of-month' && (!recurrenceDayOfMonth.value || recurrenceDayOfMonth.value < 1 || recurrenceDayOfMonth.value > 31)) {
    errors.value.dayOfMonth = 'Please enter a valid day of month (1-31)'
  }
  if (!scheduleIntervalAmount.value || scheduleIntervalAmount.value <= 0) {
    errors.value.scheduleInterval = 'Schedule interval amount is required'
  }
  if (!scheduleIntervalUnit.value) {
    errors.value.scheduleInterval = 'Schedule interval unit is required'
  }
  
  return Object.keys(errors.value).length === 0
}

// Methods
const closeDialog = () => {
  errors.value = {}
  emit('update:visible', false)
}

const updateRecurringEvent = async () => {
  if (!props.recurringEvent) return

  // Validate form
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the errors above',
      group: 'main',
      life: 3000
    })
    return
  }

  try {
    loading.value = true

    const startHours = new Date(eventStart.value!).getHours()
    const startMinutes = new Date(eventStart.value!).getMinutes()
    const endHours = new Date(eventEnd.value!).getHours()
    const endMinutes = new Date(eventEnd.value!).getMinutes()
    const day = new Date(eventDate.value)
    const eventStartTime = new Date(day.setHours(startHours, startMinutes, 0, 0))
    const eventEndTime = new Date(day.setHours(endHours, endMinutes, 0, 0))

    // Prepare recurrence data
    const recurrenceData: any = {
      first_event_start: eventStartTime.toISOString(),
      first_event_end: eventEndTime.toISOString(),
      event_value: null, // COMMENTED OUT - Feature under consideration (was: eventValue.value)
      notes: eventNotes.value || null,
      recurrence_type: recurrenceType.value,
      recurrence_interval: recurrenceInterval.value,
      recurrence_day_of_week: recurrenceType.value === 'weekly' && selectedDaysOfWeek.value.length > 0 ? selectedDaysOfWeek.value[0] : null,
      recurrence_days_of_week: recurrenceType.value === 'weekly' ? selectedDaysOfWeek.value : null,
      recurrence_day_of_month: recurrenceType.value === 'monthly' ? 
        (monthlyRecurrenceType.value === 'day-of-month' ? recurrenceDayOfMonth.value : 
         monthlyRecurrenceType.value === 'first-day' ? 1 : 
         monthlyRecurrenceType.value === 'last-day' ? -1 : null) : null,
      recurrence_end_date: hasEndDate.value && endDate.value ? endDate.value.toISOString() : null,
      schedule_interval_amount: scheduleIntervalAmount.value,
      schedule_interval_unit: scheduleIntervalUnit.value || 'days'
    }

    // Use store action to update recurring event
    await recurringEventStore.updateRecurringEvent(props.recurringEvent.id, recurrenceData)

    closeDialog()
    emit('recurring-event-updated')

    toast.add({
      severity: 'success',
      summary: 'Recurring Event Updated',
      detail: 'Your recurring event schedule has been updated successfully',
      group: 'main',
      life: 3000
    })
  } catch (error) {
    console.error('Error updating recurring event:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Failed to update recurring event. Please try again.',
      group: 'main',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Edit Recurring Event Dialog Styles */
:deep(.edit-recurring-event-dialog .p-dialog-header) {
  border-bottom: 1px solid rgb(229 231 235);
  padding: 1.5rem;
}

:deep(.edit-recurring-event-dialog .p-dialog-content) {
  padding: 1.5rem;
  overflow-x: hidden;
}

:deep(.edit-recurring-event-dialog .p-dialog-footer) {
  border-top: 1px solid rgb(229 231 235);
  padding: 1rem 1.5rem;
}

:deep(.edit-recurring-event-dialog .p-calendar) {
  width: 100%;
}

:deep(.edit-recurring-event-dialog .p-textarea) {
  border-radius: 0.5rem;
  border: 1px solid rgb(209 213 219);
  transition: border-color 0.2s ease;
}

:deep(.edit-recurring-event-dialog .p-textarea:focus) {
  border-color: rgb(249 115 22);
  box-shadow: 0 0 0 3px rgb(254 215 170);
}

:deep(.edit-recurring-event-dialog .p-inputnumber) {
  width: 2rem !important;
  min-width: 2rem !important;
  max-width: 2rem !important;
  flex-shrink: 0 !important;
}

:deep(.edit-recurring-event-dialog .p-inputnumber .p-inputnumber-input) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  padding: 0.25rem 0.125rem !important;
  text-align: center !important;
  font-size: 0.875rem !important;
}

:deep(.edit-recurring-event-dialog .p-inputnumber .p-inputnumber-input-group) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

:deep(.edit-recurring-event-dialog .p-inputnumber-button-group) {
  display: none !important;
  width: 0 !important;
}

:deep(.edit-recurring-event-dialog .p-inputnumber .p-inputnumber-button) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>

