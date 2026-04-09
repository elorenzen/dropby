import { serverSupabaseServiceRole } from '#supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseServiceRole(event)
    const token = getRouterParam(event, 'token')
    const body = await readBody(event)

    if (!token) {
      throw createError({ statusCode: 400, statusMessage: 'Invite token is required' })
    }

    const { status, vendorName, vendorPhone, vendorDescription } = body

    if (!status || !['accepted', 'declined'].includes(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid status (accepted/declined) is required' })
    }

    const { data: invite, error: inviteError } = await client
      .from('event_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
    }

    if (invite.status !== 'pending') {
      throw createError({ statusCode: 400, statusMessage: 'This invitation has already been responded to' })
    }

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'accepted' && !invite.vendor_id) {
      if (!vendorName) {
        throw createError({ statusCode: 400, statusMessage: 'Vendor name is required to accept' })
      }
      updateData.external_vendor_name = vendorName
      updateData.external_vendor_phone = vendorPhone || null
      updateData.external_vendor_description = vendorDescription || null
    }

    const { data: updatedInvite, error: updateError } = await client
      .from('event_invites')
      .update(updateData)
      .eq('token', token)
      .select()
      .single()

    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to update invitation' })
    }

    // Notify merchant users about the response
    try {
      const { data: merchantData } = await client
        .from('merchants')
        .select('merchant_name')
        .eq('id', invite.merchant_id)
        .single()

      const { data: eventData } = await client
        .from('events')
        .select('start')
        .eq('id', invite.event_id)
        .single()

      const { data: merchantUsers } = await client
        .from('users')
        .select('email')
        .eq('associated_merchant_id', invite.merchant_id)
        .eq('available_to_contact', true)
        .not('email', 'is', null)

      if (merchantUsers && merchantUsers.length > 0) {
        const recipientEmails = merchantUsers.map((u: any) => u.email).filter(Boolean)
        const respondentName = invite.vendor_id
          ? (await client.from('vendors').select('vendor_name').eq('id', invite.vendor_id).single()).data?.vendor_name || invite.email
          : vendorName || invite.email
        const eventDate = eventData ? new Date(eventData.start).toLocaleDateString() : 'your event'

        const statusText = status === 'accepted' ? 'accepted' : 'declined'

        await resend.emails.send({
          from: 'DropBy Support <support@dropby.dev>',
          to: recipientEmails,
          subject: `Event Invite ${statusText}: ${respondentName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Event Invitation ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
              <p><strong>${respondentName}</strong> has <strong>${statusText}</strong> your invitation for the event on ${eventDate}.</p>
              ${status === 'accepted' && !invite.vendor_id ? `
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Vendor Information</h4>
                  <p><strong>Name:</strong> ${vendorName}</p>
                  ${vendorPhone ? `<p><strong>Phone:</strong> ${vendorPhone}</p>` : ''}
                  ${vendorDescription ? `<p><strong>Description:</strong> ${vendorDescription}</p>` : ''}
                </div>
              ` : ''}
              <p>Log in to your DropBy dashboard for more details.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p>This is an automated message from DropBy. Please do not reply to this email.</p>
              </div>
            </div>
          `
        })
      }
    } catch (notifyError) {
      console.error('Failed to notify merchant about invite response:', notifyError)
    }

    return { success: true, invite: updatedInvite }
  } catch (error: any) {
    console.error('Respond to event invite error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to respond to invitation'
    })
  }
})
