<template>
  <div class="page-skeleton min-h-screen bg-background p-6">
    <!-- Header skeleton -->
    <div class="mb-8">
      <Skeleton width="300px" height="2rem" class="mb-2" />
      <Skeleton width="400px" height="1rem" />
    </div>

    <!-- Stats cards skeleton -->
    <div v-if="showStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card v-for="i in statsCount" :key="i">
        <template #content>
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <Skeleton width="60%" height="0.75rem" class="mb-2" />
              <Skeleton width="40%" height="1.5rem" class="mb-2" />
              <Skeleton width="50%" height="0.75rem" />
            </div>
            <Skeleton shape="circle" size="3rem" />
          </div>
        </template>
      </Card>
    </div>

    <!-- Search/filter bar skeleton -->
    <div v-if="showSearch" class="mb-8">
      <div class="flex gap-4 flex-wrap">
        <Skeleton width="300px" height="2.5rem" borderRadius="6px" />
        <Skeleton width="150px" height="2.5rem" borderRadius="6px" />
        <Skeleton width="150px" height="2.5rem" borderRadius="6px" />
      </div>
    </div>

    <!-- Content grid skeleton -->
    <div v-if="showGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="i in gridCount" :key="i">
        <template #content>
          <Skeleton width="100%" height="150px" class="mb-4" borderRadius="8px" />
          <Skeleton width="80%" height="1.25rem" class="mb-2" />
          <Skeleton width="60%" height="1rem" class="mb-4" />
          <div class="flex justify-between">
            <Skeleton width="30%" height="0.75rem" />
            <Skeleton width="20%" height="0.75rem" />
          </div>
        </template>
      </Card>
    </div>

    <!-- List skeleton -->
    <div v-if="showList" class="rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
      <ListSkeleton :rows="listRows" :show-avatar="listShowAvatar" :show-action="listShowAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ListSkeleton from './ListSkeleton.vue'

interface Props {
  showStats?: boolean
  statsCount?: number
  showSearch?: boolean
  showGrid?: boolean
  gridCount?: number
  showList?: boolean
  listRows?: number
  listShowAvatar?: boolean
  listShowAction?: boolean
}

withDefaults(defineProps<Props>(), {
  showStats: true,
  statsCount: 4,
  showSearch: true,
  showGrid: false,
  gridCount: 6,
  showList: false,
  listRows: 5,
  listShowAvatar: true,
  listShowAction: false
})
</script>
