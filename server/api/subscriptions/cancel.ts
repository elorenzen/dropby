import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { subscriptionId } = body

    // Validate required parameters
    if (!subscriptionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: subscriptionId'
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

    // Cancel the Stripe subscription
    await stripe.subscriptions.cancel(subscriptionId)

    // Update the subscription status in Supabase
    await client
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      } as any)
      .eq('stripe_subscription_id', subscriptionId)

    return {
      success: true,
      message: 'Subscription canceled successfully'
    }

  } catch (error: any) {
    console.error('Subscription cancellation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to cancel subscription'
    })
  }
}) 