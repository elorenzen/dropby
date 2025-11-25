/**
 * Composable to access notification types and icons
 */
import { NOTIFICATION_ACTION_TYPES, NOTIFICATION_ICONS, type NotificationActionType } from '~/constants/notificationTypes'

export const useNotificationTypes = () => {
  return {
    NOTIFICATION_ACTION_TYPES,
    NOTIFICATION_ICONS,
    getIcon: (actionType: string): string => {
      return NOTIFICATION_ICONS[actionType] || 'pi pi-bell'
    }
  }
}

export type { NotificationActionType }

