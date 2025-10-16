import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

interface BusinessData {
  id: string
  email?: string
  stripe_customer_id?: string
  [key: string]: any
}

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
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (businessError || !businessData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Business not found'
      })
    }

    const business = businessData as BusinessData

    // Define one-time payment amounts based on business type and action
    const oneTimePaymentAmounts = {
      'merchant': {
        'events': 5.00 // $5 for merchant event creation
      },
      'vendor': {
        'requests': 3.00 // $3 for vendor event request
      }
    }

    const baseAmount = (oneTimePaymentAmounts as any)[businessType]?.[actionType]
    
    if (!baseAmount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid business type or action type for one-time payment'
      })
    }

    // Calculate fees - user pays platform fee + Stripe processing fees
    const platformFee = baseAmount * 0.08 // 8% platform fee
    const processingFee = (baseAmount * 0.029) + 0.30 // Stripe processing fee
    const totalAmount = baseAmount + platformFee + processingFee

    // Check if business has a Stripe customer ID, create one if not
    let stripeCustomerId: string = business.stripe_customer_id || ''
    
    if (!stripeCustomerId) {
      // Call the customer creation endpoint
      const customerResponse = await $fetch('/api/stripe/customer/create', {
        method: 'POST',
        body: {
          businessId,
          businessType
        }
      }) as any
      
      if (!customerResponse.success) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create Stripe customer'
        })
      }
      
      stripeCustomerId = customerResponse.customerId
    }

    // Create payment record
    const { data: paymentData, error: paymentError } = await client
      .from('payments')
      .insert({
        event_id: null,
        merchant_id: businessType === 'merchant' ? businessId : null,
        vendor_id: businessType === 'vendor' ? businessId : null,
        amount: Math.round(totalAmount * 100), // Convert to cents for consistency
        platform_fee: Math.round(platformFee * 100),
        processing_fee: Math.round(processingFee * 100),
        vendor_payout: 0, // One-time payments don't have vendor payouts
        status: 'pending',
        stripe_payment_intent_id: null,
        stripe_transfer_id: null,
        refund_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .select()
      .single()

    if (paymentError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create payment record'
      })
    }

    // Attach payment method to customer first
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      })
    } catch (error) {
      // Payment method might already be attached, continue
      console.log('Payment method attachment note:', error)
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
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
        paymentId: (paymentData as any).id
      }
    })

    // Update payment record with Stripe payment intent ID
    await client
      .from('payments')
      .update({ 
        stripe_payment_intent_id: paymentIntent.id,
        status: 'completed',
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', (paymentData as any).id)

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
      paymentId: (paymentData as any).id,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: totalAmount,
        baseAmount: baseAmount,
        platformFee: platformFee,
        processingFee: processingFee
      },
      message: `One-time payment of $${totalAmount.toFixed(2)} ($${baseAmount.toFixed(2)} + $${platformFee.toFixed(2)} platform fee + $${processingFee.toFixed(2)} processing fee). You can now ${actionType === 'events' ? 'create' : 'request'} one more ${actionType.slice(0, -1)}.`
    }

  } catch (error: any) {
    console.error('One-time payment error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process one-time payment'
    })
  }
})
