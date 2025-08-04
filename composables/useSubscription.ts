export const useSubscription = () => {
  const supabase = useSupabaseClient()

  /**
   * Creates a free subscription for a business
   * @param businessId - The ID of the business (merchant or vendor)
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @param userId - The ID of the user creating the subscription
   * @param stripeCustomerId - The Stripe customer ID for the business
   * @returns Promise<{ data: any, error: any }> - Created subscription data and error
   */
  const createFreeSubscription = async (
    businessId: string,
    businessType: 'merchant' | 'vendor',
    userId: string,
    stripeCustomerId?: string
  ) => {
    try {
      // First, check if business already has a Stripe customer ID
      let customerId = stripeCustomerId
      if (!customerId) {
        const { data: businessData } = await supabase
          .from(`${businessType}s`)
          .select('stripe_customer_id')
          .eq('id', businessId)
          .single()
        
        customerId = businessData?.stripe_customer_id || undefined
      }

      const subscriptionData: any = {
        business_id: businessId,
        business_type: businessType,
        user_id: userId,
        plan_type: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add stripe_customer_id if available
      if (customerId) {
        subscriptionData.stripe_customer_id = customerId
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData as any)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating free subscription:', error)
      return { data: null, error }
    }
  }

  /**
   * Checks if a business has an active subscription
   * @param businessId - The ID of the business
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @returns Promise<{ data: any, error: any }> - Subscription data and error
   */
  const getActiveSubscription = async (
    businessId: string,
    businessType: 'merchant' | 'vendor'
  ) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('business_id', businessId)
        .eq('business_type', businessType)
        .eq('status', 'active')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error getting active subscription:', error)
      return { data: null, error }
    }
  }

  /**
   * Checks if a business can perform an action based on their usage limits
   * @param businessId - The ID of the business
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @param usageType - The type of usage ('events', 'requests', etc.)
   * @param requiredAmount - The amount of usage required (default: 1)
   * @returns Promise<boolean> - Whether the action is allowed
   */
  const checkUsageLimit = async (
    businessId: string,
    businessType: 'merchant' | 'vendor',
    usageType: 'events' | 'requests' | 'messages',
    requiredAmount: number = 1
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('check_usage_limit', {
          business_id_param: businessId,
          business_type_param: businessType,
          usage_type_param: usageType,
          required_amount: requiredAmount
        } as any)

      if (error) {
        console.error('Usage limit check failed:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('Error checking usage limit:', error)
      return false
    }
  }

  /**
   * Increments usage for a business
   * @param businessId - The ID of the business
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @param usageType - The type of usage ('events', 'requests', etc.)
   * @param incrementAmount - The amount to increment (default: 1)
   * @returns Promise<boolean> - Whether the increment was successful
   */
  const incrementUsage = async (
    businessId: string,
    businessType: 'merchant' | 'vendor',
    usageType: 'events' | 'requests' | 'messages',
    incrementAmount: number = 1
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('increment_usage', {
          business_id_param: businessId,
          business_type_param: businessType,
          usage_type_param: usageType,
          increment_amount: incrementAmount
        } as any)

      if (error) {
        console.error('Usage increment failed:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  /**
   * Gets current usage for a business
   * @param businessId - The ID of the business
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @param usageType - The type of usage ('events', 'requests', etc.)
   * @returns Promise<number> - Current usage count
   */
  const getCurrentUsage = async (
    businessId: string,
    businessType: 'merchant' | 'vendor',
    usageType: 'events' | 'requests' | 'messages'
  ): Promise<number> => {
    try {
      const { data, error } = await supabase
        .rpc('get_current_usage', {
          business_id_param: businessId,
          business_type_param: businessType,
          usage_type_param: usageType
        } as any)

      if (error) {
        console.error('Get current usage failed:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error getting current usage:', error)
      return 0
    }
  }

  /**
   * Gets usage limit for a plan
   * @param planType - The subscription plan type
   * @param usageType - The type of usage ('events', 'requests', etc.)
   * @returns Promise<number> - Usage limit for the plan
   */
  const getUsageLimit = async (
    planType: string,
    usageType: 'events' | 'requests' | 'messages'
  ): Promise<number> => {
    try {
      const { data, error } = await supabase
        .rpc('get_usage_limit', {
          plan_type_param: planType,
          usage_type_param: usageType
        } as any)

      if (error) {
        console.error('Get usage limit failed:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error getting usage limit:', error)
      return 0
    }
  }

  /**
   * Gets comprehensive usage data for a business
   * @param businessId - The ID of the business
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @returns Promise<{ usage: any, limits: any, subscription: any }> - Usage data
   */
  const getUsageData = async (
    businessId: string,
    businessType: 'merchant' | 'vendor'
  ) => {
    try {
      // Get current subscription
      const { data: subscription, error: subscriptionError } = await getActiveSubscription(businessId, businessType)
      
      if (subscriptionError || !subscription) {
        return { usage: {}, limits: {}, subscription: null }
      }

      // Get current usage for different types
      const [eventsUsage, requestsUsage, messagesUsage] = await Promise.all([
        getCurrentUsage(businessId, businessType, 'events'),
        getCurrentUsage(businessId, businessType, 'requests'),
        getCurrentUsage(businessId, businessType, 'messages')
      ])

      // Get limits for different types
      const [eventsLimit, requestsLimit, messagesLimit] = await Promise.all([
        getUsageLimit((subscription as any).plan_type, 'events'),
        getUsageLimit((subscription as any).plan_type, 'requests'),
        getUsageLimit((subscription as any).plan_type, 'messages')
      ])

      return {
        usage: {
          events: eventsUsage,
          requests: requestsUsage,
          messages: messagesUsage
        },
        limits: {
          events: eventsLimit,
          requests: requestsLimit,
          messages: messagesLimit
        },
        subscription
      }
    } catch (error) {
      console.error('Error getting usage data:', error)
      return { usage: {}, limits: {}, subscription: null }
    }
  }

  /**
   * Checks if a business can create an event (merchant) or request an event (vendor)
   * @param businessId - The ID of the business
   * @param businessType - The type of business ('merchant' or 'vendor')
   * @returns Promise<{ allowed: boolean, reason?: string }> - Whether the action is allowed
   */
  const canCreateEvent = async (
    businessId: string,
    businessType: 'merchant' | 'vendor'
  ) => {
    try {
      const usageType = businessType === 'merchant' ? 'events' : 'requests'
      const allowed = await checkUsageLimit(businessId, businessType, usageType, 1)
      
      if (!allowed) {
        const { data: subscription } = await getActiveSubscription(businessId, businessType)
        const currentUsage = await getCurrentUsage(businessId, businessType, usageType)
        const limit = await getUsageLimit((subscription as any)?.plan_type || 'free', usageType)
        
        return {
          allowed: false,
          reason: `You've reached your ${usageType} limit for this month (${currentUsage}/${limit}). Please upgrade your plan to continue.`
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error checking if can create event:', error)
      return { allowed: false, reason: 'Unable to verify usage limits' }
    }
  }

  return {
    createFreeSubscription,
    getActiveSubscription,
    checkUsageLimit,
    incrementUsage,
    getCurrentUsage,
    getUsageLimit,
    getUsageData,
    canCreateEvent
  }
} 