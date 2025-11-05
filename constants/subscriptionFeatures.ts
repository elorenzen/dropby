// ============================================================================
// SUBSCRIPTION FEATURE FLAGS
// ============================================================================

export type MerchantFeature =
  | 'createEvents'
  | 'createUnlimitedEvents'
  | 'createRecurringEvents'
  | 'setPreferredVendors'
  | 'setUnlimitedPreferredVendors'
  | 'setEventValuePricing'
  | 'setEventValuePromo'
  | 'createDateRangeEvents'
  | 'prioritySupport'
  | 'dedicatedSupport'

export type VendorFeature =
  | 'requestEvents'
  | 'requestUnlimitedEvents'
  | 'manageMenu'
  | 'preferredVendorStatus'
  | 'availabilityCalendar'
  | 'autoBooking'
  | 'prioritySupport'
  | 'dedicatedSupport'

// Feature mapping: which plan types have access to each feature
type PlanType = 'free' | 'pro' | 'premium'

export const merchantFeatures: Record<MerchantFeature, PlanType[]> = {
  createEvents: ['free', 'pro', 'premium'], // All plans can create events (with limits)
  createUnlimitedEvents: ['premium'],
  createRecurringEvents: ['premium'],
  setPreferredVendors: ['pro', 'premium'],
  setUnlimitedPreferredVendors: ['premium'],
  setEventValuePricing: ['pro', 'premium'],
  setEventValuePromo: ['premium'],
  createDateRangeEvents: ['pro', 'premium'],
  prioritySupport: ['pro', 'premium'],
  dedicatedSupport: ['premium']
}

export const vendorFeatures: Record<VendorFeature, PlanType[]> = {
  requestEvents: ['free', 'pro', 'premium'], // All plans can request events (with limits)
  requestUnlimitedEvents: ['premium'],
  manageMenu: ['pro', 'premium'],
  preferredVendorStatus: ['pro', 'premium'],
  availabilityCalendar: ['premium'],
  autoBooking: ['premium'],
  prioritySupport: ['pro', 'premium'],
  dedicatedSupport: ['premium']
}

// Helper function to check if a plan has access to a feature
export function hasFeatureAccess(
  planType: PlanType,
  feature: MerchantFeature | VendorFeature,
  businessType: 'merchant' | 'vendor'
): boolean {
  const features = businessType === 'merchant' ? merchantFeatures : vendorFeatures
  const allowedPlans = features[feature as keyof typeof features]
  
  if (!allowedPlans) {
    return false
  }
  
  return allowedPlans.includes(planType)
}

