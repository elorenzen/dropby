import { serverSupabaseServiceRole } from '#supabase/server'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    const { eventId, merchantId, vendorInvites, externalEmails } = body

    if (!eventId || !merchantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'eventId and merchantId are required'
      })
    }

    if ((!vendorInvites || vendorInvites.length === 0) && (!externalEmails || externalEmails.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one vendor or external email is required'
      })
    }

    const { data: eventData, error: eventError } = await client
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !eventData) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const { data: merchantData, error: merchantError } = await client
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single()

    if (merchantError || !merchantData) {
      throw createError({ statusCode: 404, statusMessage: 'Merchant not found' })
    }

    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://dropby.dev'
    const date = new Date(eventData.start).toLocaleDateString()
    const start = new Date(eventData.start).toLocaleTimeString('en-US')
    const end = new Date(eventData.end).toLocaleTimeString('en-US')

    const results: { email: string; status: string; error?: string }[] = []

    // Process platform vendor invites
    if (vendorInvites && vendorInvites.length > 0) {
      for (const vendorId of vendorInvites) {
        try {
          const { data: vendorData } = await client
            .from('vendors')
            .select('id, vendor_name, email')
            .eq('id', vendorId)
            .single()

          if (!vendorData?.email) continue

          // Check if vendor users are available_to_contact and have email invites enabled
          const { data: vendorUsers } = await client
            .from('users')
            .select('email, available_to_contact, notification_preferences')
            .eq('associated_vendor_id', vendorId)
            .eq('available_to_contact', true)
            .not('email', 'is', null)

          if (!vendorUsers || vendorUsers.length === 0) continue

          const token = uuidv4()

          const { error: insertError } = await client
            .from('event_invites')
            .insert({
              event_id: eventId,
              merchant_id: merchantId,
              vendor_id: vendorId,
              email: vendorData.email,
              token,
              status: 'pending'
            })

          if (insertError) {
            results.push({ email: vendorData.email, status: 'error', error: insertError.message })
            continue
          }

          const recipientEmails = filterByNotificationPreference(vendorUsers, 'email_event_invites')

          try {
            await resend.emails.send({
              from: 'DropBy Support <support@dropby.dev>',
              to: recipientEmails,
              subject: `Event Invitation from ${merchantData.merchant_name}`,
              html: buildInviteEmail({
                merchantName: merchantData.merchant_name,
                date,
                start,
                end,
                location: eventData.location_address || 'TBD',
                locationUrl: eventData.location_url,
                notes: eventData.notes,
                isPlatformVendor: true,
                siteUrl
              })
            })
          } catch (emailError) {
            console.error('Failed to send vendor invite email:', emailError)
          }

          results.push({ email: vendorData.email, status: 'sent' })
        } catch (vendorError: any) {
          console.error('Error processing vendor invite:', vendorError)
          results.push({ email: vendorId, status: 'error', error: vendorError.message })
        }
      }
    }

    // Process external email invites
    if (externalEmails && externalEmails.length > 0) {
      for (const email of externalEmails) {
        try {
          const trimmedEmail = email.trim().toLowerCase()
          if (!trimmedEmail || !trimmedEmail.includes('@')) continue

          const token = uuidv4()

          const { error: insertError } = await client
            .from('event_invites')
            .insert({
              event_id: eventId,
              merchant_id: merchantId,
              vendor_id: null,
              email: trimmedEmail,
              token,
              status: 'pending'
            })

          if (insertError) {
            results.push({ email: trimmedEmail, status: 'error', error: insertError.message })
            continue
          }

          const inviteUrl = `${siteUrl}/event-invite/${token}`

          try {
            await resend.emails.send({
              from: 'DropBy Support <support@dropby.dev>',
              to: [trimmedEmail],
              subject: `You're invited to work an event at ${merchantData.merchant_name}`,
              html: buildInviteEmail({
                merchantName: merchantData.merchant_name,
                date,
                start,
                end,
                location: eventData.location_address || 'TBD',
                locationUrl: eventData.location_url,
                notes: eventData.notes,
                isPlatformVendor: false,
                siteUrl,
                inviteUrl
              })
            })
          } catch (emailError) {
            console.error('Failed to send external invite email:', emailError)
          }

          results.push({ email: trimmedEmail, status: 'sent' })
        } catch (externalError: any) {
          console.error('Error processing external invite:', externalError)
          results.push({ email, status: 'error', error: externalError.message })
        }
      }
    }

    return { success: true, results }
  } catch (error: any) {
    console.error('Send event invites error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send event invites'
    })
  }
})

function buildInviteEmail(params: {
  merchantName: string
  date: string
  start: string
  end: string
  location: string
  locationUrl: string | null
  notes: string | null
  isPlatformVendor: boolean
  siteUrl: string
  inviteUrl?: string
}): string {
  const locationHtml = params.locationUrl
    ? `<a href="${params.locationUrl}" target="_blank">${params.location}</a>`
    : params.location

  const actionHtml = params.isPlatformVendor
    ? `<p>Log in to your <a href="${params.siteUrl}">DropBy dashboard</a> to view and respond to this invitation.</p>`
    : `<div style="text-align: center; margin: 25px 0;">
        <a href="${params.inviteUrl}" style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View Invitation &amp; Respond
        </a>
      </div>
      <p style="font-size: 13px; color: #666;">Or copy this link: ${params.inviteUrl}</p>`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You're Invited to Work an Event!</h2>
      <p><strong>${params.merchantName}</strong> would like to invite you to work at their upcoming event:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p><strong>Date:</strong> ${params.date}</p>
        <p><strong>Time:</strong> ${params.start} - ${params.end}</p>
        <p><strong>Location:</strong> ${locationHtml}</p>
        ${params.notes ? `<p><strong>Notes:</strong> ${params.notes}</p>` : ''}
      </div>
      
      ${actionHtml}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated message from DropBy. Please do not reply to this email.</p>
      </div>
    </div>
  `
}
