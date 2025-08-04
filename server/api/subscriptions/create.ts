import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { planType, stripePriceId } = body

    // Validate required parameters
    if (!planType || !stripePriceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: planType, stripePriceId'
      })
    }

    // Get current user
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      })
    }

    // Get user details
    const { data: userData, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Get the associated business (merchant or vendor)
    const businessType = userData.type // 'merchant' or 'vendor'
    const businessIdKey = `associated_${businessType}_id`
    const businessId = userData[businessIdKey]

    if (!businessId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is not associated with a business'
      })
    }

    // Get business details
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

    // Check if business already has an active subscription
    const { data: existingSubscription } = await client
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .eq('business_type', businessType)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Business already has an active subscription'
      })
    }

    // Create or get Stripe customer for the business
    let stripeCustomerId = businessData.stripe_customer_id
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: businessData.email || userData.email,
        name: businessData[`${businessType}_name`],
        metadata: {
          business_id: businessId,
          business_type: businessType,
          user_id: user.id
        }
      })
      
      stripeCustomerId = customer.id
      
      // Update business with Stripe customer ID
      await client
        .from(`${businessType}s`)
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', businessId)
    }

    // Get the base URL for success/cancel URLs
    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://dropby-ten.vercel.app'
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscriptions`,
      metadata: {
        business_id: businessId,
        business_type: businessType,
        user_id: user.id,
        plan_type: planType
      }
    })

    // Create subscription record in database
    const { error: subscriptionError } = await client
      .from('subscriptions')
      .insert({
        business_id: businessId,
        business_type: businessType,
        user_id: user.id, // The user who initiated the subscription
        plan_type: planType,
        status: 'pending',
        stripe_customer_id: stripeCustomerId,
        created_at: new Date().toISOString()
      } as any)

    if (subscriptionError) {
      console.error('Failed to create subscription record:', subscriptionError)
      // Don't fail the whole operation if database insert fails
      // The webhook will handle updating the subscription status
    }

    return {
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    }

  } catch (error: any) {
    console.error('Subscription creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create subscription'
    })
  }
}) 