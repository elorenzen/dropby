import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Resolves whether the current request is from a superadmin.
 * Checks the `is_superadmin` column first (Option A), then falls
 * back to comparing the session email against SUPERADMIN_EMAIL (Option B).
 * Throws a 403 error if the user is not a superadmin.
 */
export async function requireSuperadmin(event: H3Event): Promise<void> {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('users')
    .select('is_superadmin, email')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (data.is_superadmin === true) {
    return
  }

  const config = useRuntimeConfig()
  if (config.superadminEmail && data.email === config.superadminEmail) {
    return
  }

  throw createError({ statusCode: 403, statusMessage: 'Forbidden – superadmin access required' })
}
