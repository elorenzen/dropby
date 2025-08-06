import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    // Verify this is a legitimate cron request (you can add authentication here)
    const authHeader = getHeader(event, 'authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const client = await serverSupabaseClient(event)
    
    // Get current time
    const now = new Date()
    
    // Find events that are:
    // 1. Booked (has vendor assigned)
    // 2. Paid in escrow
    // 3. End time has passed (with 1 hour buffer to ensure event is truly over)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const { data: completedEvents, error: eventsError } = await client
      .from('events')
      .select(`
        *,
        payments!inner(*)
      `)
      .eq('status', 'booked')
      .eq('payment_status', 'paid_escrow')
      .lt('end', oneHourAgo.toISOString())
      .not('vendor', 'is', null)

    if (eventsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch completed events'
      })
    }

    if (!completedEvents || completedEvents.length === 0) {
      return {
        success: true,
        message: 'No completed events found',
        processedCount: 0,
        processedEvents: [],
        timestamp: now.toISOString()
      }
    }

    const processedEvents = []
    const errors = []

    // Process each completed event
    for (const eventData of completedEvents) {
      try {
        const payment = eventData.payments[0]
        const vendorId = eventData.vendor

        // Fetch vendor details
        const { data: vendorData, error: vendorError } = await client
          .from('vendors')
          .select('stripe_connect_account_id, email, vendor_name')
          .eq('id', vendorId)
          .single()

        if (vendorError || !vendorData) {
          errors.push(`Vendor not found for event ${eventData.id}`)
          continue
        }

        // If vendor has Stripe Connect account, transfer funds automatically
        if (vendorData.stripe_connect_account_id) {
          try {
            console.log(`Processing automatic transfer for vendor ${vendorData.vendor_name} (${vendorId})`)
            
            // Create a transfer to the vendor's Stripe Connect account
            const transfer = await stripe.transfers.create({
              amount: Math.round(payment.vendor_payout * 100), // Convert to cents
              currency: 'usd',
              destination: vendorData.stripe_connect_account_id,
              description: `Payment for completed event ${eventData.id}`,
              metadata: {
                eventId: eventData.id,
                paymentId: payment.id,
                vendorId
              }
            })

            console.log(`Transfer successful: ${transfer.id} for $${payment.vendor_payout}`)

            // Update payment status
            await client
              .from('payments')
              .update({ 
                status: 'completed',
                stripe_transfer_id: transfer.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.id)

            // Update event status
            await client
              .from('events')
              .update({ 
                status: 'completed',
                payment_status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('id', eventData.id)

            // Add timeline event for automatic completion
            await client
              .from('timeline_items')
              .insert({
                id: crypto.randomUUID(),
                owner_id: eventData.merchant,
                title: 'Event Completed - Payment Released',
                description: `Event completed automatically. Payment of $${payment.vendor_payout.toFixed(2)} released to ${vendorData.vendor_name} via Stripe Connect.`,
                type: 'event',
                created_at: new Date().toISOString()
              } as any)

            processedEvents.push({
              eventId: eventData.id,
              vendorName: vendorData.vendor_name,
              amount: payment.vendor_payout,
              transferId: transfer.id,
              method: 'Stripe Connect Transfer'
            })

          } catch (transferError: any) {
            console.error(`Stripe transfer failed for event ${eventData.id}:`, transferError)
            errors.push(`Failed to transfer payment for event ${eventData.id}: ${transferError.message}`)
            
            // Fallback to manual payout if transfer fails
            await client
              .from('payments')
              .update({ 
                status: 'pending_manual_payout',
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.id)

            await client
              .from('events')
              .update({ 
                status: 'completed',
                payment_status: 'pending_manual_payout',
                updated_at: new Date().toISOString()
              })
              .eq('id', eventData.id)
          }
        } else {
          // Vendor doesn't have Stripe Connect account - mark for manual payout
          console.log(`Vendor ${vendorData.vendor_name} (${vendorId}) does not have Stripe Connect account - marking for manual payout`)
          
          await client
            .from('payments')
            .update({ 
              status: 'pending_manual_payout',
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id)

          await client
            .from('events')
            .update({ 
              status: 'completed',
              payment_status: 'pending_manual_payout',
              updated_at: new Date().toISOString()
            })
            .eq('id', eventData.id)

          // Add timeline event for manual payout required
          await client
            .from('timeline_items')
            .insert({
              id: crypto.randomUUID(),
              owner_id: eventData.merchant,
              title: 'Event Completed - Manual Payout Required',
              description: `Event completed automatically. Payment of $${payment.vendor_payout.toFixed(2)} to ${vendorData.vendor_name} requires manual payout. Vendor email: ${vendorData.email}`,
              type: 'event',
              created_at: new Date().toISOString()
            } as any)

          processedEvents.push({
            eventId: eventData.id,
            vendorName: vendorData.vendor_name,
            amount: payment.vendor_payout,
            method: 'Manual Payout Required',
            vendorEmail: vendorData.email
          })
        }

      } catch (error: any) {
        console.error(`Error processing event ${eventData.id}:`, error)
        errors.push(`Error processing event ${eventData.id}: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Processed ${processedEvents.length} completed events`,
      processedCount: processedEvents.length,
      processedEvents,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    }

  } catch (error: any) {
    console.error('Cron job error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to process completed events'
    })
  }
}) 