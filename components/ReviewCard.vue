<template>
  <div :class="['rounded-lg border', paddingClass, borderClass]">
    <div class="flex items-start gap-4">
      <!-- Left: Reviewer/Recipient Data -->
      <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
        <NuxtImg 
          :src="avatar || ''" 
          :alt="name || ''" 
          class="w-12 h-12 rounded-full"
        />
        <div class="min-w-0">
          <p class="font-semibold truncate text-text-main text-primary">{{ name || 'N/A' }}</p>
          <p class="text-sm text-text-muted">{{ eventDate ? new Date(eventDate).toLocaleDateString() : 'N/A' }}</p>
          <p class="text-xs text-text-muted">{{ eventTime || 'N/A' }}</p>
        </div>
      </div>
      
      <!-- Middle: Review Content or Empty -->
      <div v-if="comment || $slots.middle" class="flex-1 min-w-0 border-l border-r border-surface-border px-4">
        <slot name="middle">
          <p v-if="comment" class="text-sm leading-relaxed italic">"{{ comment }}"</p>
        </slot>
      </div>
      
      <!-- Right: Review Metadata or Actions -->
      <div class="flex flex-col items-end gap-2 min-w-0 flex-shrink-0">
        <div class="flex items-center gap-2">
          <Rating v-if="rating !== undefined && rating > 0" :model-value="rating" readonly :cancel="false" />
          <slot name="actions" />
        </div>
        <p v-if="createdAt" class="text-xs text-text-muted text-right">Reviewed on {{ new Date(createdAt).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  avatar?: string
  name?: string
  eventDate?: string | null
  eventTime?: string
  comment?: string
  rating?: number
  createdAt?: string
  borderClass?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  borderClass: 'bg-surface-card border-surface-border',
  compact: false
})

const paddingClass = computed(() => props.compact ? 'p-3' : 'p-4')
</script>

<style scoped>
/* Component styles are handled by parent */
</style>
