import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customerId } = body

  if (!customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: customerId'
    })
  }

  const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
    limit: 5
  })
  
  if (paymentMethods.data && paymentMethods.data.length > 0) {
    return paymentMethods.data
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to list payment methods'
  })
})