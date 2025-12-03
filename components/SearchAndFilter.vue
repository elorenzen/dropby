<template>
  <Card :class="cardClass">
    <template v-if="hasTitleSlot || hasSubtitleSlot || hasResultsCountText || hasActionsSlot" #title>
      <div class="flex items-center justify-between">
        <div v-if="hasTitleSlot || hasSubtitleSlot || hasResultsCountText">
          <slot name="title">
            <h3 v-if="title" class="text-xl font-semibold text-text-main">{{ title }}</h3>
          </slot>
          <slot name="subtitle">
            <p v-if="subtitle" class="text-sm text-text-muted mt-1">{{ subtitle }}</p>
            <p v-else-if="resultsCountText" class="text-sm text-text-muted mt-1">{{ resultsCountText }}</p>
          </slot>
        </div>
        <div v-if="hasActionsSlot" class="flex items-center gap-2">
          <slot name="actions"></slot>
        </div>
      </div>
    </template>
    
    <template #content>
      <div class="space-y-6">
        <!-- Search Bar and Sort By Section -->
        <div v-if="hasSearchBarSlot || hasSortBySlot" class="flex items-end gap-4">
          <!-- Search Bar Slot - takes remaining space -->
          <div v-if="hasSearchBarSlot" class="flex-1">
            <slot name="search-bar"></slot>
          </div>
          
          <!-- Sort By Slot (optional) - fixed width -->
          <div v-if="hasSortBySlot" class="w-48">
            <slot name="sort-by"></slot>
          </div>
        </div>

        <!-- Divider and Filters Section -->
        <template v-if="hasFiltersSlot">
          <div class="border-t border-surface-border pt-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-medium text-text-main">Filters</h4>
              <div v-if="hasClearFilters" class="flex gap-2">
                <slot name="clear-filters">
                  <Button 
                    v-if="showClearButton"
                    label="Clear Filters" 
                    outlined 
                    size="small"
                    @click="handleClearFilters"
                    :disabled="!hasActiveFilters"
                  />
                </slot>
              </div>
            </div>
            
            <!-- Filters Slot -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <slot name="filters"></slot>
            </div>
          </div>
        </template>

      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  cardClass?: string
  resultsCountText?: string
  showClearButton?: boolean
  hasActiveFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showClearButton: true,
  hasActiveFilters: false
})

const emit = defineEmits<{
  clearFilters: []
}>()

// Check if slots are provided
const slots = useSlots()
const hasTitleSlot = computed(() => !!slots.title)
const hasSubtitleSlot = computed(() => !!slots.subtitle)
const hasResultsCountText = computed(() => !hasSubtitleSlot.value && !!props.resultsCountText)
const hasActionsSlot = computed(() => !!slots.actions)
const hasSearchBarSlot = computed(() => !!slots['search-bar'])
const hasFiltersSlot = computed(() => !!slots.filters)
const hasSortBySlot = computed(() => !!slots['sort-by'])
const hasClearFilters = computed(() => !!slots['clear-filters'] || props.showClearButton)

const handleClearFilters = () => {
  emit('clearFilters')
}
</script>

<style scoped>
:deep(.p-card) {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

:deep(.p-card .p-card-title) {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

:deep(.p-card .p-card-content) {
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
}
</style>
