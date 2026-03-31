import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * Vendors cannot reliably UPDATE events through the anon key when RLS only allows
 * merchants to own writes — PostgREST then returns 0 rows and .single() throws PGRST116.
 * This route applies pending_requests changes with the service role after verifying
 * the signed-in user belongs to the vendor.
 */
export default defineEventHandler(async (event) => {
  const authUser = await serverSupabaseUser(event)
  if (!authUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const body = await readBody<{
    eventId?: string
    vendorId?: string
    action?: 'add' | 'remove'
  }>(event)

  const eventId = body?.eventId?.trim()
  const vendorId = body?.vendorId?.trim()
  const action = body?.action === 'remove' ? 'remove' : 'add'

  if (!eventId || !vendorId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId and vendorId are required' })
  }

  const serviceClient = await serverSupabaseServiceRole(event)

  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('type, associated_vendor_id')
    .eq('id', authUser.id)
    .maybeSingle()

  if (profileError || !profile) {
    throw createError({ statusCode: 403, statusMessage: 'User profile not found' })
  }

  if (profile.type !== 'vendor' || profile.associated_vendor_id !== vendorId) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed for this vendor account' })
  }

  const { data: ev, error: evError } = await serviceClient
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle()

  if (evError || !ev) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  if (ev.status !== 'open') {
    throw createError({ statusCode: 400, statusMessage: 'This event is not open for requests' })
  }

  if (new Date(ev.start as string).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'This event has already started' })
  }

  const current = Array.isArray(ev.pending_requests) ? [...ev.pending_requests] : []

  if (action === 'add') {
    if (current.includes(vendorId)) {
      return { success: true, alreadyRequested: true, event: ev }
    }
    current.push(vendorId)
  } else {
    if (!current.includes(vendorId)) {
      return { success: true, event: ev }
    }
    const idx = current.indexOf(vendorId)
    current.splice(idx, 1)
  }

  const pending_requests = current.length > 0 ? current : null

  const { data: updated, error: upError } = await serviceClient
    .from('events')
    .update({
      pending_requests,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .select('*')
    .single()

  if (upError || !updated) {
    throw createError({
      statusCode: 500,
      statusMessage: upError?.message || 'Failed to update event'
    })
  }

  return { success: true, event: updated }
})
