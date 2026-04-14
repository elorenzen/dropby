import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'
import { requireBusinessContext } from '~/server/utils/authz'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
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

  const paymentMethods = await stripe.customers.listPaymentMethods(businessData.stripe_customer_id, {
    limit: 5
  })
  
  return paymentMethods.data || []
})