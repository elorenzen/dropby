import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'
import { requireBusinessContext } from '~/server/utils/authz'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { paymentMethodId, title, defaultPaymentMethod } = body

  if (!paymentMethodId || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: paymentMethodId, title'
    })
  }
  
  try {
    const client = await serverSupabaseClient(event)
    const { businessId, businessType } = await requireBusinessContext(event)
    const { data: businessData, error: businessError } = await client
      .from(`${businessType}s`)
      .select('stripe_customer_id')
      .eq('id', businessId)
      .single()

    if (businessError || !businessData?.stripe_customer_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Stripe customer is not configured for this account'
      })
    }

    const customerId = businessData.stripe_customer_id

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, { 
      customer: customerId 
    })

    // Update payment method metadata with title
    const updatedPaymentMethod = await stripe.paymentMethods.update(paymentMethodId, {
      metadata: { title }
    })

    // If requested, set as the default payment method
    if (defaultPaymentMethod) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
      })
    }

    return { success: true, paymentMethod: updatedPaymentMethod }
  } catch (error: any) {
    console.error('Error attaching payment method:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to attach payment method'
    })
  }
})