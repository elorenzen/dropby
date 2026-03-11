import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseServiceRole(event)
    const token = getRouterParam(event, 'token')

    if (!token) {
      throw createError({ statusCode: 400, statusMessage: 'Invite token is required' })
    }

    const { data: invite, error: inviteError } = await client
      .from('event_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    const { data: eventData, error: eventError } = await client
      .from('events')
      .select('*')
      .eq('id', invite.event_id)
      .single()

    if (eventError || !eventData) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const { data: merchantData, error: merchantError } = await client
      .from('merchants')
      .select('id, merchant_name, formatted_address, phone, email, website, avatar_url')
      .eq('id', invite.merchant_id)
      .single()

    if (merchantError || !merchantData) {
      throw createError({ statusCode: 404, statusMessage: 'Merchant not found' })
    }

    return {
      invite,
      event: {
        id: eventData.id,
        start: eventData.start,
        end: eventData.end,
        location_address: eventData.location_address,
        location_url: eventData.location_url,
        notes: eventData.notes,
        status: eventData.status
      },
      merchant: merchantData
    }
  } catch (error: any) {
    console.error('Get event invite error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch invitation'
    })
  }
})
