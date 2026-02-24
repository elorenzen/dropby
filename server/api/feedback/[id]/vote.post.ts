import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const authUser = await serverSupabaseUser(event)

  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const feedbackId = getRouterParam(event, 'id')

  if (!feedbackId) {
    throw createError({ statusCode: 400, statusMessage: 'Feedback ID is required' })
  }

  const body = await readBody(event).catch(() => ({}))
  const voted = body?.voted === true

  const serviceClient = await serverSupabaseServiceRole(event)

  const { data: row, error: fetchError } = await serviceClient
    .from('user_feedback')
    .select('vote_count')
    .eq('id', feedbackId)
    .single()

  if (fetchError || !row) {
    throw createError({ statusCode: 404, statusMessage: 'Feedback not found' })
  }

  const current = Number(row.vote_count) || 0
  const newCount = voted ? current + 1 : Math.max(0, current - 1)

  const { error: updateError } = await serviceClient
    .from('user_feedback')
    .update({ vote_count: newCount })
    .eq('id', feedbackId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update vote count' })
  }

  return { success: true, voted, vote_count: newCount }
})
