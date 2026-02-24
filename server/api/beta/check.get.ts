import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const authUser = await serverSupabaseUser(event)

  if (!authUser) {
    return { isBeta: false }
  }

  const client = await serverSupabaseServiceRole(event)

  const { data: dbUser } = await client
    .from('users')
    .select('email')
    .eq('id', authUser.id)
    .single()

  if (!dbUser?.email) {
    return { isBeta: false }
  }

  const { data: betaTester } = await client
    .from('beta_testers')
    .select('id')
    .eq('email', dbUser.email.toLowerCase())
    .maybeSingle()

  return { isBeta: !!betaTester }
})
