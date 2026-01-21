import { serverSupabaseClient } from '#supabase/server'
// import Stripe from 'stripe'

// TODO: Uncomment when payments are ready
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-06-30.basil'
// })

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const client = await serverSupabaseClient(event)
    
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    // Find events that have ended (1 hour buffer) and are either 'open' or 'booked'
    const { data: endedEvents, error: eventsError } = await client
      .from('events')
      .select('*')
      .in('status', ['open', 'booked'])
      .lt('end', oneHourAgo.toISOString())

    if (eventsError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch ended events: ${eventsError.message}`
      })
    }

    if (!endedEvents || endedEvents.length === 0) {
      return {
        success: true,
        message: 'No ended events found',
        processedCount: 0,
        closedEvents: [],
        completedEvents: [],
        timestamp: now.toISOString()
      }
    }

    const closedEvents = []
    const completedEvents = []
    const errors = []

    for (const eventData of endedEvents) {
      try {
        // If event was open (no vendor), mark as closed
        if (eventData.status === 'open' || !eventData.vendor) {
          await client
            .from('events')
            .update({ 
              status: 'closed',
              updated_at: new Date().toISOString()
            })
            .eq('id', eventData.id)

          // Add timeline item
          await client
            .from('timeline_items')
            .insert({
              id: crypto.randomUUID(),
              owner_id: eventData.merchant,
              title: 'Event Closed',
              description: 'Event has been automatically closed (no vendor was booked).',
              type: 'event',
              created_at: new Date().toISOString()
            } as any)

          closedEvents.push({
            eventId: eventData.id,
            status: 'closed'
          })

        // If event was booked with a vendor, mark as completed
        } else if (eventData.status === 'booked' && eventData.vendor) {
          const { data: vendorData } = await client
            .from('vendors')
            .select('vendor_name')
            .eq('id', eventData.vendor)
            .single()

          await client
            .from('events')
            .update({ 
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', eventData.id)

          // Add timeline item
          await client
            .from('timeline_items')
            .insert({
              id: crypto.randomUUID(),
              owner_id: eventData.merchant,
              title: 'Event Completed',
              description: `Event with ${vendorData?.vendor_name || 'vendor'} has been automatically marked as completed.`,
              type: 'event',
              created_at: new Date().toISOString()
            } as any)

          completedEvents.push({
            eventId: eventData.id,
            vendorName: vendorData?.vendor_name,
            status: 'completed'
          })

          // TODO: Uncomment when payments are ready
          /*
          const { data: payment } = await client
            .from('payments')
            .select('*')
            .eq('event_id', eventData.id)
            .single()

          if (payment && vendorData?.stripe_connect_account_id) {
            const transfer = await stripe.transfers.create({
              amount: Math.round(payment.vendor_payout * 100),
              currency: 'usd',
              destination: vendorData.stripe_connect_account_id,
              description: `Payment for completed event ${eventData.id}`,
              metadata: { eventId: eventData.id, paymentId: payment.id, vendorId: eventData.vendor }
            })

            await client.from('payments').update({ 
              status: 'completed',
              stripe_transfer_id: transfer.id,
              updated_at: new Date().toISOString()
            }).eq('id', payment.id)

            await client.from('events').update({ 
              payment_status: 'paid',
              updated_at: new Date().toISOString()
            }).eq('id', eventData.id)
          }
          */
        }

      } catch (error: any) {
        errors.push(`Error processing event ${eventData.id}: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Processed ${closedEvents.length + completedEvents.length} events (${closedEvents.length} closed, ${completedEvents.length} completed)`,
      processedCount: closedEvents.length + completedEvents.length,
      closedEvents,
      completedEvents,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to process ended events'
    })
  }
})
