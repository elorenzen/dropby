<template>
  <div class="min-h-screen bg-background p-4 sm:p-6">
    <!-- Header Section -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-text-main mb-2">
            Recurring Events
          </h1>
          <p class="text-text-muted text-base sm:text-lg">
            Manage recurring event schedules for {{ merchant?.name || 'your business' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Button 
            @click="showCreateRecurringEventDialog = true"
            label="Create Recurring Event"
            size="small"
            class="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>

    <!-- Recurring Events Card -->
    <SearchAndFilter
      :has-active-filters="!!filters.keyword"
      @clear-filters="clearFilters"
    >
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
            <i class="pi pi-calendar text-primary"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-text-main">Recurring Event Schedules</h3>
          </div>
        </div>
      </template>

      <template #subtitle>
        <p class="text-sm text-text-muted">Total schedules: {{ recurringEvents.length }}</p>
      </template>
          <template #search-bar>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-color-secondary"></i>
              </div>
              <InputText 
                v-model="filters.keyword" 
                placeholder="Search recurring events..."
                class="w-full pl-10 pr-4"
                size="small"
              />
            </div>
          </template>

          <template #sort-by>
            <div class="w-48">
              <FloatLabel>
                <Select 
                  id="sort-filter"
                  v-model="filters.sortBy" 
                  :options="sortOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                  size="small"
                />
                <label for="sort-filter">Sort by</label>
              </FloatLabel>
            </div>
          </template>
        </SearchAndFilter>

    <div v-if="filteredRecurringEvents.length > 0" class="space-y-4 mt-6">
          <EventBaseListCard 
            v-for="recurringEvent in filteredRecurringEvents" 
            :key="recurringEvent.id"
            :show-status-badge="true"
          >
            <template #vendor-avatar>
              <div class="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <i class="pi pi-calendar text-primary"></i>
              </div>
            </template>
            
            <template #event-content>
              <p class="font-semibold text-text-main truncate mb-1">
                Recurring Event Schedule
              </p>
              <p class="text-sm text-text-muted">
                First Event: {{ new Date(recurringEvent.first_event_start).toLocaleDateString() }}
              </p>
              <p class="text-xs text-text-muted">
                Time: {{ new Date(recurringEvent.first_event_start).toLocaleTimeString() }} - {{ new Date(recurringEvent.first_event_end).toLocaleTimeString() }}
              </p>
              <p class="text-xs text-text-muted mb-1">
                Recurrence: {{ getRecurrenceDescription(recurringEvent) }}
              </p>
              <!-- COMMENTED OUT - Feature under consideration
              <p class="text-xs text-text-muted">
                Event Value: ${{ recurringEvent.event_value?.toFixed(2) || '0.00' }}
              </p>
              -->
            </template>
            
            <template #status-badge>
              <Tag 
                :value="recurringEvent.active ? 'ACTIVE' : 'INACTIVE'" 
                :severity="recurringEvent.active ? 'success' : 'secondary'" 
                size="small" 
              />
            </template>
            
            <template #action-buttons>
              <Button 
                type="button" 
                icon="pi pi-ellipsis-v" 
                @click="(e) => toggleMenu(e, recurringEvent)" 
                aria-haspopup="true" 
                aria-controls="recurring_events_menu"
                severity="secondary"
                outlined
                size="small"
              />
            </template>
          </EventBaseListCard>
        </div>
        <div v-else-if="recurringEvents.length > 0" class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-surface-section mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-search text-md-gray text-2xl"></i>
          </div>
          <p class="text-md-gray font-medium">No recurring events match your filters</p>
          <p class="text-sm text-md-gray">Try adjusting your search criteria</p>
        </div>
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-primary-light mx-auto mb-4 flex items-center justify-center">
            <i class="pi pi-calendar-plus text-primary text-2xl"></i>
          </div>
          <p class="text-primary-dark font-medium">No recurring events</p>
          <p class="text-sm text-primary-dark">Create a recurring event schedule to get started</p>
        </div>

    <Toast group="main" position="bottom-center" @close="onClose" />
    
    <!-- Create Recurring Event Dialog -->
    <EventCreateRecurringEvent
      :visible="showCreateRecurringEventDialog"
      :merchant="merchant"
      @update:visible="showCreateRecurringEventDialog = $event"
      @recurring-event-created="onRecurringEventCreated"
    />

    <!-- Edit Recurring Event Dialog -->
    <EventEditRecurringEvent
      :visible="showEditRecurringEventDialog"
      :recurring-event="selectedRecurringEventForEdit"
      @update:visible="showEditRecurringEventDialog = $event"
      @recurring-event-updated="onRecurringEventUpdated"
    />

    <!-- Menu Dropdown -->
    <Menu ref="menu" id="recurring_events_menu" :model="getMenuItems(selectedRecurringEvent || null)" :popup="true" />

    <!-- Delete Dialog -->
    <DeleteDialog 
      v-if="deleteDialog" 
      :visible="deleteDialog"
      :itemType="'recurring event'"
      :loading="deleting"
      @deleteConfirm="confirmDelete" 
      @deleteCancel="cancelDelete" 
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const merchantStore = useMerchantStore()
const recurringEventStore = useRecurringEventStore()
const businessHoursStore = useBusinessHoursStore()
const { showToast } = useToast()

const merchantId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const merchant = ref<any>(await merchantStore.getMerchantById(merchantId))

await recurringEventStore.loadRecurringEventsByMerchantId(merchantId)

// Business hours are loaded in app.vue, just use getters

// Create recurring event dialog state
const showCreateRecurringEventDialog = ref(false)

// Edit recurring event dialog state
const showEditRecurringEventDialog = ref(false)
const selectedRecurringEventForEdit = ref<any | null>(null)

// Menu refs for dropdown actions
const menu = ref()
const selectedRecurringEvent = ref<any | null>(null)

// Delete dialog state
const deleteDialog = ref(false)
const deleting = ref(false)
const recurringEventToDelete = ref<any | null>(null)

// Filter state
const filters = ref({
  keyword: '',
  sortBy: 'date-desc'
})

const sortOptions = ref([
  { label: 'Date (Newest First)', value: 'date-desc' },
  { label: 'Date (Oldest First)', value: 'date-asc' }
  // COMMENTED OUT - Feature under consideration
  // { label: 'Event Value (High to Low)', value: 'value-desc' },
  // { label: 'Event Value (Low to High)', value: 'value-asc' }
])

// Get recurring events from store using getter
const recurringEvents = computed(() => {
  return recurringEventStore.getAllRecurringEvents
    .sort((a: any, b: any) => Date.parse(b.created_at) - Date.parse(a.created_at))
})

// Filtered recurring events
const filteredRecurringEvents = computed(() => {
  let filtered = [...recurringEvents.value]

  // Filter by keyword search
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    filtered = filtered.filter((event: any) => {
      const recurrenceDesc = getRecurrenceDescription(event).toLowerCase()
      const location = event.location_address?.toLowerCase() || ''
      const notes = event.notes?.toLowerCase() || ''
      
      return recurrenceDesc.includes(keyword) || 
             location.includes(keyword) || 
             notes.includes(keyword)
    })
  }

  // Sort events
  filtered.sort((a: any, b: any) => {
    switch (filters.value.sortBy) {
      case 'date-asc':
        return new Date(a.first_event_start).getTime() - new Date(b.first_event_start).getTime()
      case 'date-desc':
        return new Date(b.first_event_start).getTime() - new Date(a.first_event_start).getTime()
      // COMMENTED OUT - Feature under consideration
      // case 'value-asc':
      //   return (a.event_value || 0) - (b.event_value || 0)
      // case 'value-desc':
      //   return (b.event_value || 0) - (a.event_value || 0)
      default:
        return new Date(b.first_event_start).getTime() - new Date(a.first_event_start).getTime()
    }
  })

  return filtered
})

// Helper functions
const getRecurrenceDescription = (recurringEvent: any): string => {
  if (!recurringEvent) return 'No recurrence'
  
  const { recurrence_type, recurrence_interval, recurrence_day_of_week, recurrence_days_of_week, recurrence_day_of_month } = recurringEvent
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  switch (recurrence_type) {
    case 'daily':
      if (recurrence_interval === 1) {
        return 'Daily'
      }
      return `Every ${recurrence_interval} days`
    case 'weekly':
      if (recurrence_days_of_week && recurrence_days_of_week.length > 0) {
        const days = recurrence_days_of_week.map((day: number) => dayNames[day]).join(', ')
        if (recurrence_interval === 1) {
          return `Weekly on ${days}`
        }
        return `Every ${recurrence_interval} weeks on ${days}`
      } else if (recurrence_day_of_week !== null && recurrence_day_of_week !== undefined) {
        const day = dayNames[recurrence_day_of_week]
        if (recurrence_interval === 1) {
          return `Weekly on ${day}`
        }
        return `Every ${recurrence_interval} weeks on ${day}`
      }
      if (recurrence_interval === 1) {
        return 'Weekly'
      }
      return `Every ${recurrence_interval} weeks`
    case 'monthly':
      if (recurrence_day_of_month === -1) {
        if (recurrence_interval === 1) {
          return 'Monthly on last day'
        }
        return `Every ${recurrence_interval} months on last day`
      } else if (recurrence_day_of_month === 1) {
        if (recurrence_interval === 1) {
          return 'Monthly on first day'
        }
        return `Every ${recurrence_interval} months on first day`
      } else if (recurrence_day_of_month) {
        if (recurrence_interval === 1) {
          return `Monthly on day ${recurrence_day_of_month}`
        }
        return `Every ${recurrence_interval} months on day ${recurrence_day_of_month}`
      }
      if (recurrence_interval === 1) {
        return 'Monthly'
      }
      return `Every ${recurrence_interval} months`
    default:
      return 'Custom recurrence'
  }
}

// Methods
const clearFilters = () => {
  filters.value = {
    keyword: '',
    sortBy: 'date-desc'
  }
}

const onRecurringEventCreated = async () => {
  // Refresh the recurring events data from database
  await recurringEventStore.loadRecurringEventsByMerchantId(merchantId)
}

const onRecurringEventUpdated = async () => {
  // Refresh the recurring events data from database
  await recurringEventStore.loadRecurringEventsByMerchantId(merchantId)
}

const onClose = () => {
  // Toast closed functionality
  console.log('Toast closed')
}

// Delete functionality
const promptDeletion = (recurringEvent: any) => {
  recurringEventToDelete.value = recurringEvent
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!recurringEventToDelete.value) return
  
  deleting.value = true
  try {
    await recurringEventStore.deleteRecurringEvent(recurringEventToDelete.value.id)
    
    showToast('success', 'Recurring Event Deleted', 'The recurring event has been deleted successfully')
    
    await recurringEventStore.loadRecurringEventsByMerchantId(merchantId)
    
    deleteDialog.value = false
    recurringEventToDelete.value = null
  } catch (error: any) {
    console.error('Error deleting recurring event:', error)
    showToast('error', 'Delete Error', error.message || 'Failed to delete recurring event. Please try again.')
    deleteDialog.value = false
    recurringEventToDelete.value = null
  } finally {
    deleting.value = false
  }
}

const cancelDelete = () => {
  deleteDialog.value = false
  recurringEventToDelete.value = null
}

// Menu toggle functions
const toggleMenu = (event: MouseEvent, selectedEvent: any) => {
  selectedRecurringEvent.value = selectedEvent
  menu.value?.toggle(event)
}

// Menu items for recurring events
const getMenuItems = (recurringEvent: any | null) => {
  if (!recurringEvent) return []
  
  const items = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => {
        selectedRecurringEventForEdit.value = recurringEvent
        showEditRecurringEventDialog.value = true
      }
    },
    {
      label: recurringEvent?.active ? 'Deactivate' : 'Activate',
      icon: recurringEvent?.active ? 'pi pi-pause' : 'pi pi-play',
      command: () => {
        // TODO: Implement activate/deactivate functionality
        console.log('Toggle active status:', recurringEvent)
      }
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => {
        promptDeletion(recurringEvent)
      }
    }
  ]
  
  return items
}

useSeoMeta({ title: () => `Recurring Events | ${merchant.value?.merchant_name || 'Merchant'}` })
</script>

<style scoped>
/* Custom styles for the recurring events page */
:deep(.p-card) {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

:deep(.p-card .p-card-title) {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

:deep(.p-card .p-card-content) {
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
}

:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

:deep(.p-button.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style>

