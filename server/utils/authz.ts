import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

type BusinessType = 'merchant' | 'vendor'

export interface UserContext {
  id: string
  email: string | null
  type: BusinessType | null
  is_admin: boolean
  is_superadmin: boolean
  associated_merchant_id: string | null
  associated_vendor_id: string | null
}

export interface BusinessContext extends UserContext {
  businessType: BusinessType
  businessId: string
}

export async function requireUserContext(event: H3Event): Promise<UserContext> {
  const authUser = await serverSupabaseUser(event)
  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const client = await serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from('users')
    .select('id, email, type, is_admin, is_superadmin, associated_merchant_id, associated_vendor_id')
    .eq('id', authUser.id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 401, statusMessage: 'User profile not found' })
  }

  return {
    id: data.id,
    email: data.email ?? null,
    type: (data.type as BusinessType | null) ?? null,
    is_admin: Boolean(data.is_admin),
    is_superadmin: Boolean(data.is_superadmin),
    associated_merchant_id: data.associated_merchant_id ?? null,
    associated_vendor_id: data.associated_vendor_id ?? null
  }
}

export async function requireSuperadminContext(event: H3Event): Promise<UserContext> {
  const user = await requireUserContext(event)
  const config = useRuntimeConfig(event)

  const emailMatch = Boolean(config.superadminEmail) && user.email === config.superadminEmail
  if (!user.is_superadmin && !emailMatch) {
    throw createError({ statusCode: 403, statusMessage: 'Superadmin access required' })
  }

  return user
}

export async function requireBusinessContext(
  event: H3Event,
  expectedType?: BusinessType
): Promise<BusinessContext> {
  const user = await requireUserContext(event)

  if (!user.type || !['merchant', 'vendor'].includes(user.type)) {
    throw createError({ statusCode: 403, statusMessage: 'Business account required' })
  }

  if (expectedType && user.type !== expectedType) {
    throw createError({ statusCode: 403, statusMessage: `${expectedType} access required` })
  }

  const businessType = user.type
  const businessId = businessType === 'merchant' ? user.associated_merchant_id : user.associated_vendor_id

  if (!businessId) {
    throw createError({ statusCode: 403, statusMessage: 'User is not associated with a business account' })
  }

  return {
    ...user,
    businessType,
    businessId
  }
}

export function assertSelfOrSuperadmin(actor: UserContext, targetUserId: string) {
  if (actor.id !== targetUserId && !actor.is_superadmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
}
