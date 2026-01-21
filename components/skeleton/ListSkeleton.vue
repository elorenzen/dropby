<template>
  <div class="list-skeleton">
    <div 
      v-for="i in rows" 
      :key="i" 
      class="flex items-center gap-4 p-4 border-b border-surface-200 dark:border-surface-700"
    >
      <Skeleton v-if="showAvatar" shape="circle" size="3rem" />
      <div class="flex-1">
        <Skeleton width="70%" height="1rem" class="mb-2" />
        <Skeleton width="40%" height="0.75rem" />
      </div>
      <Skeleton v-if="showAction" width="5rem" height="2rem" borderRadius="6px" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rows?: number
  showAvatar?: boolean
  showAction?: boolean
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  showAvatar: true,
  showAction: false
})
</script>
