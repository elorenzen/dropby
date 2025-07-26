import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
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

    // Check if user already has an active subscription
    const { data: existingSubscription } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User already has an active subscription'
      })
    }

    // Create or get Stripe customer
    let stripeCustomerId = userData.stripe_customer_id
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        metadata: {
          user_id: user.id,
          user_type: userData.type
        }
      })
      
      stripeCustomerId = customer.id
      
      // Update user with Stripe customer ID
      await client
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
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
        user_id: user.id,
        plan_type: planType
      }
    })

    // Create subscription record in database
    const { error: subscriptionError } = await client
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        status: 'pending',
        stripe_customer_id: stripeCustomerId,
        created_at: new Date().toISOString()
      })

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

  } catch (error) {
    console.error('Subscription creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create subscription'
    })
  }
}) 