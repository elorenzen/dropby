import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Delete user from the users database table first
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

    // Delete user from Supabase Authentication
    const { error: authError } = await client.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Failed to delete auth user (DB record already removed):', authError)
      throw createError({
        statusCode: 500,
        statusMessage: authError.message || 'Failed to delete user from authentication'
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete user error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to delete user'
    })
  }
})
