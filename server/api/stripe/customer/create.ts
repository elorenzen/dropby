import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

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
    
    const { businessId, businessType } = body

    // Validate required parameters
    if (!businessId || !businessType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: businessId, businessType'
      })
    }

    // Validate business type
    if (!['merchant', 'vendor'].includes(businessType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid business type'
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

    const business = businessData as BusinessData

    // Check if business already has a Stripe customer ID
    if (business.stripe_customer_id) {
      return {
        success: true,
        customerId: business.stripe_customer_id,
        message: 'Customer already exists'
      }
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: business.email,
      name: business[`${businessType}_name`],
      metadata: {
        business_id: businessId,
        business_type: businessType
      }
    })
    
    // Update business with Stripe customer ID
    await client
      .from(`${businessType}s`)
      .update({ stripe_customer_id: customer.id } as any)
      .eq('id', businessId)

    return {
      success: true,
      customerId: customer.id,
      message: 'Customer created successfully'
    }

  } catch (error: any) {
    console.error('Customer creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create customer'
    })
  }
})
