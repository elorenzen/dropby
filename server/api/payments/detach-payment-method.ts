import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'
import { requireBusinessContext } from '~/server/utils/authz'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { businessId, businessType } = await requireBusinessContext(event)
  const body = await readBody(event)
  const { paymentMethodId } = body

  if (!paymentMethodId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: paymentMethodId'
    })
  }

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

  const existingPaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
  if (existingPaymentMethod.customer !== businessData.stripe_customer_id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authorized to detach this payment method'
    })
  }

  const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)
  if (paymentMethod) {
    return {
      success: true,
      message: 'Payment method detached successfully'
    }
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to detach payment method'
  })
})