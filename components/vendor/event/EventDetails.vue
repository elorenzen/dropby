<template>
    <div>
        <Card v-if="event" class="mb-4">
            <template #title>
                <div class="flex items-center justify-between">
                    <span>Event Details</span>
                    <Tag :value="getStatusDisplay(event.status)" :severity="getStatusSeverity(event.status)" />
                </div>
            </template>
            <template #content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold mb-2">Event Information</h4>
                        <div class="space-y-2">
                            <div>
                                <span class="font-medium">Date:</span>
                                <span class="ml-2">{{ formatDate(event.start) }}</span>
                            </div>
                            <div>
                                <span class="font-medium">Time:</span>
                                <span class="ml-2">{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                            </div>
                            <div>
                                <span class="font-medium">Location:</span>
                                <span class="ml-2">{{ event.location_address || 'TBD' }}</span>
                            </div>
                            <div v-if="event.notes">
                                <span class="font-medium">Notes:</span>
                                <p class="ml-2 mt-1 text-gray-600">{{ event.notes }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="merchant">
                        <h4 class="font-semibold mb-2">Establishment</h4>
                        <div class="space-y-2">
                            <div>
                                <span class="font-medium">Name:</span>
                                <span class="ml-2">{{ merchant.merchant_name }}</span>
                            </div>
                            <div v-if="merchant.merchant_description">
                                <span class="font-medium">Description:</span>
                                <p class="ml-2 mt-1 text-gray-600">{{ merchant.merchant_description }}</p>
                            </div>
                            <div v-if="merchant.phone">
                                <span class="font-medium">Phone:</span>
                                <span class="ml-2">{{ merchant.phone }}</span>
                            </div>
                            <div v-if="merchant.email">
                                <span class="font-medium">Email:</span>
                                <span class="ml-2">{{ merchant.email }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div v-if="event.status === 'booked'" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 class="font-semibold text-green-800 mb-2">✅ Event Confirmed</h4>
                    <p class="text-green-700">This event has been approved by the establishment. Please contact them to coordinate setup details.</p>
                </div>
                
                <div v-else-if="isPendingRequest" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 class="font-semibold text-yellow-800 mb-2">⏳ Request Pending</h4>
                    <p class="text-yellow-700">Your request for this event is pending approval from the establishment.</p>
                </div>
                
                <div v-else-if="event.status === 'open'" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">📋 Event Available</h4>
                    <p class="text-blue-700">This event is open for requests. Click the button below to request this event.</p>
                </div>
            </template>
            
            <template #footer v-if="event.status === 'open'">
                <div class="flex justify-end gap-2">
                    <Button
                        v-if="!isPendingRequest"
                        label="Request Event"
                        icon="pi pi-send"
                        @click="$emit('requestEvent', event)"
                        class="w-full md:w-auto"
                    />
                    <Button
                        v-else
                        label="Cancel Request"
                        icon="pi pi-times"
                        severity="danger"
                        outlined
                        @click="$emit('cancelRequest', event)"
                        class="w-full md:w-auto"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
interface Event {
    id: string
    start: string
    end: string
    status: string
    location_address?: string
    notes?: string
    merchant: string
    pending_requests?: string[]
    [key: string]: any
}

interface Merchant {
    id: string
    merchant_name: string
    merchant_description?: string
    phone?: string
    email?: string
    [key: string]: any
}

const props = defineProps<{
    event: Event
    merchant?: Merchant
    vendorId?: string
}>()

const emit = defineEmits<{
    requestEvent: [event: Event]
    cancelRequest: [event: Event]
}>()

const isPendingRequest = computed(() => {
    return props.event.pending_requests?.includes(props.vendorId || '') || false
})

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

const getStatusDisplay = (status: string) => {
    switch (status) {
        case 'open':
            return 'AVAILABLE'
        case 'booked':
            return 'CONFIRMED'
        case 'pending':
            return 'PENDING'
        case 'closed':
            return 'CLOSED'
        default:
            return status.toUpperCase()
    }
}

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'open':
            return 'info'
        case 'booked':
            return 'success'
        case 'pending':
            return 'warn'
        case 'closed':
            return 'secondary'
        default:
            return 'info'
    }
}
</script> 