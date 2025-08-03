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

      // Add stripe_customer_id if provided
      if (stripeCustomerId) {
        subscriptionData.stripe_customer_id = stripeCustomerId
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

  return {
    createFreeSubscription,
    getActiveSubscription
  }
} 