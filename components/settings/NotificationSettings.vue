<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold mb-2" style="color: var(--p-text-color);">Notification Settings</h2>
      <p class="text-sm mb-6" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">
        Choose how you'd like to be notified. In-app notifications are always enabled.
      </p>
    </div>

    <!-- Email Notifications -->
    <div class="rounded-lg border p-4 sm:p-6" style="background: var(--p-surface-card); border-color: var(--p-surface-border);">
      <div class="flex items-center gap-3 mb-6">
        <i class="pi pi-envelope text-xl shrink-0" style="color: var(--p-primary-color);"></i>
        <div>
          <h3 class="text-lg font-semibold" style="color: var(--p-text-color);">Email Notifications</h3>
          <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Receive email alerts for the following activities</p>
        </div>
      </div>

      <div class="space-y-5">
        <template v-for="(type, index) in notificationTypes" :key="type.key">
          <Divider v-if="index > 0" />
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1">
              <p class="font-medium" style="color: var(--p-text-color);">{{ type.label }}</p>
              <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">{{ type.emailDescription }}</p>
            </div>
            <ToggleSwitch
              class="shrink-0 self-start sm:self-center"
              :modelValue="preferences[`email_${type.key}` as keyof NotificationPreferences]"
              @update:modelValue="handleToggle(`email_${type.key}` as keyof NotificationPreferences, $event)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- SMS Notifications -->
    <div class="rounded-lg border p-4 sm:p-6" style="background: var(--p-surface-card); border-color: var(--p-surface-border);">
      <div class="flex items-center gap-3 mb-6">
        <i class="pi pi-mobile text-xl shrink-0" style="color: var(--p-primary-color);"></i>
        <div>
          <h3 class="text-lg font-semibold" style="color: var(--p-text-color);">SMS Notifications</h3>
          <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">Receive text message alerts for the following activities</p>
        </div>
      </div>

      <div class="space-y-5">
        <template v-for="(type, index) in notificationTypes" :key="type.key">
          <Divider v-if="index > 0" />
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1">
              <p class="font-medium" style="color: var(--p-text-color);">{{ type.label }}</p>
              <p class="text-sm" style="color: var(--p-text-muted-color, var(--p-text-color-secondary));">{{ type.smsDescription }}</p>
            </div>
            <ToggleSwitch
              class="shrink-0 self-start sm:self-center"
              :modelValue="preferences[`sms_${type.key}` as keyof NotificationPreferences]"
              @update:modelValue="handleToggle(`sms_${type.key}` as keyof NotificationPreferences, $event)"
            />
          </div>
        </template>
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

const props = defineProps<{
  businessType: 'merchant' | 'vendor'
}>()

const { notificationTypes, preferences, updatePreference } = useNotificationPreferences(props.businessType)

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
