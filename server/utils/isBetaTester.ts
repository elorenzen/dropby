import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Resolves the current session user's email and checks whether it
 * exists in the beta_testers table. Returns true if the user is a
 * beta tester, false otherwise (including unauthenticated requests).
 */
export async function isBetaTester(event: H3Event): Promise<boolean> {
  try {
    const authUser = await serverSupabaseUser(event)
    if (!authUser) return false

    const client = await serverSupabaseServiceRole(event)

    const { data: dbUser } = await client
      .from('users')
      .select('email')
      .eq('id', authUser.id)
      .single()

    if (!dbUser?.email) return false

    const { data: betaTester } = await client
      .from('beta_testers')
      .select('id')
      .eq('email', dbUser.email.toLowerCase())
      .maybeSingle()

    return !!betaTester
  } catch {
    return false
  }
}
