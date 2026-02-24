import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method !== 'PATCH') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const admin = await requireSuperadmin(event)
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

  const serviceClient = await serverSupabaseServiceRole(event)

  const { data, error } = await serviceClient
    .from('user_feedback')
    .update({
      status,
      reviewed_by: admin.id,
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
})
