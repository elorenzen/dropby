import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const authUser = await serverSupabaseUser(event)

  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const serviceClient = await serverSupabaseServiceRole(event)

  const { data, error } = await serviceClient
    .from('feedback_votes')
    .select('feedback_id')
    .eq('user_id', authUser.id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch votes' })
  }

  const votedIds = (data || []).map((v: { feedback_id: string }) => v.feedback_id)

  return { success: true, votedIds }
})
