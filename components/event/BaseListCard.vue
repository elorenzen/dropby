<template>
  <div class="bg-surface-card rounded-lg p-4 border border-surface-border">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-4 min-w-0 flex-1">
        <!-- Vendor Avatar Slot -->
        <slot name="vendor-avatar">
          <div class="w-12 h-12 rounded-full bg-surface-section flex items-center justify-center">
            <i class="pi pi-user text-md-gray"></i>
          </div>
        </slot>
        
        <!-- Event Content Slot -->
        <div class="min-w-0 flex-1">
          <slot name="event-content">
            <p class="font-semibold text-color truncate mb-1">Event Title</p>
            <p class="text-sm text-md-gray">Event Date</p>
            <p class="text-xs text-md-gray">Event Time</p>
          </slot>
        </div>
      </div>
      
      <!-- Right Side Actions Slot -->
      <div class="flex flex-col items-end gap-2">
        <!-- Status Badge Slot -->
        <slot name="status-badge" v-if="showStatusBadge">
          <Tag value="STATUS" severity="secondary" size="small" />
        </slot>
        
        <!-- Action Buttons Slot -->
        <div class="flex items-center gap-2">
          <slot name="action-buttons">

          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showStatusBadge?: boolean
}

const props = defineProps<Props>()

// Default to true if not provided
const showStatusBadge = props.showStatusBadge ?? true
</script>

<style scoped>
/* Base card styles */
:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

:deep(.p-button.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style> 