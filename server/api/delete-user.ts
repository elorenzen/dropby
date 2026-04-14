import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadminContext } from '~/server/utils/authz'

export default defineEventHandler(async (event) => {
  try {
    await requireSuperadminContext(event)
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // 1. Delete from public.users if row exists (RLS-safe; service role sees all)
    const { error: dbError } = await client
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      throw createError({
        statusCode: 500,
        statusMessage: dbError.message || 'Failed to delete user record from database'
      })
    }

    // 2. Delete from Supabase Auth if the auth user exists (e.g. invited but not yet signed in)
    const { error: authError } = await client.auth.admin.deleteUser(userId)

    if (authError) {
      const isNotFound = /user not found|not found/i.test(authError.message || '')
      if (isNotFound) {
        // Auth user already gone or never existed (e.g. invited user) – not a failure
        return { success: true }
      }
      console.error('Failed to delete auth user:', authError)
      throw createError({
        statusCode: 500,
        statusMessage: authError.message || 'Failed to delete user from authentication'
      })
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode && error.statusCode !== 500) throw error
    console.error('Delete user error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to delete user'
    })
  }
})
