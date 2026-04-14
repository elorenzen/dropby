import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'
import { requireBusinessContext } from '~/server/utils/authz'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    const { businessId, businessType } = await requireBusinessContext(event)
    
    const { subscriptionId } = body

    // Validate required parameters
    if (!subscriptionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: subscriptionId'
      })
    }

    const { data: subscriptionRow, error: subscriptionFetchError } = await client
      .from('subscriptions')
      .select('id, business_id, business_type, stripe_subscription_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (subscriptionFetchError || !subscriptionRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Subscription not found'
      })
    }

    if (subscriptionRow.business_id !== businessId || subscriptionRow.business_type !== businessType) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Not authorized to cancel this subscription'
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
      .eq('id', subscriptionRow.id)

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