import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { eventId, amount, merchantId, vendorId, paymentMethodId } = body

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
    const platformFee = amount * 0.08 // 8% platform fee (your revenue)
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

    // Create Stripe payment intent - SINGLE TRANSACTION
    // This captures the platform fee immediately and holds vendor payment in escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment immediately
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        eventId,
        paymentId: paymentData.id,
        merchantId,
        vendorId,
        platformFee: platformFee.toString(),
        vendorPayout: vendorPayout.toString()
      },
      // NO transfer_data - we'll handle vendor payout separately after event completion
      // This keeps all money in your account initially
    })

    // Update payment record with Stripe payment intent ID
    await client
      .from('payments')
      .update({ stripe_payment_intent_id: paymentIntent.id } as any)
      .eq('id', paymentData.id)

    // Update event payment status to escrow
    await client
      .from('events')
      .update({ 
        payment_status: 'paid_escrow', // New status: paid but held in escrow
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
        vendorPayout,
        escrowAmount: vendorPayout // Amount held for vendor
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