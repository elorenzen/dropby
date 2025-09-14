import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customerId, paymentMethodId, title, defaultPaymentMethod } = body

  if (!customerId || !paymentMethodId || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: customerId, paymentMethodId, title'
    })
  }
  
  try {
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