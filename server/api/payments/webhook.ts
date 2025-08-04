import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(body!, sig!, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Webhook signature verification failed'
    })
  }

  const client = await serverSupabaseClient(event)

  // Handle the event
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(client, stripeEvent.data.object as Stripe.PaymentIntent)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(client, stripeEvent.data.object as Stripe.PaymentIntent)
      break
    case 'invoice.payment_succeeded':
      await handleSubscriptionPaymentSucceeded(client, stripeEvent.data.object as Stripe.Invoice)
      break
    case 'invoice.payment_failed':
      await handleSubscriptionPaymentFailed(client, stripeEvent.data.object as Stripe.Invoice)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(client, stripeEvent.data.object as Stripe.Subscription)
      break
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(client, stripeEvent.data.object as Stripe.Checkout.Session)
      break
    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`)
  }

  return { received: true }
})

async function handlePaymentSucceeded(client: any, paymentIntent: Stripe.PaymentIntent) {
  const { eventId, paymentId } = paymentIntent.metadata

  // Update payment status
  await client
    .from('payments')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)

  // Update event payment status
  await client
    .from('events')
    .update({ 
      payment_status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)

  console.log(`Payment completed for event ${eventId}`)
}

async function handlePaymentFailed(client: any, paymentIntent: Stripe.PaymentIntent) {
  const { eventId, paymentId } = paymentIntent.metadata

  // Update payment status
  await client
    .from('payments')
    .update({ 
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)

  // Update event payment status
  await client
    .from('events')
    .update({ 
      payment_status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)

  console.log(`Payment failed for event ${eventId}`)
}

async function handleSubscriptionPaymentSucceeded(client: any, invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string
  
  // Update subscription status
  await client
    .from('subscriptions')
    .update({ 
      status: 'active',
      current_period_start: new Date(invoice.period_start * 1000).toISOString(),
      current_period_end: new Date(invoice.period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Subscription payment succeeded: ${subscriptionId}`)
}

async function handleSubscriptionPaymentFailed(client: any, invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string
  
  // Update subscription status
  await client
    .from('subscriptions')
    .update({ 
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Subscription payment failed: ${subscriptionId}`)
}

async function handleSubscriptionDeleted(client: any, subscription: Stripe.Subscription) {
  // Update subscription status
  await client
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription canceled: ${subscription.id}`)
}

async function handleCheckoutSessionCompleted(client: any, session: Stripe.Checkout.Session) {
  const { business_id, business_type, user_id, plan_type } = session.metadata || {}
  
  if (!business_id || !business_type || !user_id || !plan_type) {
    console.error('Missing required metadata in checkout session')
    return
  }

  // Get the subscription from the session
  const subscriptionId = session.subscription as string
  
  if (!subscriptionId) {
    console.error('No subscription ID in checkout session')
    return
  }

  console.log(`Processing checkout session for business ${business_id}, plan ${plan_type}, subscription ${subscriptionId}`)

  try {
    // Get the Stripe subscription details to ensure it's active
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil'
    })
    
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
    
    if (stripeSubscription.status === 'active') {
      // First, check if there's already a pending subscription
      const { data: pendingSubscription, error: findError } = await client
        .from('subscriptions')
        .select('*')
        .eq('business_id', business_id)
        .eq('business_type', business_type)
        .eq('status', 'pending')
        .single()

      if (findError || !pendingSubscription) {
        console.log('No pending subscription found for business:', business_id, 'Creating new active subscription')
        // Create a new subscription record if none exists
        const { error: insertError } = await client
          .from('subscriptions')
          .insert({
            business_id: business_id,
            business_type: business_type,
            user_id: user_id,
            plan_type: plan_type,
            status: 'active',
            stripe_customer_id: stripeSubscription.customer as string,
            stripe_subscription_id: subscriptionId,
            current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any)

        if (insertError) {
          console.error('Error creating new subscription:', insertError)
          return
        }

        console.log(`Created new active subscription for business ${business_id}, subscription ${subscriptionId}`)
      } else {
        // Update the pending subscription with the Stripe subscription ID
        const { error: updateError } = await client
          .from('subscriptions')
          .update({ 
            stripe_subscription_id: subscriptionId,
            status: 'active',
            current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          } as any)
          .eq('business_id', business_id)
          .eq('business_type', business_type)
          .eq('status', 'pending')

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          return
        }

        console.log(`Updated pending subscription for business ${business_id}, subscription ${subscriptionId}`)
      }
    } else {
      console.error(`Stripe subscription ${subscriptionId} is not active, status: ${stripeSubscription.status}`)
    }
  } catch (error) {
    console.error('Error handling checkout session completion:', error)
  }
} 