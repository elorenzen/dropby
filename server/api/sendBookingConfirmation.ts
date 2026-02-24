import { serverSupabaseClient } from '#supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event)
        const query = getQuery(event)

        // Validate required parameters
        if (!query.eventId || !query.merchantId || !query.vendorId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required parameters: eventId, merchantId, vendorId'
            })
        }

        // Fetch event data
        const { data: eventData, error: eventError } = await client
            .from('events')
            .select()
            .eq('id', query.eventId)
            .single()
        
        if (eventError || !eventData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Event not found'
            })
        }
        
        // Fetch merchant data
        const { data: merchantData, error: merchantError } = await client
            .from('merchants')
            .select()
            .eq('id', query.merchantId)
            .single()
        
        if (merchantError || !merchantData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Merchant not found'
            })
        }
        
        // Fetch vendor data
        const { data: vendorData, error: vendorError } = await client
            .from('vendors')
            .select()
            .eq('id', query.vendorId)
            .single()

        if (vendorError || !vendorData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Vendor not found'
            })
        }

        const date = new Date(eventData.start).toLocaleDateString()
        const start = new Date(eventData.start).toLocaleTimeString('en-US')
        const end = new Date(eventData.end).toLocaleTimeString('en-US')
        
        const content = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: var(--primary-color);">🎉 Event Booked Successfully!</h2>
                <p><strong>${merchantData.merchant_name}</strong> has approved <strong>${vendorData.vendor_name}</strong> to work the following event:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Event Details</h3>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${start} - ${end}</p>
                    <p><strong>Location:</strong> <a href="${eventData.location_url || '#'}" target="_blank">${eventData.location_address || 'TBD'}</a></p>
                    ${eventData.notes ? `<p><strong>Notes:</strong> ${eventData.notes}</p>` : ''}
                </div>
                
                <p>Please contact each other to coordinate setup and any additional details.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: var(--secondary-color);">
                    <p>This is an automated message from DropBy. Please do not reply to this email.</p>
                </div>
            </div>
        `

        // Get all user emails from both merchant and vendor businesses
        // Users must have available_to_contact = true and email IS NOT NULL
        const recipients: string[] = []
        
        // Get merchant user emails
        const { data: merchantUsers, error: merchantUsersError } = await client
            .from('users')
            .select('email')
            .eq('associated_merchant_id', query.merchantId)
            .eq('available_to_contact', true)
            .not('email', 'is', null)
        
        if (!merchantUsersError && merchantUsers) {
            merchantUsers.forEach((user: any) => {
                if (user.email && !recipients.includes(user.email)) {
                    recipients.push(user.email)
                }
            })
        }
        
        // Get vendor user emails
        const { data: vendorUsers, error: vendorUsersError } = await client
            .from('users')
            .select('email')
            .eq('associated_vendor_id', query.vendorId)
            .eq('available_to_contact', true)
            .not('email', 'is', null)
        
        if (!vendorUsersError && vendorUsers) {
            vendorUsers.forEach((user: any) => {
                if (user.email && !recipients.includes(user.email)) {
                    recipients.push(user.email)
                }
            })
        }
        
        // Only send if we have at least one recipient
        if (recipients.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No email addresses found for merchant or vendor users (available for contact)'
            })
        }

        const emailData = await resend.emails.send({
            from: 'DropBy Support <support@dropby.dev>',
            to: recipients,
            subject: `Event Booked: ${vendorData.vendor_name} at ${merchantData.merchant_name}`,
            html: content,
        })

        return { success: true, data: emailData }
        
    } catch (error) {
        console.error('Email notification error:', error)
        return { error: error.message || 'Failed to send email notification' }
    }
})
