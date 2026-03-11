import type { NotificationPreferences } from '~/types'
import { NOTIFICATION_TYPES, MERCHANT_DEFAULT_PREFERENCES, VENDOR_DEFAULT_PREFERENCES } from '~/types'

export const useNotificationPreferences = (businessType: 'merchant' | 'vendor') => {
  const userStore = useUserStore()

  const notificationTypes = computed(() => {
    return NOTIFICATION_TYPES.filter(t => t.businessTypes.includes(businessType))
  })

  const defaults = businessType === 'merchant'
    ? MERCHANT_DEFAULT_PREFERENCES
    : VENDOR_DEFAULT_PREFERENCES

  const preferences = computed<NotificationPreferences>(() => {
    return {
      ...defaults,
      ...(userStore.getUser?.notification_preferences || {})
    }
  })

  const updating = computed(() => userStore.updating)

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    await userStore.updateNotificationPreferences({ [key]: value })
  }

  return {
    notificationTypes,
    preferences,
    updating,
    updatePreference
  }
}
