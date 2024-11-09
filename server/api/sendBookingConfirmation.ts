import { serverSupabaseClient } from '#supabase/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    const { data: eventData } = await client
        .from('events')
        .select()
        .eq('id', query.eventId)
    const bookedEvt = eventData[0]
    
    const { data: merchantData } = await client
        .from('merchants')
        .select()
        .eq('id', query.merchantId)
    const merchant = merchantData[0]
    
    const { data: vendorData } = await client
        .from('vendors')
        .select()
        .eq('id', query.vendorId)
    const vendor = vendorData[0]

    const content = `
        <p><strong>${merchant.merchant_name} approved ${vendor.vendor_name} to work the following event:</strong></p>
        <p>${bookedEvt.start} - ${bookedEvt.end} at <a href="${bookedEvt.location_url}">${bookedEvt.location_address}</p>
        <p><strong>Notes: </strong> ${bookedEvt.notes}</p>
    `

    try {
      const data = await resend.emails.send({
        from: 'DropBy Support <onboarding@resend.dev>',
        to: [
            'eric.lorenzen@gmail.com'
            // merchant.email,
            // vendor.email - TO BE DEVELOPED  
        ],
        subject: 'Event Booked!',
        html: content,
      });

      return data;
    } catch (error) {
      return { error };
    }
});
