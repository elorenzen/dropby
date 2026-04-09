/**
 * Filters contactable users by a specific notification preference key.
 * Users without notification_preferences (or with a missing key) default to opted-in.
 */
export function filterByNotificationPreference(
  users: Array<{ email: string; notification_preferences?: Record<string, boolean> | null }>,
  preferenceKey: string
): string[] {
  return users
    .filter((user) => {
      if (!user.email) return false
      const prefs = user.notification_preferences
      if (!prefs || prefs[preferenceKey] === undefined) return true
      return prefs[preferenceKey] === true
    })
    .map((user) => user.email)
    .filter((email, index, arr) => arr.indexOf(email) === index)
}
