import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const client = await serverSupabaseClient(event)
  const serviceClient = await serverSupabaseServiceRole(event)

  if (method === 'GET') {
    await requireSuperadmin(event)

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
  }

  if (method === 'POST') {
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

    const { data: { user } } = await client.auth.getUser()

    if (!user && !email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in or provide an email address'
      })
    }

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
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
