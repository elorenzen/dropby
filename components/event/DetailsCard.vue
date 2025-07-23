<template>
  <Dialog 
    :visible="visible" 
    :modal="true" 
    :closable="true"
    :dismissable-mask="true"
    @update:visible="$emit('update:visible', $event)"
    class="w-full max-w-4xl"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <i class="pi pi-calendar text-blue-600 dark:text-blue-400"></i>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-text-main">Event Details</h2>
          <p class="text-sm text-text-muted">View complete event information</p>
        </div>
      </div>
    </template>

    <div v-if="event" class="space-y-6">
      <!-- Event Information Section -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
          <i class="pi pi-calendar-plus text-blue-600"></i>
          Event Information
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-text-muted mb-1">Event Date</p>
            <p class="text-text-main">{{ new Date(event.start).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-text-muted mb-1">Event Time</p>
            <p class="text-text-main">{{ new Date(event.start).toLocaleTimeString() }} - {{ new Date(event.end).toLocaleTimeString() }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-text-muted mb-1">Status</p>
            <Tag :value="getEventStatus(event)" :severity="getEventStatusSeverity(event)" />
          </div>
          <div>
            <p class="text-sm font-medium text-text-muted mb-1">Duration</p>
            <p class="text-text-main">{{ getEventDuration(event) }}</p>
          </div>
          <div v-if="event.location_address" class="md:col-span-2">
            <p class="text-sm font-medium text-text-muted mb-1">Location</p>
            <p class="text-text-main">{{ event.location_address }}</p>
          </div>
        </div>
      </div>

      <!-- Merchant Information Section -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
          <i class="pi pi-building text-green-600"></i>
          Merchant Information
        </h3>
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-building text-green-600 dark:text-green-400 text-xl"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-text-main text-lg">{{ merchant?.merchant_name || 'Merchant Name' }}</h4>
            <p class="text-text-muted mb-2">{{ merchant?.description || 'No description available' }}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="font-medium text-text-muted mb-1">Business Type</p>
                <p class="text-text-main">{{ merchant?.business_type || 'Not specified' }}</p>
              </div>
              <div>
                <p class="font-medium text-text-muted mb-1">Contact</p>
                <p class="text-text-main">{{ merchant?.contact_email || 'No contact info' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vendor Information Section -->
      <div v-if="event.vendor" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
          <i class="pi pi-truck text-orange-600"></i>
          Food Truck Information
        </h3>
        <div class="flex items-start gap-4">
          <NuxtImg 
            :src="getVendorProp(event.vendor, 'avatar_url')" 
            :alt="getVendorProp(event.vendor, 'vendor_name')" 
            class="w-16 h-16 rounded-full flex-shrink-0"
          />
          <div class="flex-1">
            <h4 class="font-semibold text-text-main text-lg">{{ getVendorProp(event.vendor, 'vendor_name') }}</h4>
            <p class="text-text-muted mb-2">{{ getVendorProp(event.vendor, 'description') || 'No description available' }}</p>
            <div class="flex items-center gap-2 mb-3">
              <Tag v-for="cuisine in getVendorCuisines(event.vendor)" :key="cuisine" :value="cuisine" severity="info" size="small" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="font-medium text-text-muted mb-1">Contact</p>
                <p class="text-text-main">{{ getVendorProp(event.vendor, 'contact_email') || 'No contact info' }}</p>
              </div>
              <div>
                <p class="font-medium text-text-muted mb-1">Phone</p>
                <p class="text-text-main">{{ getVendorProp(event.vendor, 'phone') || 'No phone info' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Vendor Section -->
      <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
          <i class="pi pi-truck text-gray-600"></i>
          Food Truck Status
        </h3>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <i class="pi pi-clock text-gray-400 dark:text-gray-500 text-xl"></i>
          </div>
          <div>
            <h4 class="font-semibold text-text-main">No Food Truck Booked</h4>
            <p class="text-text-muted">This event is currently open for food truck requests</p>
          </div>
        </div>
      </div>

      <!-- Event Notes Section -->
      <div v-if="event.notes" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
          <i class="pi pi-file-edit text-purple-600"></i>
          Event Notes
        </h3>
        <p class="text-text-main whitespace-pre-wrap">{{ event.notes }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          @click="$emit('update:visible', false)"
          label="Close"
          severity="secondary"
          outlined
        />
        <Button 
          v-if="event?.vendor && !hasReview(event)"
          @click="writeReview"
          label="Write Review"
          severity="warning"
          icon="pi pi-star"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
interface Event {
  id: string
  merchant: string
  vendor: string | null
  start: string
  end: string
  status: string
  notes?: string
  location_address?: string
  pending_requests?: string[]
}

interface Merchant {
  id: string
  merchant_name?: string
  description?: string
  business_type?: string
  contact_email?: string
}

interface Props {
  visible: boolean
  event: Event | null
  merchant: Merchant | null
  getVendorProp: (vendorId: string | null, prop: string) => string
  getVendorCuisines: (vendorId: string | null) => string[]
  hasReview: (event: Event) => boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'write-review': [event: Event]
}>()

const getEventStatus = (event: Event): string => {
  return event.status.toUpperCase()
}

const getEventStatusSeverity = (event: Event): string => {
  if (event.status === 'open') return 'danger'
  if (event.status === 'pending') return 'warning'
  if (event.status === 'booked' || event.status === 'in-progress') return 'success'
  if (event.status === 'completed') return 'info'
  return 'secondary'
}

const getEventDuration = (event: Event): string => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const durationMs = end.getTime() - start.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const writeReview = () => {
  if (props.event) {
    emit('write-review', props.event)
  }
}
</script>

<style scoped>
:deep(.p-dialog) {
  border-radius: 0.75rem;
}

:deep(.p-dialog .p-dialog-header) {
  border-bottom: 1px solid rgb(229 231 235);
  padding: 1.5rem;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog .p-dialog-footer) {
  border-top: 1px solid rgb(229 231 235);
  padding: 1.5rem;
}

:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style> 