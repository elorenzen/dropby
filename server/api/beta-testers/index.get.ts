import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('beta_testers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load beta testers' })
  }

  return data ?? []
})
