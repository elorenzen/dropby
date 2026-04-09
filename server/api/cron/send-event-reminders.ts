import { serverSupabaseClient } from '#supabase/server'
import { Resend } from 'resend'
import type { ReminderType } from '~/types'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReminderWindow {
  type: ReminderType
  label: string
  rangeStart: Date
  rangeEnd: Date
}

function buildReminderWindows(now: Date): ReminderWindow[] {
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const addDays = (date: Date, days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  return [
    {
      type: '7d',
      label: '7 days',
      rangeStart: addDays(todayStart, 7),
      rangeEnd: addDays(todayEnd, 7),
    },
    {
      type: '1d',
      label: '1 day',
      rangeStart: addDays(todayStart, 1),
      rangeEnd: addDays(todayEnd, 1),
    },
    {
      type: 'day_of',
      label: 'today',
      rangeStart: todayStart,
      rangeEnd: todayEnd,
    },
  ]
}

function buildReminderEmailHtml(params: {
  reminderLabel: string
  merchantName: string
  vendorName: string
  date: string
  startTime: string
  endTime: string
  locationAddress: string | null
  locationUrl: string | null
  notes: string | null
}): string {
  const { reminderLabel, merchantName, vendorName, date, startTime, endTime, locationAddress, locationUrl, notes } = params

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">📅 Event Reminder</h2>
      <p>This is a friendly reminder that your event is coming up <strong>${reminderLabel}</strong> from now.</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p><strong>Merchant:</strong> ${merchantName}</p>
        <p><strong>Vendor:</strong> ${vendorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
        <p><strong>Location:</strong> <a href="${locationUrl || '#'}" target="_blank">${locationAddress || 'TBD'}</a></p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>

      <p>Please make sure everything is prepared and reach out to each other if you need to coordinate any details.</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #6b7280;">
        <p>This is an automated reminder from DropBy. Please do not reply to this email.</p>
      </div>
    </div>
  `
}

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    const expectedToken = process.env.CRON_SECRET

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const client = await serverSupabaseClient(event)
    const now = new Date()
    const windows = buildReminderWindows(now)

    const sentReminders: { eventId: string; reminderType: ReminderType; recipients: string[] }[] = []
    const errors: string[] = []

    for (const window of windows) {
      try {
        const { data: events, error: eventsError } = await client
          .from('events')
          .select('*')
          .eq('status', 'booked')
          .not('vendor', 'is', null)
          .not('merchant', 'is', null)
          .gte('start', window.rangeStart.toISOString())
          .lte('start', window.rangeEnd.toISOString())

        if (eventsError) {
          errors.push(`Failed to query events for ${window.type} window: ${eventsError.message}`)
          continue
        }

        if (!events || events.length === 0) continue

        for (const eventData of events) {
          try {
            const { data: existingReminder } = await client
              .from('event_reminders')
              .select('id')
              .eq('event_id', eventData.id)
              .eq('reminder_type', window.type)
              .limit(1)
              .single()

            if (existingReminder) continue

            const [merchantResult, vendorResult] = await Promise.all([
              client.from('merchants').select('merchant_name').eq('id', eventData.merchant).single(),
              client.from('vendors').select('vendor_name').eq('id', eventData.vendor).single(),
            ])

            const merchantName = merchantResult.data?.merchant_name || 'Merchant'
            const vendorName = vendorResult.data?.vendor_name || 'Vendor'

            const recipients: string[] = []

            const [merchantUsersResult, vendorUsersResult] = await Promise.all([
              client
                .from('users')
                .select('email, notification_preferences')
                .eq('associated_merchant_id', eventData.merchant)
                .eq('available_to_contact', true)
                .not('email', 'is', null),
              client
                .from('users')
                .select('email, notification_preferences')
                .eq('associated_vendor_id', eventData.vendor)
                .eq('available_to_contact', true)
                .not('email', 'is', null),
            ])

            if (!merchantUsersResult.error && merchantUsersResult.data) {
              filterByNotificationPreference(merchantUsersResult.data as any[], 'email_event_reminders')
                .forEach((email) => {
                  if (!recipients.includes(email)) recipients.push(email)
                })
            }

            if (!vendorUsersResult.error && vendorUsersResult.data) {
              filterByNotificationPreference(vendorUsersResult.data as any[], 'email_event_reminders')
                .forEach((email) => {
                  if (!recipients.includes(email)) recipients.push(email)
                })
            }

            if (recipients.length === 0) {
              errors.push(`No contactable recipients for event ${eventData.id} (${window.type} reminder)`)
              continue
            }

            const eventStart = new Date(eventData.start)
            const eventEnd = new Date(eventData.end)

            const html = buildReminderEmailHtml({
              reminderLabel: window.label,
              merchantName,
              vendorName,
              date: eventStart.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              startTime: eventStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              endTime: eventEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              locationAddress: eventData.location_address,
              locationUrl: eventData.location_url,
              notes: eventData.notes,
            })

            await resend.emails.send({
              from: 'DropBy Support <support@dropby.dev>',
              to: recipients,
              subject: `Event Reminder: ${vendorName} at ${merchantName} — ${window.label} away`,
              html,
            })

            const { error: insertError } = await client
              .from('event_reminders')
              .insert({
                event_id: eventData.id,
                reminder_type: window.type,
                sent_at: new Date().toISOString(),
              })

            if (insertError) {
              errors.push(`Failed to record reminder for event ${eventData.id} (${window.type}): ${insertError.message}`)
            }

            sentReminders.push({
              eventId: eventData.id,
              reminderType: window.type,
              recipients,
            })
          } catch (err: any) {
            errors.push(`Error processing event ${eventData.id} for ${window.type} reminder: ${err.message}`)
          }
        }
      } catch (err: any) {
        errors.push(`Error processing ${window.type} reminder window: ${err.message}`)
      }
    }

    return {
      success: true,
      message: `Sent ${sentReminders.length} event reminders`,
      sentCount: sentReminders.length,
      sentReminders,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    }
  } catch (error: any) {
    console.error('Event reminder cron error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to send event reminders',
    })
  }
})
