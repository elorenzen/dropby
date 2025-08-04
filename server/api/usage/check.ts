import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { businessId, businessType, usageType, requiredAmount = 1 } = body

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

    // Check usage limit
    const { data: canProceed, error: limitError } = await client
      .rpc('check_usage_limit', {
        business_id_param: businessId,
        business_type_param: businessType,
        usage_type_param: usageType,
        required_amount: requiredAmount
      } as any)

    if (limitError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check usage limit'
      })
    }

    // If canProceed is null, assume it's allowed (fallback)
    let finalCanProceed = canProceed as boolean
    if (canProceed === null) {
      finalCanProceed = true
    }

    // Get current usage and limit for response
    const { data: currentUsage, error: currentUsageError } = await client
      .rpc('get_current_usage', {
        business_id_param: businessId,
        business_type_param: businessType,
        usage_type_param: usageType
      } as any)

    const { data: usageLimit, error: usageLimitError } = await client
      .rpc('get_usage_limit', {
        plan_type_param: planType,
        usage_type_param: usageType
      } as any)

    return {
      success: true,
      allowed: finalCanProceed,
      currentUsage: currentUsage || 0,
      usageLimit: usageLimit || 0,
      remainingUsage: Math.max(0, (usageLimit || 0) - (currentUsage || 0)),
      usageType,
      businessId,
      businessType,
      subscription: {
        planType: planType,
        status: (subscriptionData as any)?.status || 'active'
      }
    }

  } catch (error: any) {
    console.error('Usage check error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to check usage'
    })
  }
}) 