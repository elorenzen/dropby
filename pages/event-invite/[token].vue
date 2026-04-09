<template>
  <div class="invite-container">
    <Card class="invite-card">
      <template #header>
        <div class="card-header">
          <Logo class="w-12 h-12" :fontControlled="false" style="color: var(--primary-color);" />
          <h1 class="text-2xl font-bold text-primary">Event Invitation</h1>
        </div>
      </template>

      <template #content>
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <ProgressSpinner />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <i class="pi pi-exclamation-triangle text-4xl text-error mb-4"></i>
          <p class="text-text-muted">{{ error }}</p>
          <Button label="Go to DropBy" class="mt-4" @click="navigateTo('/')" />
        </div>

        <!-- Already Responded -->
        <div v-else-if="inviteData?.invite?.status !== 'pending'" class="text-center py-8 space-y-4">
          <i
            :class="[
              'text-5xl',
              inviteData.invite.status === 'accepted' ? 'pi pi-check-circle text-success' : 'pi pi-times-circle text-error'
            ]"
          ></i>
          <h2 class="text-xl font-semibold text-text-main">
            {{ inviteData.invite.status === 'accepted' ? 'Invitation Accepted' : 'Invitation Declined' }}
          </h2>
          <p class="text-text-muted">
            You have already responded to this invitation.
          </p>
        </div>

        <!-- Invite Details + Response Form -->
        <div v-else class="space-y-6">
          <!-- Merchant Info -->
          <div class="bg-surface-ground rounded-lg p-4 space-y-2">
            <div class="flex items-center gap-3">
              <div v-if="inviteData.merchant.avatar_url" class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="inviteData.merchant.avatar_url" :alt="inviteData.merchant.merchant_name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <i class="pi pi-building text-xl text-primary"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-text-main">{{ inviteData.merchant.merchant_name }}</h3>
                <p v-if="inviteData.merchant.formatted_address" class="text-sm text-text-muted">
                  {{ inviteData.merchant.formatted_address }}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-4 text-sm text-text-muted mt-2">
              <span v-if="inviteData.merchant.phone">
                <i class="pi pi-phone mr-1"></i> {{ inviteData.merchant.phone }}
              </span>
              <span v-if="inviteData.merchant.email">
                <i class="pi pi-envelope mr-1"></i> {{ inviteData.merchant.email }}
              </span>
              <a v-if="inviteData.merchant.website" :href="inviteData.merchant.website" target="_blank" class="text-primary">
                <i class="pi pi-globe mr-1"></i> Website
              </a>
            </div>
          </div>

          <!-- Event Details -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-text-main">Event Details</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-primary"></i>
                <div>
                  <p class="text-xs text-text-muted">Date</p>
                  <p class="text-sm font-medium text-text-main">{{ formatDate(inviteData.event.start) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-clock text-primary"></i>
                <div>
                  <p class="text-xs text-text-muted">Time</p>
                  <p class="text-sm font-medium text-text-main">
                    {{ formatTime(inviteData.event.start) }} - {{ formatTime(inviteData.event.end) }}
                  </p>
                </div>
              </div>
              <div v-if="inviteData.event.location_address" class="flex items-center gap-2 sm:col-span-2">
                <i class="pi pi-map-marker text-primary"></i>
                <div>
                  <p class="text-xs text-text-muted">Location</p>
                  <a
                    v-if="inviteData.event.location_url"
                    :href="inviteData.event.location_url"
                    target="_blank"
                    class="text-sm font-medium text-primary"
                  >
                    {{ inviteData.event.location_address }}
                  </a>
                  <p v-else class="text-sm font-medium text-text-main">{{ inviteData.event.location_address }}</p>
                </div>
              </div>
            </div>
            <div v-if="inviteData.event.notes" class="bg-surface-ground rounded-lg p-3">
              <p class="text-xs text-text-muted mb-1">Notes</p>
              <p class="text-sm text-text-main">{{ inviteData.event.notes }}</p>
            </div>
          </div>

          <!-- Vendor Info Form -->
          <div class="space-y-3 border-t pt-4">
            <h3 class="text-lg font-semibold text-text-main">Your Information</h3>
            <p class="text-sm text-text-muted">
              To accept this event and work it, fill out the information below.
            </p>

            <div class="space-y-4">
              <div class="space-y-1">
                <label for="vendor-name" class="block text-sm font-medium text-text-main">Food Truck / Business Name *</label>
                <InputText
                  id="vendor-name"
                  v-model="vendorName"
                  placeholder="Your food truck name"
                  class="w-full"
                />
              </div>

              <div class="space-y-1">
                <label for="vendor-phone" class="block text-sm font-medium text-text-main">Phone Number</label>
                <InputText
                  id="vendor-phone"
                  v-model="vendorPhone"
                  placeholder="(555) 555-5555"
                  class="w-full"
                />
              </div>

              <div class="space-y-1">
                <label for="vendor-description" class="block text-sm font-medium text-text-main">Description</label>
                <Textarea
                  id="vendor-description"
                  v-model="vendorDescription"
                  rows="3"
                  placeholder="Briefly describe your food truck, cuisine type, specialties..."
                  class="w-full resize-none"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              label="Accept Invitation"
              icon="pi pi-check"
              :loading="submitting"
              :disabled="!vendorName"
              @click="respondToInvite('accepted')"
              class="flex-1"
            />
            <Button
              label="Decline"
              icon="pi pi-times"
              severity="secondary"
              outlined
              :loading="declining"
              @click="respondToInvite('declined')"
              class="flex-1"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg'

definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Event Invitation - DropBy'
})

const route = useRoute()
const token = route.params.token as string

const loading = ref(true)
const error = ref('')
const inviteData = ref<any>(null)
const submitting = ref(false)
const declining = ref(false)

const vendorName = ref('')
const vendorPhone = ref('')
const vendorDescription = ref('')

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})

const fetchInvite = async () => {
  try {
    loading.value = true
    const data = await $fetch(`/api/event-invites/${token}`)
    inviteData.value = data
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'This invitation link is invalid or has expired.'
  } finally {
    loading.value = false
  }
}

const respondToInvite = async (status: 'accepted' | 'declined') => {
  if (status === 'accepted') {
    submitting.value = true
  } else {
    declining.value = true
  }

  try {
    const result: any = await $fetch(`/api/event-invites/${token}`, {
      method: 'POST',
      body: {
        status,
        vendorName: vendorName.value || undefined,
        vendorPhone: vendorPhone.value || undefined,
        vendorDescription: vendorDescription.value || undefined
      }
    })

    inviteData.value.invite = result.invite
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to submit response. Please try again.'
  } finally {
    submitting.value = false
    declining.value = false
  }
}

onMounted(fetchInvite)
</script>

<style scoped>
.invite-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--p-surface-ground);
}

.invite-card {
  width: 100%;
  max-width: 600px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0 1rem;
}

@media (max-width: 640px) {
  .invite-container {
    padding: 1rem;
  }

  .invite-card {
    max-width: 100%;
  }
}
</style>
