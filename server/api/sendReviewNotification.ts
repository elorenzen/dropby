import { serverSupabaseClient } from '#supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event)
        const query = getQuery(event)

        if (!query.recipientId || !query.senderId || !query.rating) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required parameters: recipientId, senderId, rating'
            })
        }

        const rating = Number(query.rating)

        // Determine if sender/recipient are merchants or vendors
        const [
            { data: senderMerchant },
            { data: senderVendor },
            { data: recipientMerchant },
            { data: recipientVendor }
        ] = await Promise.all([
            client.from('merchants').select('id, merchant_name').eq('id', query.senderId).maybeSingle(),
            client.from('vendors').select('id, vendor_name').eq('id', query.senderId).maybeSingle(),
            client.from('merchants').select('id, merchant_name').eq('id', query.recipientId).maybeSingle(),
            client.from('vendors').select('id, vendor_name').eq('id', query.recipientId).maybeSingle()
        ])

        const senderName = senderMerchant?.merchant_name || senderVendor?.vendor_name || 'A business'
        const recipientName = recipientMerchant?.merchant_name || recipientVendor?.vendor_name || 'your business'

        const recipientIsMerchant = !!recipientMerchant
        const recipientBusinessKey = recipientIsMerchant
            ? 'associated_merchant_id'
            : 'associated_vendor_id'

        const starLabel = rating === 1 ? 'star' : 'stars'
        const starsHtml = '★'.repeat(rating) + '☆'.repeat(5 - rating)

        const content = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">⭐ New Review Received!</h2>
                <p><strong>${senderName}</strong> has left a review for <strong>${recipientName}</strong>.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Review Details</h3>
                    <p style="font-size: 24px; color: #f59e0b; margin: 8px 0;">${starsHtml}</p>
                    <p><strong>Rating:</strong> ${rating} ${starLabel} out of 5</p>
                    ${query.content ? `<p><strong>Review:</strong> "${query.content}"</p>` : ''}
                </div>
                
                <p>Log into your DropBy dashboard to view the full review and respond.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                    <p>This is an automated message from DropBy. Please do not reply to this email.</p>
                </div>
            </div>
        `

        // Get all user emails for the recipient business where available_to_contact = true
        const { data: recipientUsers, error: usersError } = await client
            .from('users')
            .select('email')
            .eq(recipientBusinessKey, query.recipientId)
            .eq('available_to_contact', true)
            .not('email', 'is', null)

        if (usersError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to fetch recipient business users'
            })
        }

        const recipients: string[] = []
        if (recipientUsers && recipientUsers.length > 0) {
            recipientUsers.forEach((user: any) => {
                if (user.email && !recipients.includes(user.email)) {
                    recipients.push(user.email)
                }
            })
        }

        if (recipients.length === 0) {
            return { success: true, skipped: true, message: 'No contactable users found for recipient business' }
        }

        const emailData = await resend.emails.send({
            from: 'DropBy Support <support@dropby.dev>',
            to: recipients,
            subject: `New ${rating}-Star Review from ${senderName}`,
            html: content,
        })

        return { success: true, data: emailData }

    } catch (error: any) {
        console.error('Review notification error:', error)
        return { error: error.message || 'Failed to send review notification' }
    }
})
