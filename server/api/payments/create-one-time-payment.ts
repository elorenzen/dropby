import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { businessId, businessType, actionType, amount, paymentMethodId } = body

    // Validate required parameters
    if (!businessId || !businessType || !actionType || !amount || !paymentMethodId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters'
      })
    }

    // Validate business type
    if (!['merchant', 'vendor'].includes(businessType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid business type'
      })
    }

    // Validate action type
    if (!['events', 'requests'].includes(actionType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action type'
      })
    }

    // Check if business exists
    const { data: businessData, error: businessError } = await client
      .from(`${businessType}s`)
      .select('id, business_name')
      .eq('id', businessId)
      .single()
    
    if (businessError || !businessData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Business not found'
      })
    }

    // Calculate fees
    const processingFee = (amount * 0.029) + 0.30 // Stripe processing fee
    const totalAmount = amount + processingFee

    // Create payment record
    const { data: paymentData, error: paymentError } = await client
      .from('one_time_payments')
      .insert({
        business_id: businessId,
        business_type: businessType,
        action_type: actionType,
        amount: amount,
        processing_fee: processingFee,
        total_amount: totalAmount,
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
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        businessId,
        businessType,
        actionType,
        paymentId: paymentData.id
      }
    })

    // Update payment record with Stripe payment intent ID
    await client
      .from('one_time_payments')
      .update({ 
        stripe_payment_intent_id: paymentIntent.id,
        status: 'completed'
      } as any)
      .eq('id', paymentData.id)

    // Update usage tracking to allow one more action
    await client
      .from('usage_tracking')
      .update({ 
        usage_count: 0, // Reset to allow one more
        updated_at: new Date().toISOString()
      } as any)
      .eq('business_id', businessId)
      .eq('business_type', businessType)
      .eq('usage_type', actionType)

    return {
      success: true,
      paymentId: paymentData.id,
      message: `Payment successful. You can now ${actionType === 'events' ? 'create' : 'request'} one more ${actionType.slice(0, -1)}.`
    }

  } catch (error: any) {
    console.error('One-time payment error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process one-time payment'
    })
  }
})
