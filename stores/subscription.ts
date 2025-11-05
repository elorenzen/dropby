import { defineStore } from 'pinia'
import type { Subscription } from '~/types'
import { hasFeatureAccess, merchantFeatures, vendorFeatures, type MerchantFeature, type VendorFeature } from '~/constants/subscriptionFeatures'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    activeSubscription: null as Subscription | null,
    loading: false,
    error: null as string | null
  }),
  getters: {
    getActiveSubscription: (state) => state.activeSubscription,
    
    // Check if subscription is active
    isActive: (state) => {
      return state.activeSubscription?.status === 'active'
    },
    
    // Get current plan type (defaults to 'free' if no subscription)
    currentPlanType: (state): 'free' | 'pro' | 'premium' => {
      return state.activeSubscription?.plan_type || 'free'
    },
    
    // Get business type from active subscription
    businessType: (state): 'merchant' | 'vendor' | null => {
      return state.activeSubscription?.business_type as 'merchant' | 'vendor' | null
    },
    
    // Generic feature checker
    hasFeature: (state) => {
      return (feature: MerchantFeature | VendorFeature): boolean => {
        if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
          // Default to free tier features when no active subscription
          const businessType = state.activeSubscription?.business_type as 'merchant' | 'vendor' || 'merchant'
          return hasFeatureAccess('free', feature, businessType)
        }
        
        const planType = state.activeSubscription.plan_type
        const businessType = state.activeSubscription.business_type as 'merchant' | 'vendor'
        
        return hasFeatureAccess(planType, feature, businessType)
      }
    },
    
    // Get all allowed features for the current subscription
    allowedFeatures: (state): (MerchantFeature | VendorFeature)[] => {
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        // Return free tier features
        const businessType = state.activeSubscription?.business_type as 'merchant' | 'vendor' || 'merchant'
        const features = businessType === 'merchant' 
          ? (Object.keys(merchantFeatures) as MerchantFeature[])
          : (Object.keys(vendorFeatures) as VendorFeature[])
        
        return features.filter(feature => 
          hasFeatureAccess('free', feature, businessType)
        )
      }
      
      const planType = state.activeSubscription.plan_type
      const businessType = state.activeSubscription.business_type as 'merchant' | 'vendor'
      const features = businessType === 'merchant' 
        ? (Object.keys(merchantFeatures) as MerchantFeature[])
        : (Object.keys(vendorFeatures) as VendorFeature[])
      
      return features.filter(feature => 
        hasFeatureAccess(planType, feature, businessType)
      )
    },
    
    // ============================================================================
    // MERCHANT FEATURE GETTERS
    // ============================================================================
    
    canCreateEvents: (state): boolean => {
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return true // Free tier can create events (with limits)
      }
      return state.activeSubscription.business_type === 'merchant'
    },
    
    canCreateUnlimitedEvents: (state): boolean => {
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
      if (!state.activeSubscription || state.activeSubscription.status !== 'active') {
        return true // Free tier can request events (with limits)
      }
      return state.activeSubscription.business_type === 'vendor'
    },
    
    canRequestUnlimitedEvents: (state): boolean => {
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
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('business_id', businessId)
                .eq('business_type', businessType)
                .eq('status', 'active')
                .single()

            if (data) this.activeSubscription = data as Subscription
            else throw new Error('No active subscription found')
        } catch (error: any) {
            console.error('Error setting active subscription:', error)
            throw error
        } finally {
            this.loading = false
        }
    },
    
    // Clear active subscription (useful when logging out or switching businesses)
    clearActiveSubscription() {
      this.activeSubscription = null
    },
  },
})