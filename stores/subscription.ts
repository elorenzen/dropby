import { defineStore } from 'pinia'
import type { Subscription } from '~/types'
import { hasFeatureAccess, merchantFeatures, vendorFeatures, type MerchantFeature, type VendorFeature } from '~/constants/subscriptionFeatures'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    activeSubscription: null as Subscription | null,
    isBetaTester: false,
    loading: false,
    error: null as string | null
  }),
  getters: {
    getActiveSubscription: (state) => state.activeSubscription,
    
    // Effective plan type: premium when beta, otherwise from subscription
    effectivePlanType: (state): 'free' | 'pro' | 'premium' => {
      if (state.isBetaTester) return 'premium'
      return state.activeSubscription?.plan_type || 'free'
    },
    
    // Check if subscription is active (beta, active, or trialing all count)
    isActive: (state) => {
      if (state.isBetaTester) return true
      return state.activeSubscription?.status === 'active' || state.activeSubscription?.status === 'trialing'
    },
    
    // Check if subscription is in trial period
    isTrialing: (state): boolean => {
      return state.activeSubscription?.status === 'trialing'
    },
    
    // Get the trial end date (if trialing)
    trialEndDate: (state): string | null => {
      if (state.activeSubscription?.status === 'trialing' && state.activeSubscription?.trial_end) {
        return state.activeSubscription.trial_end
      }
      return null
    },
    
    // Check if trial has expired (subscription is unpaid/past_due after trialing)
    trialExpired: (state): boolean => {
      if (!state.activeSubscription) return false
      const hasTrialEnd = !!state.activeSubscription.trial_end
      const isUnpaid = state.activeSubscription.status === 'unpaid' || state.activeSubscription.status === 'past_due'
      return hasTrialEnd && isUnpaid
    },
    
    // Get current plan type (defaults to 'free' if no subscription)
    currentPlanType: (state): 'free' | 'pro' | 'premium' => {
      if (state.isBetaTester) return 'premium'
      return state.activeSubscription?.plan_type || 'free'
    },
    
    // Get business type from active subscription
    businessType: (state): 'merchant' | 'vendor' | null => {
      return state.activeSubscription?.business_type as 'merchant' | 'vendor' | null
    },
    
    // Generic feature checker
    hasFeature: (state) => {
      return (feature: MerchantFeature | VendorFeature): boolean => {
        const bType = state.activeSubscription?.business_type as 'merchant' | 'vendor' || 'merchant'

        if (state.isBetaTester) {
          return hasFeatureAccess('premium', feature, bType)
        }

        const isSubscriptionActive = state.activeSubscription?.status === 'active' || state.activeSubscription?.status === 'trialing'
        if (!state.activeSubscription || !isSubscriptionActive) {
          return hasFeatureAccess('free', feature, bType)
        }
        
        return hasFeatureAccess(state.activeSubscription.plan_type, feature, bType)
      }
    },
    
    // Get all allowed features for the current subscription
    allowedFeatures: (state): (MerchantFeature | VendorFeature)[] => {
      const bType = state.activeSubscription?.business_type as 'merchant' | 'vendor' || 'merchant'
      const isSubscriptionActive = state.activeSubscription?.status === 'active' || state.activeSubscription?.status === 'trialing'
      const planForCheck: 'free' | 'pro' | 'premium' = state.isBetaTester
        ? 'premium'
        : (isSubscriptionActive ? state.activeSubscription!.plan_type : 'free')

      const features = bType === 'merchant'
        ? (Object.keys(merchantFeatures) as MerchantFeature[])
        : (Object.keys(vendorFeatures) as VendorFeature[])
      
      return features.filter(feature => hasFeatureAccess(planForCheck, feature, bType))
    },
    
    // ============================================================================
    // MERCHANT FEATURE GETTERS
    // ============================================================================
    
    canCreateEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return true // Free tier can create events (with limits)
      }
      return state.activeSubscription.business_type === 'merchant'
    },
    
    canCreateUnlimitedEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'createUnlimitedEvents',
        'merchant'
      )
    },
    
    canCreateRecurringEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'createRecurringEvents',
        'merchant'
      )
    },
    
    canSetPreferredVendors: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'setPreferredVendors',
        'merchant'
      )
    },
    
    canSetUnlimitedPreferredVendors: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'setUnlimitedPreferredVendors',
        'merchant'
      )
    },
    
    // deferred — not implemented (see subscriptionPlans / subscriptionFeatures)
    // canSetEventValuePricing: (state): boolean => { ... },
    // canSetEventValuePromo: (state): boolean => { ... },
    
    canCreateDateRangeEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'createDateRangeEvents',
        'merchant'
      )
    },
    
    // ============================================================================
    // VENDOR FEATURE GETTERS
    // ============================================================================
    
    canRequestEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return true // Free tier can request events (with limits)
      }
      return state.activeSubscription.business_type === 'vendor'
    },
    
    canRequestUnlimitedEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'requestUnlimitedEvents',
        'vendor'
      )
    },
    
    canManageMenu: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      if (state.activeSubscription.business_type !== 'vendor') return false
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'manageMenu',
        'vendor'
      )
    },

    /** Pro/Premium (or beta): descriptions, images, specials on menu items */
    canUseMenuRichContent: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      if (state.activeSubscription.business_type !== 'vendor') return false
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'menuRichContent',
        'vendor'
      )
    },
    
    canHavePreferredVendorStatus: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'preferredVendorStatus',
        'vendor'
      )
    },
    
    canUseAvailabilityCalendar: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'availabilityCalendar',
        'vendor'
      )
    },
    
    canUseAutoBooking: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'autoBooking',
        'vendor'
      )
    },
    
    /** Pro/Premium (or beta): submit post-event reviews of the other party */
    canCreatePostEventReviews: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || (state.activeSubscription.status !== 'active' && state.activeSubscription.status !== 'trialing')) {
        return false
      }
      const businessType = state.activeSubscription.business_type as 'merchant' | 'vendor'
      if (businessType !== 'merchant' && businessType !== 'vendor') return false
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'createPostEventReviews',
        businessType
      )
    },
  },
  actions: {
    async setActiveSubscription(businessId: string, businessType: 'merchant' | 'vendor') {
        const supabase = useSupabaseClient()
        this.loading = true
        this.error = null
        try {
            const businessTable = businessType === 'merchant' ? 'merchants' : 'vendors'
            const { data: businessRow, error: businessError } = await supabase
                .from(businessTable)
                .select('subscription_id')
                .eq('id', businessId)
                .maybeSingle()

            if (businessError) {
                console.error('Error fetching business subscription pointer:', businessError)
                this.error = businessError.message
            }

            if (businessRow?.subscription_id) {
                const { data: byPointer, error: pointerError } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('id', businessRow.subscription_id)
                    .maybeSingle()

                if (pointerError) {
                    console.error('Error fetching subscription by business.subscription_id:', pointerError)
                    this.error = pointerError.message
                }

                if (byPointer) {
                    this.activeSubscription = byPointer as Subscription
                    return
                }
            }

            const statusFilter = ['active', 'trialing', 'unpaid', 'past_due'] as const
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('business_id', businessId)
                .eq('business_type', businessType)
                .in('status', [...statusFilter])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) {
                console.error('Error fetching subscription:', error)
                this.error = error.message
            }

            if (data) {
                this.activeSubscription = data as Subscription
                return
            }

            const { data: latestAny } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('business_id', businessId)
                .eq('business_type', businessType)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            this.activeSubscription = (latestAny as Subscription) || null
        } catch (error: any) {
            console.error('Error setting active subscription:', error)
            this.error = error.message || 'Failed to load subscription'
            this.activeSubscription = null
        } finally {
            this.loading = false
        }
    },
    
    setIsBetaTester(value: boolean) {
      this.isBetaTester = value
    },

    clearActiveSubscription() {
      this.activeSubscription = null
      this.isBetaTester = false
    },

    /**
     * Check for unpaid/incomplete subscriptions and return the subscription if found
     */
    async checkUnpaidSubscription(businessId: string, businessType: 'merchant' | 'vendor') {
      try {
        const supabase = useSupabaseClient()
        
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('business_id', businessId)
          .eq('business_type', businessType)
          .in('status', ['unpaid', 'incomplete'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        return subscription
      } catch (error) {
        console.error('Error checking unpaid subscription:', error)
        return null
      }
    },

    /**
     * Downgrade an expired-trial subscription to a free plan
     */
    async downgradeToFree(businessId: string, businessType: 'merchant' | 'vendor') {
      try {
        const response = await $fetch('/api/subscriptions/create', {
          method: 'POST',
          body: {
            planType: `${businessType}-free`,
            stripePriceId: ''
          }
        })
        // Reload subscription state
        await this.setActiveSubscription(businessId, businessType)
        return response
      } catch (error) {
        console.error('Error downgrading to free plan:', error)
        throw error
      }
    },

    /**
     * Load all subscriptions for a business (for payment history)
     */
    async loadSubscriptionsForBusiness(businessId: string, businessType: 'merchant' | 'vendor') {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('business_id', businessId)
          .eq('business_type', businessType)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Error loading subscriptions:', error)
        throw error
      }
    }
  },
})