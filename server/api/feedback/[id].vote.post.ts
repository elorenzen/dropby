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

  const serviceClient = await serverSupabaseServiceRole(event)

  const { data: existing } = await serviceClient
    .from('feedback_votes')
    .select('id')
    .eq('feedback_id', feedbackId)
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (existing) {
    const { error: deleteError } = await serviceClient
      .from('feedback_votes')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to remove vote' })
    }

    const { data: updated } = await serviceClient
      .from('user_feedback')
      .select('vote_count')
      .eq('id', feedbackId)
      .single()

    return { success: true, voted: false, vote_count: updated?.vote_count ?? 0 }
  }

  const { error: insertError } = await serviceClient
    .from('feedback_votes')
    .insert({ feedback_id: feedbackId, user_id: authUser.id })

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to record vote' })
  }

  const { data: updated } = await serviceClient
    .from('user_feedback')
    .select('vote_count')
    .eq('id', feedbackId)
    .single()

  return { success: true, voted: true, vote_count: updated?.vote_count ?? 0 }
})
