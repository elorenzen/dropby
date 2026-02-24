import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Beta tester ID is required' })
  }

  const client = await serverSupabaseServiceRole(event)

  const { error } = await client
    .from('beta_testers')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete beta tester' })
  }

  return { success: true }
})
