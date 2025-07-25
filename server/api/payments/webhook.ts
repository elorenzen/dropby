import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
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
  const subscriptionId = invoice.subscription as string
  
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
  const subscriptionId = invoice.subscription as string
  
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