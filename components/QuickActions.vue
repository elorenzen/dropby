<template>
  <Card class="quick-actions-card">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-bolt" style="color: var(--primary-color);"></i>
        <span>Quick Actions</span>
      </div>
    </template>
    <template #content>
      <div class="quick-actions-grid">
        <Button
          v-for="action in actions"
          :key="action.id"
          @click="action.command"
          :label="action.label"
          :icon="action.icon"
          :severity="action.severity || 'secondary'"
          outlined
          class="quick-action-button"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
interface QuickAction {
  id: string
  label: string
  icon: string
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'
  command: () => void
}

const props = defineProps<{
  userType: 'merchant' | 'vendor'
}>()

const emit = defineEmits(['create-event'])

const router = useRouter()
const { currentUser } = useAuth()

const businessId = computed(() => {
  if (!currentUser.value) return null
  return props.userType === 'vendor'
    ? currentUser.value.associated_vendor_id
    : currentUser.value.associated_merchant_id
})

const basePath = computed(() => {
  if (!props.userType || !businessId.value) return ''
  return `/${props.userType}/${businessId.value}`
})

const actions = computed((): QuickAction[] => {
  if (props.userType === 'merchant') {
    return [
      {
        id: 'create-event',
        label: 'Create Event',
        icon: 'pi pi-plus',
        severity: 'success',
        command: () => emit('create-event')
      },
      {
        id: 'view-requests',
        label: 'View Requests',
        icon: 'pi pi-inbox',
        severity: 'info',
        command: () => router.push(`${basePath.value}/events`)
      },
      {
        id: 'recurring-events',
        label: 'Recurring Events',
        icon: 'pi pi-replay',
        command: () => router.push(`${basePath.value}/recurring-events`)
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => router.push(`/settings/${businessId.value}`)
      }
    ]
  } else {
    return [
      {
        id: 'find-events',
        label: 'Find Events',
        icon: 'pi pi-search',
        severity: 'success',
        command: () => router.push('/viewer/events')
      },
      {
        id: 'my-requests',
        label: 'My Requests',
        icon: 'pi pi-send',
        severity: 'info',
        command: () => router.push(`${basePath.value}/events`)
      },
      {
        id: 'update-menu',
        label: 'Update Menu',
        icon: 'pi pi-list',
        severity: 'warn',
        command: () => router.push(`/settings/${businessId.value}?activeTab=2`)
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => router.push(`/settings/${businessId.value}`)
      }
    ]
  }
})
</script>

<style scoped>
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.quick-action-button {
  justify-content: flex-start !important;
  padding: 0.875rem 1rem !important;
}

:deep(.quick-action-button .p-button-label) {
  font-weight: 500;
}

/* Mobile: 4 columns, icon only */
@media (max-width: 640px) {
  .quick-actions-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  .quick-action-button {
    flex-direction: column !important;
    padding: 0.75rem 0.5rem !important;
    gap: 0.25rem;
  }
  
  :deep(.quick-action-button .p-button-icon) {
    margin-right: 0 !important;
    font-size: 1.25rem;
  }
  
  :deep(.quick-action-button .p-button-label) {
    font-size: 0.625rem;
    text-align: center;
  }
}
</style>
