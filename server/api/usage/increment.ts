import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { businessId, businessType, usageType, incrementAmount = 1 } = body

    // Validate required parameters
    if (!businessId || !businessType || !usageType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: businessId, businessType, usageType'
      })
    }

    // Validate business type
    if (!['merchant', 'vendor'].includes(businessType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid business type. Must be "merchant" or "vendor"'
      })
    }

    // Validate usage type
    if (!['events', 'requests', 'messages'].includes(usageType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid usage type. Must be "events", "requests", or "messages"'
      })
    }

    // Check if business exists
    const { data: businessData, error: businessError } = await client
      .from(`${businessType}s`)
      .select('id')
      .eq('id', businessId)
      .single()
    
    if (businessError || !businessData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Business not found'
      })
    }

    // Check if business has active subscription
    const { data: subscriptionData, error: subscriptionError } = await client
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .eq('business_type', businessType)
      .eq('status', 'active')
      .single()

    // If no subscription found, assume free plan (allow usage)
    let planType = 'free'
    if (subscriptionData) {
      planType = (subscriptionData as any).plan_type
    }

    // Increment usage
    const { data: incrementResult, error: incrementError } = await client
      .rpc('increment_usage', {
        business_id_param: businessId,
        business_type_param: businessType,
        usage_type_param: usageType,
        increment_amount: incrementAmount
      } as any)

    if (incrementError) {
      // Don't fail the event creation if increment fails
      return {
        success: true,
        message: 'Event created, but usage tracking failed',
        currentUsage: 0,
        usageType,
        businessId,
        businessType
      }
    }

    if (!incrementResult) {
      return {
        success: true,
        message: 'Event created, but usage limit reached',
        currentUsage: 0,
        usageType,
        businessId,
        businessType
      }
    }

    // Get updated usage data
    const { data: updatedUsage } = await client
      .rpc('get_current_usage', {
        business_id_param: businessId,
        business_type_param: businessType,
        usage_type_param: usageType
      } as any)

    return {
      success: true,
      message: 'Usage incremented successfully',
      currentUsage: updatedUsage || 0,
      usageType,
      businessId,
      businessType
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to increment usage'
    })
  }
}) 