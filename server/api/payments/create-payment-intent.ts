import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { eventId, amount, merchantId, vendorId } = body

    // Validate required parameters
    if (!eventId || !amount || !merchantId || !vendorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: eventId, amount, merchantId, vendorId'
      })
    }

    // Fetch event details
    const { data: eventData, error: eventError } = await client
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError || !eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }

    // Calculate fees - MERCHANT PAYS ALL FEES
    const platformFee = amount * 0.08 // 8% platform fee (our revenue)
    const processingFee = (amount * 0.029) + 0.30 // Stripe fee (merchant pays this)
    const totalAmount = amount + platformFee + processingFee // Total merchant pays
    const vendorPayout = amount // Vendor receives full event value

    // Create payment record
    const { data: paymentData, error: paymentError } = await client
      .from('payments')
      .insert({
        event_id: eventId,
        merchant_id: merchantId,
        vendor_id: vendorId,
        amount: amount,
        platform_fee: platformFee,
        processing_fee: processingFee,
        vendor_payout: vendorPayout,
        status: 'pending'
      } as any)
      .select()
      .single()

    if (paymentError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create payment record'
      })
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        eventId,
        paymentId: paymentData.id,
        merchantId,
        vendorId
      },
      application_fee_amount: Math.round(platformFee * 100), // Only platform fee
      // Remove transfer_data since vendors don't have Stripe Connect accounts yet
      // transfer_data: {
      //   destination: vendorId, // Vendor's Stripe account ID
      //   amount: Math.round(vendorPayout * 100), // Full event value to vendor
      // },
    })

    // Update payment record with Stripe payment intent ID
    await client
      .from('payments')
      .update({ stripe_payment_intent_id: paymentIntent.id } as any)
      .eq('id', paymentData.id)

    // Update event payment status
    await client
      .from('events')
      .update({ 
        payment_status: 'pending',
        payment_id: paymentData.id,
        event_value: amount
      } as any)
      .eq('id', eventId)

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: totalAmount,
        platformFee,
        processingFee,
        vendorPayout
      },
      paymentId: paymentData.id
    }

  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create payment intent'
    })
  }
}) 