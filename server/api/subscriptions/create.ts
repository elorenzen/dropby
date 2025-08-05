import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

interface Subscription {
  id: string
  business_id: string
  business_type: string
  user_id: string
  plan_type: string
  status: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
  updated_at?: string
}

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
    
    const { planType, stripePriceId, paymentMethodId } = body

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

    // Extract plan type from plan ID (e.g., 'merchant-pro' -> 'pro')
    const extractPlanType = (planId: string) => {
      const parts = planId.split('-')
      return parts[parts.length - 1] // Get the last part
    }
    
    const actualPlanType = extractPlanType(planType)

    // Handle free plan upgrade/downgrade
    if (actualPlanType === 'free') {
      // If upgrading to free, cancel any existing paid subscriptions
      if (existingSubscription) {
        const subscription = existingSubscription as Subscription
        // Cancel existing Stripe subscription if it exists
        if (subscription.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
          } catch (error) {
            console.error('Error canceling Stripe subscription:', error)
          }
        }
        
        // Update existing subscription to free
        await client
          .from('subscriptions')
          .update({
            plan_type: 'free',
            status: 'active',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', subscription.id)
      } else {
        // Create new free subscription
        await client
          .from('subscriptions')
          .insert({
            business_id: businessId,
            business_type: businessType,
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            created_at: new Date().toISOString()
          } as any)
      }

      return {
        success: true,
        message: 'Plan updated to free successfully'
      }
    }

    // Handle paid plan upgrades
    // Cancel existing subscription if it exists
    if (existingSubscription) {
      const subscription = existingSubscription as Subscription
      // Cancel existing Stripe subscription if it exists
      if (subscription.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        } catch (error) {
          console.error('Error canceling existing Stripe subscription:', error)
        }
      }
      
      // Update existing subscription to canceled
      await client
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', subscription.id)
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

    // If payment method is provided, attach it to the customer first
    let paymentMethodAttached = false
    if (paymentMethodId) {
      try {
        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId,
        })
        
        // Set as default payment method for customer
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        })
        paymentMethodAttached = true
      } catch (error) {
        console.error('Error attaching payment method:', error)
        
        // Check if payment method is already attached
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
          if (paymentMethod.customer === stripeCustomerId) {
            paymentMethodAttached = true
          }
        } catch (retrieveError) {
          console.error('Error retrieving payment method:', retrieveError)
        }
      }
    }

    // Create Stripe subscription with proper structure according to Stripe API docs
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: stripePriceId,
        },
      ],
      payment_behavior: paymentMethodAttached ? 'default_incomplete' : 'allow_incomplete',
      default_payment_method: paymentMethodAttached ? paymentMethodId : undefined,
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card']
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        business_id: businessId,
        business_type: businessType,
        user_id: user.id,
        plan_type: actualPlanType
      },
      collection_method: 'charge_automatically',
      description: `${actualPlanType} subscription for ${businessType}`,
      currency: 'usd',
      off_session: false
    })

    // If payment method was provided and attached, try to pay the first invoice
    if (paymentMethodAttached && paymentMethodId) {
      try {
        const subscription = stripeSubscription as any
        if (subscription.latest_invoice) {
          // Get the invoice ID properly
          const invoiceId = typeof subscription.latest_invoice === 'string' 
            ? subscription.latest_invoice 
            : subscription.latest_invoice.id
            
          const invoice = await stripe.invoices.retrieve(invoiceId)
          
          if (invoice.status === 'open' && invoice.id) {
            // Pay the invoice with the attached payment method
            await stripe.invoices.pay(invoice.id, {
              payment_method: paymentMethodId
            })
            
            // Update subscription with default payment method
            await stripe.subscriptions.update(stripeSubscription.id, {
              default_payment_method: paymentMethodId
            })
          }
        }
      } catch (error) {
        console.error('Error paying first invoice:', error)
        // Don't throw error here, subscription is still created
        // According to Stripe docs, subscription can be incomplete if payment fails
      }
    }

    // Handle date conversion safely
    const getCurrentPeriodStart = () => {
      const subscription = stripeSubscription as any
      if (subscription.current_period_start) {
        return new Date(subscription.current_period_start * 1000).toISOString()
      }
      // For incomplete subscriptions, use current time
      return new Date().toISOString()
    }

    const getCurrentPeriodEnd = () => {
      const subscription = stripeSubscription as any
      if (subscription.current_period_end) {
        return new Date(subscription.current_period_end * 1000).toISOString()
      }
      // For incomplete subscriptions, estimate 30 days from now
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Create Supabase subscription record with both customer and subscription IDs
    const { data: newSubscription, error: subscriptionError } = await client
      .from('subscriptions')
      .insert({
        business_id: businessId,
        business_type: businessType,
        user_id: user.id,
        plan_type: actualPlanType,
        status: paymentMethodId ? 'active' : stripeSubscription.status, // Use active if payment method provided
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscription.id,
        current_period_start: getCurrentPeriodStart(),
        current_period_end: getCurrentPeriodEnd(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .select()
      .single()

    if (subscriptionError) {
      // If Supabase subscription creation fails, cancel the Stripe subscription
      try {
        await stripe.subscriptions.cancel(stripeSubscription.id)
      } catch (error) {
        console.error('Error canceling Stripe subscription after Supabase failure:', error)
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create subscription record'
      })
    }

    // Get payment intent for frontend payment collection
    const subscription = stripeSubscription as any
    const paymentIntent = subscription.latest_invoice?.payment_intent

    return {
      success: true,
      subscription: {
        id: newSubscription.id,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeCustomerId,
        planType: actualPlanType,
        status: paymentMethodAttached ? 'active' : stripeSubscription.status,
        paymentIntentId: paymentIntent?.id,
        clientSecret: paymentIntent?.client_secret
      },
      message: paymentMethodAttached ? 'Subscription created successfully' : 'Subscription created, payment required'
    }

  } catch (error: any) {
    console.error('Subscription creation error:', error.message || error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create subscription'
    })
  }
}) 