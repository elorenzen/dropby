import type { NotificationPreferences } from '~/types'

export const useNotificationPreferences = () => {
  const userStore = useUserStore()

  const preferences = computed<NotificationPreferences>(() => {
    return userStore.getNotificationPreferences()
  })

  const updating = computed(() => userStore.updating)

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    await userStore.updateNotificationPreferences({ [key]: value })
  }

  return {
    preferences,
    updating,
    updatePreference
  }
}
