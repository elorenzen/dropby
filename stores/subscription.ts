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
    
    // Check if subscription is active (beta counts as active)
    isActive: (state) => {
      if (state.isBetaTester) return true
      return state.activeSubscription?.status === 'active'
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

        if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
          return hasFeatureAccess('free', feature, bType)
        }
        
        return hasFeatureAccess(state.activeSubscription.plan_type, feature, bType)
      }
    },
    
    // Get all allowed features for the current subscription
    allowedFeatures: (state): (MerchantFeature | VendorFeature)[] => {
      const bType = state.activeSubscription?.business_type as 'merchant' | 'vendor' || 'merchant'
      const planForCheck: 'free' | 'pro' | 'premium' = state.isBetaTester
        ? 'premium'
        : (state.activeSubscription?.status === 'active' ? state.activeSubscription.plan_type : 'free')

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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return true // Free tier can create events (with limits)
      }
      return state.activeSubscription.business_type === 'merchant'
    },
    
    canCreateUnlimitedEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'setUnlimitedPreferredVendors',
        'merchant'
      )
    },
    
    canSetEventValuePricing: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'setEventValuePricing',
        'merchant'
      )
    },
    
    canSetEventValuePromo: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'setEventValuePromo',
        'merchant'
      )
    },
    
    canCreateDateRangeEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return true // Free tier can request events (with limits)
      }
      return state.activeSubscription.business_type === 'vendor'
    },
    
    canRequestUnlimitedEvents: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'manageMenu',
        'vendor'
      )
    },
    
    canHavePreferredVendorStatus: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'autoBooking',
        'vendor'
      )
    },
    
    // ============================================================================
    // SUPPORT FEATURE GETTERS
    // ============================================================================
    
    hasPrioritySupport: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      const businessType = state.activeSubscription.business_type as 'merchant' | 'vendor'
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'prioritySupport',
        businessType
      )
    },
    
    hasDedicatedSupport: (state): boolean => {
      if (state.isBetaTester) return true
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return false
      }
      const businessType = state.activeSubscription.business_type as 'merchant' | 'vendor'
      return hasFeatureAccess(
        state.activeSubscription.plan_type,
        'dedicatedSupport',
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
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('business_id', businessId)
                .eq('business_type', businessType)
                .eq('status', 'active')
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "no rows returned" which is fine - just means no active subscription
                console.error('Error fetching subscription:', error)
                this.error = error.message
            }

            if (data) {
                this.activeSubscription = data as Subscription
            } else {
                // No active subscription found - this is OK, user is on free tier
                this.activeSubscription = null
            }
        } catch (error: any) {
            console.error('Error setting active subscription:', error)
            this.error = error.message || 'Failed to load subscription'
            this.activeSubscription = null // Set to null instead of crashing
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