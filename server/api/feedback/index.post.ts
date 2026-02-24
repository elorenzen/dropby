import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const serviceClient = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    const { type, title, description, email } = body

    if (!type || !['bug', 'feature_request', 'other'].includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid feedback type is required (bug, feature_request, or other)'
      })
    }

    if (!title || !title.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required'
      })
    }

    if (!description || !description.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Description is required'
      })
    }

    // Get the authenticated user (optional — allows anonymous with email)
    const { data: { user } } = await client.auth.getUser()

    if (!user && !email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in or provide an email address'
      })
    }

    // Resolve email: prefer session email, allow override from body
    let resolvedEmail = email || null
    if (user) {
      resolvedEmail = resolvedEmail || user.email || null
    }

    const { data, error } = await serviceClient
      .from('user_feedback')
      .insert({
        user_id: user?.id || null,
        email: resolvedEmail,
        type,
        title: title.trim(),
        description: description.trim(),
        status: 'new'
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to submit feedback'
      })
    }

    return { success: true, feedback: data }
  } catch (error: any) {
    if (error.statusCode && error.statusCode !== 500) throw error
    console.error('Create feedback error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to submit feedback'
    })
  }
})
