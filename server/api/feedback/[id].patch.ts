import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const serviceClient = await serverSupabaseServiceRole(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback ID is required'
      })
    }

    const { status } = body
    const validStatuses = ['new', 'viewed', 'approved', 'working_on_it', 'done']

    if (!status || !validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Valid status is required (${validStatuses.join(', ')})`
      })
    }

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

    const { data, error } = await serviceClient
      .from('user_feedback')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to update feedback'
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Feedback not found'
      })
    }

    return { success: true, feedback: data }
  } catch (error: any) {
    if (error.statusCode && error.statusCode !== 500) throw error
    console.error('Update feedback error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to update feedback'
    })
  }
})
