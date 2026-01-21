<template>
  <div class="coming-soon-container flex items-center justify-center p-8">
    <div class="coming-soon-content text-center max-w-md">
      <div class="icon-wrapper mb-6">
        <i :class="iconClass" class="text-5xl text-accent"></i>
      </div>
      <h3 class="text-2xl font-semibold text-text-main mb-3">
        {{ title }}
      </h3>
      <p class="text-text-muted leading-relaxed mb-6">
        {{ description }}
      </p>
      <div v-if="showNotify" class="notify-section">
        <p class="text-sm text-text-muted mb-3">Want to be notified when this is ready?</p>
        <Button 
          label="Notify Me" 
          icon="pi pi-bell" 
          outlined 
          size="small"
          @click="$emit('notify')"
        />
      </div>
      <div v-if="eta" class="mt-4">
        <Tag :value="eta" severity="info" icon="pi pi-clock" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
  showNotify?: boolean
  eta?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Coming Soon',
  description: 'This feature is currently under development and will be available in a future update.',
  icon: 'pi-wrench',
  showNotify: false,
  eta: ''
})

defineEmits<{
  notify: []
}>()

const iconClass = computed(() => `pi ${props.icon}`)
</script>

<style scoped>
.coming-soon-container {
  min-height: 300px;
  background: linear-gradient(135deg, var(--p-surface-50) 0%, var(--p-surface-100) 100%);
  border-radius: 12px;
  border: 1px dashed var(--p-surface-300);
}

:deep(.p-dark) .coming-soon-container {
  background: linear-gradient(135deg, var(--p-surface-800) 0%, var(--p-surface-900) 100%);
  border-color: var(--p-surface-600);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-surface-100);
  border-radius: 50%;
}

:deep(.p-dark) .icon-wrapper {
  background: var(--p-surface-700);
}
</style>
