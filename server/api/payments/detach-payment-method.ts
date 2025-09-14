import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { paymentMethodId } = body

  if (!paymentMethodId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: paymentMethodId'
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