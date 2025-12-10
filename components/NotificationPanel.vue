<template>
  <OverlayPanel 
    ref="notificationPanel" 
    :dismissable="true"
    style="width: 400px; max-width: 90vw; max-height: 600px;"
  >
    <div class="notification-panel">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 pb-3 border-b">
        <h3 class="text-lg font-semibold" style="color: var(--p-text-color);">Notifications</h3>
        <div class="flex items-center gap-2">
          <Button
            v-if="unreadCount > 0"
            label="Mark all read"
            size="small"
            text
            @click="markAllAsRead"
            :loading="markingAllRead"
          />
          <Button
            icon="pi pi-times"
            size="small"
            text
            rounded
            @click="closePanel"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <ProgressSpinner />
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="text-center py-8">
        <i class="pi pi-bell text-4xl mb-3" style="color: var(--text-color-secondary);"></i>
        <p style="color: var(--text-color-secondary);">No notifications</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.is_read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex gap-3">
            <div class="notification-icon">
              <i :class="getNotificationIcon(notification.action_type)" class="text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-medium text-sm" style="color: var(--p-text-color);">
                  {{ notification.title }}
                </h4>
                <span 
                  v-if="!notification.is_read" 
                  class="unread-dot"
                ></span>
              </div>
              <p 
                v-if="notification.message" 
                class="text-sm mt-1" 
                style="color: var(--text-color-secondary);"
              >
                {{ notification.message }}
              </p>
              <p class="text-xs mt-2" style="color: var(--text-color-secondary);">
                {{ formatTime(notification.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import type { Notification } from '~/types'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'notification-clicked', notification: Notification): void
}>()

const notificationStore = useNotificationStore()
const router = useRouter()

const notificationPanel = ref()
const markingAllRead = ref(false)

const notifications = computed(() => notificationStore.getAllNotifications)
const unreadCount = computed(() => notificationStore.getUnreadCount)
const loading = computed(() => notificationStore.loading)

const closePanel = () => {
  emit('update:visible', false)
  notificationPanel.value?.hide()
}

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read if unread
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.id)
  }
  
  // Navigate to related entity if applicable
  if (notification.entity_type && notification.entity_id) {
    closePanel()
    navigateToEntity(notification)
  }
  
  emit('notification-clicked', notification)
}

const navigateToEntity = (notification: Notification) => {
  const { currentUser } = useAuth()
  const businessType = currentUser.value?.type
  const businessId = businessType === 'merchant' 
    ? currentUser.value?.associated_merchant_id 
    : currentUser.value?.associated_vendor_id
  
  if (!businessType || !businessId) return
  
  const basePath = `/${businessType}/${businessId}`
  
  switch (notification.entity_type) {
    case 'event':
      router.push(`${basePath}/events`)
      break
    case 'review':
      router.push(`${basePath}/ratings-and-reviews`)
      break
    case 'compliance':
      router.push(`/settings/${businessId}`)
      break
    case 'partnership':
      if (businessType === 'merchant') {
        router.push(`/settings/${businessId}`)
      }
      break
    case 'subscription':
      router.push(`/settings/${businessId}`)
      break
  }
}

const markAllAsRead = async () => {
  markingAllRead.value = true
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Error marking all as read:', error)
  } finally {
    markingAllRead.value = false
  }
}

const getNotificationIcon = (actionType: string): string => {
  const { NOTIFICATION_ICONS } = useNotificationTypes()
  return NOTIFICATION_ICONS[actionType] || 'pi pi-bell'
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

defineExpose({
  show: (event: Event) => notificationPanel.value?.toggle(event),
  hide: () => notificationPanel.value?.hide()
})
</script>

<style scoped>
.notification-panel {
  padding: 0;
}

.notifications-list {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--p-surface-border);
}

.notification-item:hover {
  background-color: var(--p-surface-hover);
}

.notification-item.unread {
  background-color: rgba(from var(--p-primary-color) r g b / 0.05);
  border-left: 3px solid var(--p-primary-color);
}

.notification-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--p-surface-ground);
  color: var(--p-primary-color);
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--p-primary-color);
  flex-shrink: 0;
  margin-top: 4px;
}

.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: var(--p-surface-ground);
}

.notifications-list::-webkit-scrollbar-thumb {
  background: var(--p-surface-border);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: var(--p-text-color-secondary);
}
</style>

