<template>
  <Card class="skeleton-card">
    <template #content>
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <Skeleton width="40%" height="0.75rem" class="mb-2" />
          <Skeleton width="60%" height="1.5rem" class="mb-2" />
          <Skeleton width="30%" height="0.75rem" />
        </div>
        <Skeleton shape="circle" size="3rem" />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
// Simple card skeleton - matches analytics card pattern
</script>

<style scoped>
.skeleton-card {
  @apply bg-surface-card;
}
</style>
