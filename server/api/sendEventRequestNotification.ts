import { serverSupabaseClient } from '#supabase/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
                <h2 style="color: #FF8906;">📋 New Event Request</h2>
                <p><strong>${vendorData.vendor_name}</strong> has requested to work at your establishment:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Event Details</h3>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${start} - ${end}</p>
                    <p><strong>Location:</strong> ${eventData.location_address || 'TBD'}</p>
                    ${eventData.notes ? `<p><strong>Notes:</strong> ${eventData.notes}</p>` : ''}
                </div>
                
                <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0;">Vendor Information</h4>
                    <p><strong>Name:</strong> ${vendorData.vendor_name}</p>
                    <p><strong>Description:</strong> ${vendorData.vendor_description || 'No description provided'}</p>
                    ${vendorData.cuisine ? `<p><strong>Cuisine:</strong> ${vendorData.cuisine.join(', ')}</p>` : ''}
                    ${vendorData.phone ? `<p><strong>Phone:</strong> ${vendorData.phone}</p>` : ''}
                    ${vendorData.email ? `<p><strong>Email:</strong> ${vendorData.email}</p>` : ''}
                </div>
                
                <p>Please log into your DropBy dashboard to approve or decline this request.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <p>This is an automated message from DropBy. Please do not reply to this email.</p>
                </div>
            </div>
        `

        // Send email to merchant
        const recipients = ['eric.lorenzen@gmail.com'] // Default for testing
        
        if (merchantData.email) {
            recipients.push(merchantData.email)
        }

        const emailData = await resend.emails.send({
            from: 'DropBy Support <noreply@dropby.com>',
            to: recipients,
            subject: `New Event Request: ${vendorData.vendor_name} for ${date}`,
            html: content,
        })

        return { success: true, data: emailData }
        
    } catch (error) {
        console.error('Event request notification error:', error)
        return { error: error.message || 'Failed to send event request notification' }
    }
}) 