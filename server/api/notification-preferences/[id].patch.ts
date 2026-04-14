import { serverSupabaseServiceRole } from '#supabase/server'
import { assertSelfOrSuperadmin, requireUserContext } from '~/server/utils/authz'

const VALID_KEYS = [
  'email_event_requests',
  'email_booking_confirmations',
  'email_event_reminders',
  'email_reviews',
  'email_event_invites',
  'sms_event_requests',
  'sms_booking_confirmations',
  'sms_event_reminders',
  'sms_reviews',
  'sms_event_invites',
]

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const actor = await requireUserContext(event)
  assertSelfOrSuperadmin(actor, userId)

  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Request body must be an object of notification preferences' })
  }

  for (const key of Object.keys(body)) {
    if (!VALID_KEYS.includes(key)) {
      throw createError({ statusCode: 400, statusMessage: `Invalid preference key: ${key}` })
    }
    if (typeof body[key] !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: `Preference "${key}" must be a boolean` })
    }
  }

  const client = serverSupabaseServiceRole(event)

  const { data: existingUser, error: fetchError } = await client
    .from('users')
    .select('notification_preferences')
    .eq('id', userId)
    .single()

  if (fetchError || !existingUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const currentPrefs = existingUser.notification_preferences || {}
  const mergedPrefs = { ...currentPrefs, ...body }

  const { data, error } = await client
    .from('users')
    .update({ notification_preferences: mergedPrefs, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('notification_preferences')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update notification preferences' })
  }

  return { success: true, notification_preferences: data.notification_preferences }
})
