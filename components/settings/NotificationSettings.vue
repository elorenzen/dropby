<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold mb-2" style="color: var(--p-text-color);">Notification Settings</h2>
      <p class="text-sm mb-6" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">
        Choose how you'd like to be notified. In-app notifications are always enabled.
      </p>
    </div>

    <!-- Email Notifications -->
    <div class="rounded-lg border p-6" style="background: var(--p-surface-card); border-color: var(--p-surface-border);">
      <div class="flex items-center gap-3 mb-6">
        <i class="pi pi-envelope text-xl" style="color: var(--p-primary-color);"></i>
        <div>
          <h3 class="text-lg font-semibold" style="color: var(--p-text-color);">Email Notifications</h3>
          <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Receive email alerts for the following activities</p>
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Event Requests</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When a vendor requests to work at your event or your request is received</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.email_event_requests"
            @update:modelValue="handleToggle('email_event_requests', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Booking Confirmations</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When an event is confirmed and booked</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.email_booking_confirmations"
            @update:modelValue="handleToggle('email_booking_confirmations', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Event Reminders</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Reminder emails before upcoming events (7 days, 1 day, day of)</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.email_event_reminders"
            @update:modelValue="handleToggle('email_event_reminders', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Reviews</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When you receive a new review or rating</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.email_reviews"
            @update:modelValue="handleToggle('email_reviews', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Event Invitations</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When you're invited to participate in an event</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.email_event_invites"
            @update:modelValue="handleToggle('email_event_invites', $event)"
          />
        </div>
      </div>
    </div>

    <!-- SMS Notifications -->
    <div class="rounded-lg border p-6" style="background: var(--p-surface-card); border-color: var(--p-surface-border);">
      <div class="flex items-center gap-3 mb-6">
        <i class="pi pi-mobile text-xl" style="color: var(--p-primary-color);"></i>
        <div>
          <h3 class="text-lg font-semibold" style="color: var(--p-text-color);">SMS Notifications</h3>
          <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Receive text message alerts for the following activities</p>
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Event Requests</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When a vendor requests to work at your event or your request is received</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.sms_event_requests"
            @update:modelValue="handleToggle('sms_event_requests', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Booking Confirmations</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When an event is confirmed and booked</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.sms_booking_confirmations"
            @update:modelValue="handleToggle('sms_booking_confirmations', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Event Reminders</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Reminder texts before upcoming events</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.sms_event_reminders"
            @update:modelValue="handleToggle('sms_event_reminders', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Reviews</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When you receive a new review or rating</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.sms_reviews"
            @update:modelValue="handleToggle('sms_reviews', $event)"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium" style="color: var(--p-text-color);">Event Invitations</p>
            <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">When you're invited to participate in an event</p>
          </div>
          <ToggleSwitch
            :modelValue="preferences.sms_event_invites"
            @update:modelValue="handleToggle('sms_event_invites', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Info Note -->
    <div class="flex items-start gap-3 rounded-lg p-4" style="background: var(--p-highlight-background); color: var(--p-highlight-color);">
      <i class="pi pi-info-circle text-lg mt-0.5"></i>
      <p class="text-sm">
        In-app notifications will always be delivered regardless of these settings.
        Changes are saved automatically.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationPreferences } from '~/types'

const { preferences, updatePreference } = useNotificationPreferences()

const emit = defineEmits<{
  error: [type: string, message: string]
}>()

const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
  try {
    await updatePreference(key, value)
  } catch (error: any) {
    emit('error', 'Notification Settings', error.message || 'Failed to update notification preference')
  }
}
</script>
