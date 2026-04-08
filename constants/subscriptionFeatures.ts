// ============================================================================
// SUBSCRIPTION FEATURE FLAGS
// ============================================================================

/** Merchant Pro cap for preferred vendors; Premium is unlimited (see setUnlimitedPreferredVendors). */
export const MERCHANT_PRO_MAX_PREFERRED_VENDORS = 3

export type MerchantFeature =
  | 'createEvents'
  | 'createUnlimitedEvents'
  | 'createRecurringEvents'
  | 'setPreferredVendors'
  | 'setUnlimitedPreferredVendors'
  // deferred — not implemented: 'setEventValuePricing' | 'setEventValuePromo'
  | 'createDateRangeEvents'
  | 'createPostEventReviews'

export type VendorFeature =
  | 'requestEvents'
  | 'requestUnlimitedEvents'
  | 'manageMenu'
  | 'menuRichContent'
  | 'preferredVendorStatus'
  | 'availabilityCalendar'
  | 'autoBooking'
  | 'createPostEventReviews'

// Feature mapping: which plan types have access to each feature
type PlanType = 'free' | 'pro' | 'premium'

export const merchantFeatures: Record<MerchantFeature, PlanType[]> = {
  createEvents: ['free', 'pro', 'premium'], // All plans can create events (with limits)
  createUnlimitedEvents: ['premium'],
  createRecurringEvents: ['premium'],
  setPreferredVendors: ['pro', 'premium'],
  setUnlimitedPreferredVendors: ['premium'],
  // setEventValuePricing: ['pro', 'premium'], // deferred — not implemented
  // setEventValuePromo: ['premium'], // deferred — not implemented
  createDateRangeEvents: ['pro', 'premium'],
  createPostEventReviews: ['pro', 'premium']
}

export const vendorFeatures: Record<VendorFeature, PlanType[]> = {
  requestEvents: ['free', 'pro', 'premium'], // All plans can request events (with limits)
  requestUnlimitedEvents: ['premium'],
  manageMenu: ['free', 'pro', 'premium'], // Free: name, price, category only (see menuRichContent)
  menuRichContent: ['pro', 'premium'], // Descriptions, images, seasonal/special flag
  preferredVendorStatus: ['pro', 'premium'],
  availabilityCalendar: ['premium'],
  autoBooking: ['premium'],
  createPostEventReviews: ['pro', 'premium']
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
