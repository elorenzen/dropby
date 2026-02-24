import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const serviceClient = await serverSupabaseServiceRole(event)

    // Verify the requester is authenticated
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Verify the requester is an admin
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.is_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Superadmin access required'
      })
    }

    // Fetch all feedback, newest first
    const { data, error } = await serviceClient
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to fetch feedback'
      })
    }

    return { success: true, feedback: data || [] }
  } catch (error: any) {
    if (error.statusCode && error.statusCode !== 500) throw error
    console.error('List feedback error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to fetch feedback'
    })
  }
})
