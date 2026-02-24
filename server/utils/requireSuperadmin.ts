import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Ensures the current request is from an authenticated platform superadmin (is_superadmin).
 * Throws 401 if not authenticated, 403 if not superadmin.
 * Returns the authenticated user row from the `users` table.
 */
export async function requireSuperadmin(event: H3Event) {
  const authUser = await serverSupabaseUser(event)

  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: dbUser, error } = await client
    .from('users')
    .select('id, email, is_superadmin')
    .eq('id', authUser.id)
    .single()

  if (error || !dbUser) {
    throw createError({ statusCode: 401, statusMessage: 'User not found' })
  }

  if (dbUser.is_superadmin !== true) {
    throw createError({ statusCode: 403, statusMessage: 'Superadmin access required' })
  }

  return dbUser
}
