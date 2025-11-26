<template>
    <Dialog 
      :visible="visible" 
      @update:visible="$emit('update:visible', $event)"
      modal 
      :style="{ width: '90vw', maxWidth: showEventList ? '900px' : '600px' }"
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
            <h3 class="text-xl font-semibold text-text-main">Create Multiple Events</h3>
            <p class="text-sm text-text-muted">{{ showEventList ? 'Review and edit events before creation' : 'Select date range and default settings' }}</p>
          </div>
        </div>
      </template>
  
      <div v-if="!showEventList" class="space-y-6">
        <!-- Date Range Selection -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-text-main">Date Range *</label>
          <Calendar 
            v-model="dateRange" 
            selectionMode="range"
            :min-date="new Date()"
            :showIcon="true"
            placeholder="Select date range"
            class="w-full"
            :pt="{
              input: { class: 'w-full' }
            }"
          />
          <small v-if="errors.dateRange" class="text-error">{{ errors.dateRange }}</small>
        </div>

        <!-- Apply to All Checkbox -->
        <div class="flex items-center gap-2">
          <Checkbox 
            v-model="applyToAll" 
            inputId="apply-to-all" 
            :binary="true"
          />
          <label for="apply-to-all" class="text-sm font-medium text-text-main">Apply same time and notes to all events</label>
        </div>
  
        <!-- Event Time Range (shown when applyToAll is true) -->
        <div v-if="applyToAll" class="grid grid-cols-2 gap-4">
          <div class="space-y-3">
            <label class="block text-sm font-medium text-text-main">Start Time *</label>
            <DatePicker 
              v-model="eventStart" 
              timeOnly 
              hourFormat="12"
              class="w-full"
            />
            <small v-if="errors.start" class="text-error">{{ errors.start }}</small>
          </div>
          <div class="space-y-3">
            <label class="block text-sm font-medium text-text-main">End Time *</label>
            <DatePicker 
              v-model="eventEnd" 
              timeOnly 
              hourFormat="12"
              class="w-full"
            />
            <small v-if="errors.end" class="text-error">{{ errors.end }}</small>
          </div>
        </div>

        <!-- Notes (shown when applyToAll is true) -->
        <div v-if="applyToAll" class="space-y-3">
          <label for="event-notes" class="block text-sm font-medium text-text-main">Notes</label>
          <Textarea 
            id="event-notes" 
            v-model="eventNotes" 
            rows="4" 
            placeholder="Add any special notes or requirements for these events..."
            class="w-full resize-none"
          />
        </div>

        <!-- Per-Date Accordions (shown when applyToAll is false) -->
        <div v-if="!applyToAll && dateRange && dateRange[0] && dateRange[1]" class="space-y-3">
          <label class="block text-sm font-medium text-text-main">Configure each event individually</label>
          <Accordion :value="expandedPanels" multiple>
            <AccordionPanel 
              v-for="(date, index) in dateRangeArray" 
              :key="date.toISOString()"
              :value="String(index)"
            >
              <AccordionHeader>
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar text-primary"></i>
                  <span class="font-semibold">{{ formatDate(date) }}</span>
                </div>
              </AccordionHeader>
              <AccordionContent>
                <div class="space-y-4 pt-2">
                  <!-- Start Time -->
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-text-muted">Start Time *</label>
                    <DatePicker 
                      v-model="perDateSettings[index].startTime" 
                      timeOnly 
                      hourFormat="12"
                      class="w-full"
                      size="small"
                    />
                    <small v-if="errors[`start-${index}`]" class="text-error">{{ errors[`start-${index}`] }}</small>
                  </div>
                  
                  <!-- End Time -->
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-text-muted">End Time *</label>
                    <DatePicker 
                      v-model="perDateSettings[index].endTime" 
                      timeOnly 
                      hourFormat="12"
                      class="w-full"
                      size="small"
                    />
                    <small v-if="errors[`end-${index}`]" class="text-error">{{ errors[`end-${index}`] }}</small>
                  </div>

                  <!-- Notes -->
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-text-muted">Notes</label>
                    <Textarea 
                      v-model="perDateSettings[index].notes" 
                      rows="3" 
                      placeholder="Optional notes for this event..."
                      class="w-full resize-none"
                      size="small"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </div>
      </div>

      <!-- Event List Review -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-text-muted">
            {{ eventList.length }} event{{ eventList.length !== 1 ? 's' : '' }} will be created. Edit or remove any before confirming.
          </p>
          <Button 
            label="Back" 
            severity="secondary" 
            outlined
            size="small"
            @click="showEventList = false"
          />
        </div>

        <div class="max-h-[500px] overflow-y-auto space-y-3">
          <div 
            v-for="(event, index) in eventList" 
            :key="event.id"
            class="bg-surface-section rounded-lg p-4 border border-surface-border"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-3">
                <!-- Date Display -->
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar text-primary"></i>
                  <span class="font-semibold text-color">{{ formatDate(event.date) }}</span>
                </div>

                <!-- Time Range -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-text-muted mb-1">Start Time</label>
                    <DatePicker 
                      v-model="event.startTime" 
                      timeOnly 
                      hourFormat="12"
                      class="w-full"
                      size="small"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-text-muted mb-1">End Time</label>
                    <DatePicker 
                      v-model="event.endTime" 
                      timeOnly 
                      hourFormat="12"
                      class="w-full"
                      size="small"
                    />
                  </div>
                </div>

                <!-- Event Value -->
                <!-- COMMENTED OUT - Feature under consideration
                <div>
                  <label class="block text-xs font-medium text-text-muted mb-1">Event Value (USD)</label>
                  <InputNumber 
                    v-model="event.value" 
                    mode="currency" 
                    currency="USD" 
                    locale="en-US"
                    :min="0"
                    :max="10000"
                    class="w-full"
                    size="small"
                  />
                </div>
                -->

                <!-- Notes -->
                <div>
                  <label class="block text-xs font-medium text-text-muted mb-1">Notes</label>
                  <Textarea 
                    v-model="event.notes" 
                    rows="2" 
                    placeholder="Optional notes..."
                    class="w-full resize-none"
                    size="small"
                  />
                </div>
              </div>

              <!-- Remove Button -->
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                outlined
                size="small"
                rounded
                @click="removeEvent(index)"
                v-tooltip.top="'Remove this event'"
              />
            </div>
          </div>
        </div>

        <div v-if="eventList.length === 0" class="text-center py-8 text-text-muted">
          <i class="pi pi-info-circle text-2xl mb-2"></i>
          <p>No events to create. Please go back and select a date range.</p>
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
            v-if="!showEventList"
            label="Continue" 
            :disabled="!canContinue"
            @click="generateEventList"
            class="min-w-[120px]"
          />
          <Button 
            v-else
            :label="`Create ${eventList.length} Event${eventList.length !== 1 ? 's' : ''}`" 
            :loading="loading" 
            :disabled="eventList.length === 0"
            @click="createEvents"
            class="min-w-[180px]"
          />
        </div>
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { v4 as uuidv4 } from 'uuid'
  
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

  interface EventListItem {
    id: string
    date: Date
    startTime: Date
    endTime: Date
    value: number
    notes: string
  }

  interface PerDateSetting {
    startTime: Date | null
    endTime: Date | null
    notes: string
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  const toast = useToast()
  const eventStore = useEventStore()
  const businessHoursStore = useBusinessHoursStore()
  
  // Business hours are loaded in app.vue, just use getters
  
  // Reactive data
  const loading = ref(false)
  const showEventList = ref(false)
  const dateRange = ref<[Date, Date] | null>(null)
  const applyToAll = ref(true) // Default to checked
  const eventStart = ref<Date | null>(null)
  const eventEnd = ref<Date | null>(null)
  const eventNotes = ref(props.merchant?.notes || '')
  // const eventValue = ref(props.merchant?.default_event_value || 150) // COMMENTED OUT - Feature under consideration
  const eventList = ref<EventListItem[]>([])
  const errors = ref<Record<string, string>>({})
  const perDateSettings = ref<PerDateSetting[]>([])
  const expandedPanels = ref<string[]>([])
  
  // Computed properties
  const dateRangeArray = computed(() => {
    if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
      return []
    }
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    const dates: Date[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  })

  const canContinue = computed(() => {
    if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
      return false
    }
    
    if (applyToAll.value) {
      return eventStart.value && eventEnd.value
    } else {
      // Check that all per-date settings have start and end times
      return perDateSettings.value.every((setting: PerDateSetting) => 
        setting.startTime && setting.endTime
      )
    }
  })
  
  // Helper functions
  const getBusinessHour = (day: number, type: 'open' | 'close'): string => {
    if (!props.merchant?.id) {
      return type === 'open' ? '09:00' : '17:00'
    }
    return businessHoursStore.getBusinessHour(props.merchant.id, 'merchant', day, type)
  }
  
  // Methods
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const closeDialog = () => {
    dateRange.value = null
    applyToAll.value = true
    eventStart.value = null
    eventEnd.value = null
    eventNotes.value = props.merchant?.notes || ''
    // eventValue.value = props.merchant?.default_event_value || 150 // COMMENTED OUT - Feature under consideration
    eventList.value = []
    showEventList.value = false
    errors.value = {}
    perDateSettings.value = []
    expandedPanels.value = []
    emit('update:visible', false)
  }

  // Initialize per-date settings when date range changes and applyToAll is false
  const initializePerDateSettings = () => {
    if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
      perDateSettings.value = []
      expandedPanels.value = []
      return
    }

    const dates = dateRangeArray.value
    perDateSettings.value = dates.map((date: Date, index: number) => {
      const dayOfWeek = date.getDay()
      const dayOpen = getBusinessHour(dayOfWeek, 'open')
      const dayClose = getBusinessHour(dayOfWeek, 'close')
      
      const [openHour, openMinute] = dayOpen.split(':').map(Number)
      const [closeHour, closeMinute] = dayClose.split(':').map(Number)
      
      const startTime = new Date(date)
      startTime.setHours(openHour, openMinute, 0, 0)
      
      const endTime = new Date(date)
      endTime.setHours(closeHour, closeMinute, 0, 0)
      
      return {
        startTime,
        endTime,
        notes: props.merchant?.notes || ''
      }
    })
    
    // Expand all panels by default
    expandedPanels.value = dates.map((_: Date, index: number) => String(index))
  }

  const generateEventList = () => {
    // Clear previous errors
    errors.value = {}
    
    // Validate form
    if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
      errors.value.dateRange = 'Date range is required'
      return
    }

    const events: EventListItem[] = []

    if (applyToAll.value) {
      // Validate apply-to-all fields
      if (!eventStart.value) {
        errors.value.start = 'Start time is required'
        return
      }
      if (!eventEnd.value) {
        errors.value.end = 'End time is required'
        return
      }

      // Generate events with same times/notes for all dates
      const dates = dateRangeArray.value
      dates.forEach((date: Date) => {
        const startTime = new Date(date)
        const providedStart = new Date(eventStart.value!)
        startTime.setHours(providedStart.getHours(), providedStart.getMinutes(), 0, 0)
        
        const endTime = new Date(date)
        const providedEnd = new Date(eventEnd.value!)
        endTime.setHours(providedEnd.getHours(), providedEnd.getMinutes(), 0, 0)

        events.push({
          id: uuidv4(),
          date: new Date(date),
          startTime,
          endTime,
          value: 0, // COMMENTED OUT - Feature under consideration
          notes: eventNotes.value
        })
      })
    } else {
      // Validate per-date settings
      let hasErrors = false
      perDateSettings.value.forEach((setting: PerDateSetting, index: number) => {
        if (!setting.startTime) {
          errors.value[`start-${index}`] = 'Start time is required'
          hasErrors = true
        }
        if (!setting.endTime) {
          errors.value[`end-${index}`] = 'End time is required'
          hasErrors = true
        }
      })

      if (hasErrors) {
        return
      }

      // Generate events with individual times/notes for each date
      const dates = dateRangeArray.value
      dates.forEach((date: Date, index: number) => {
        const setting = perDateSettings.value[index]
        const startTime = new Date(date)
        const providedStart = new Date(setting.startTime!)
        startTime.setHours(providedStart.getHours(), providedStart.getMinutes(), 0, 0)
        
        const endTime = new Date(date)
        const providedEnd = new Date(setting.endTime!)
        endTime.setHours(providedEnd.getHours(), providedEnd.getMinutes(), 0, 0)

        events.push({
          id: uuidv4(),
          date: new Date(date),
          startTime,
          endTime,
          value: 0, // COMMENTED OUT - Feature under consideration
          notes: setting.notes || ''
        })
      })
    }

    eventList.value = events
    showEventList.value = true
  }

  const removeEvent = (index: number) => {
    eventList.value.splice(index, 1)
  }

  const createEvents = async () => {
    if (eventList.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'No Events',
        detail: 'Please add at least one event to create',
        group: 'main',
        life: 3000
      })
      return
    }

    try {
      loading.value = true
      
      // Check usage limits before creating events
      const usageCheck = await $fetch('/api/usage/check', {
        method: 'POST',
        body: {
          businessId: props.merchant.id,
          businessType: 'merchant',
          usageType: 'events',
          requiredAmount: eventList.value.length
        }
      }) as any

      if (!usageCheck?.allowed) {
        toast.add({
          severity: 'warn',
          summary: 'Usage Limit Reached',
          detail: usageCheck?.message || `You cannot create ${eventList.value.length} events. Please upgrade your plan to continue.`,
          group: 'main',
          life: 5000
        })
        return
      }

      // Create all events
      let successCount = 0
      let failCount = 0

      for (const eventItem of eventList.value) {
        try {
          const startHours = new Date(eventItem.startTime).getHours()
          const startMinutes = new Date(eventItem.startTime).getMinutes()
          const endHours = new Date(eventItem.endTime).getHours()
          const endMinutes = new Date(eventItem.endTime).getMinutes()
          
          const day = new Date(eventItem.date)
          const eventStartTime = new Date(day)
          eventStartTime.setHours(startHours, startMinutes, 0, 0)
          
          const eventEndTime = new Date(day)
          eventEndTime.setHours(endHours, endMinutes, 0, 0)

          const evtObj = {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            merchant: props.merchant.id,
            vendor: undefined,
            start: eventStartTime.toISOString(),
            end: eventEndTime.toISOString(),
            day_id: day.toISOString().split('T')[0],
            location_coordinates: props.merchant.coordinates,
            location_address: props.merchant.formatted_address,
            location_url: props.merchant.address_url,
            status: 'open' as const,
            vendor_rating: null,
            merchant_rating: null,
            vendor_comment: null,
            merchant_comment: null,
            notes: eventItem.notes || props.merchant.notes,
            event_value: null, // COMMENTED OUT - Feature under consideration (was: eventItem.value)
            payment_status: 'pending' as const
          }

          await eventStore.createEvent(evtObj)
          successCount++
        } catch (error) {
          console.error('Error creating event:', error)
          failCount++
        }
      }

      // Increment usage after successful event creation
      if (successCount > 0) {
        try {
          await $fetch('/api/usage/increment', {
            method: 'POST',
            body: {
              businessId: props.merchant.id,
              businessType: 'merchant',
              usageType: 'events',
              incrementAmount: successCount
            }
          })
        } catch (usageError) {
          // Don't fail the event creation if usage tracking fails
        }
      }

      closeDialog()
      emit('event-created')

      if (failCount > 0) {
        toast.add({
          severity: 'warn',
          summary: 'Partial Success',
          detail: `Created ${successCount} event(s), but ${failCount} failed. Please check and try again.`,
          group: 'main',
          life: 5000
        })
      } else {
        toast.add({
          severity: 'success',
          summary: 'Events Created',
          detail: `Successfully created ${successCount} event(s)`,
          group: 'main',
          life: 3000
        })
      }
    } catch (error) {
      console.error('Error creating events:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create events. Please try again.',
        group: 'main',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  // Watch for date range changes to pre-populate business hours
  watch(() => dateRange.value, (newRange: [Date, Date] | null) => {
    if (newRange && newRange[0]) {
      if (applyToAll.value && !eventStart.value) {
        try {
          const dayOfWeek = new Date(newRange[0]).getDay()
          const dayOpen = getBusinessHour(dayOfWeek, 'open')
          const dayClose = getBusinessHour(dayOfWeek, 'close')
          
          const [openHour, openMinute] = dayOpen.split(':').map(Number)
          const [closeHour, closeMinute] = dayClose.split(':').map(Number)
          
          if (!isNaN(openHour) && !isNaN(openMinute) && !isNaN(closeHour) && !isNaN(closeMinute)) {
            const startDate = new Date(newRange[0])
            startDate.setHours(openHour, openMinute, 0, 0)
            eventStart.value = startDate
            
            const endDate = new Date(newRange[0])
            endDate.setHours(closeHour, closeMinute, 0, 0)
            eventEnd.value = endDate
          }
        } catch (error) {
          console.error('Error setting business hours:', error)
        }
      } else if (!applyToAll.value) {
        initializePerDateSettings()
      }
    }
  })

  // Watch for applyToAll changes
  watch(() => applyToAll.value, (newValue: boolean) => {
    if (newValue) {
      // When switching to apply-to-all, clear per-date settings
      perDateSettings.value = []
      expandedPanels.value = []
    } else {
      // When switching to per-date, initialize settings
      if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
        initializePerDateSettings()
      }
    }
  })
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