<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4 min-w-0 flex-1">
        <!-- Vendor Avatar Slot -->
        <slot name="vendor-avatar">
          <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <i class="pi pi-user text-gray-400 dark:text-gray-500"></i>
          </div>
        </slot>
        
        <!-- Event Content Slot -->
        <div class="min-w-0 flex-1">
          <slot name="event-content">
            <p class="font-semibold text-text-main truncate mb-1">Event Title</p>
            <p class="text-sm text-text-muted">Event Date</p>
            <p class="text-xs text-text-muted">Event Time</p>
          </slot>
        </div>
      </div>
      
      <!-- Right Side Actions Slot -->
      <div class="flex flex-col items-end gap-2">
        <!-- Status Badge Slot -->
        <slot name="status-badge">
          <Tag value="STATUS" severity="secondary" size="small" />
        </slot>
        
        <!-- Action Buttons Slot -->
        <div class="flex items-center gap-2">
          <slot name="action-buttons">
            <Button 
              icon="pi pi-eye"
              severity="secondary"
              outlined
              size="small"
            />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed - this is a pure layout component with slots
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