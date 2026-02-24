import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'

export default defineEventHandler(async (event) => {
  const admin = await requireSuperadmin(event)
  const body = await readBody(event)

  const { email, notes } = body

  if (!email || typeof email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const client = await serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('beta_testers')
    .insert({
      email: normalizedEmail,
      notes: notes || null,
      added_by: admin.id
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'This email is already a beta tester' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to add beta tester' })
  }

  return data
})
