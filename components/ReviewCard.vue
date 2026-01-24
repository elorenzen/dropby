<template>
  <div class="bg-surface-card rounded-lg p-4 border border-surface-border">
    <div class="flex items-start gap-4">
      <!-- Left: Reviewer/Recipient Data -->
      <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
        <NuxtImg 
          :src="avatar || ''" 
          :alt="name || ''" 
          class="w-12 h-12 rounded-full"
        />
        <div class="min-w-0">
          <p class="font-semibold truncate text-text-main">{{ name || 'N/A' }}</p>
          <p class="text-sm text-text-muted">{{ eventDate ? new Date(eventDate).toLocaleDateString() : 'N/A' }}</p>
          <p class="text-xs text-text-muted">{{ eventTime || 'N/A' }}</p>
        </div>
      </div>
      
      <!-- Middle: Review Content -->
      <div class="flex-1 min-w-0 border-l border-r border-surface-border px-4">
        <p class="text-sm leading-relaxed italic">"{{ comment }}"</p>
      </div>
      
      <!-- Right: Review Metadata -->
      <div class="flex flex-col items-end gap-2 min-w-0 flex-shrink-0">
        <div class="flex items-center gap-2">
          <Rating :model-value="rating" readonly :cancel="false" />
          <slot name="actions" />
        </div>
        <p class="text-xs text-text-muted text-right">Reviewed on {{ new Date(createdAt).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatar?: string
  name?: string
  eventDate?: string | null
  eventTime?: string
  comment?: string
  rating: number
  createdAt: string
}

defineProps<Props>()
</script>

<style scoped>
/* Component styles are handled by parent */
</style>
