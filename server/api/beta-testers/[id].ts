import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Beta tester ID is required' })
  }

  const client = await serverSupabaseServiceRole(event)
  const method = getMethod(event)

  if (method === 'PATCH') {
    const body = await readBody(event)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.email !== undefined) {
      if (typeof body.email !== 'string' || !body.email.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Email must be a non-empty string' })
      }
      updates.email = body.email.trim().toLowerCase()
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes || null
    }

    const { data, error } = await client
      .from('beta_testers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw createError({ statusCode: 409, statusMessage: 'This email is already a beta tester' })
      }
      throw createError({ statusCode: 500, statusMessage: 'Failed to update beta tester' })
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Beta tester not found' })
    }
    return data
  }

  if (method === 'DELETE') {
    const { error } = await client
      .from('beta_testers')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete beta tester' })
    }
    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
