// ============================================================================
// EVENT & TIMELINE TYPES
// ============================================================================

export interface Event {
  id: string
  created_at: string
  vendor: string | null
  merchant: string | null
  start: string
  end: string
  location_coordinates: string | null
  status: string
  vendor_rating: number | null
  merchant_rating: number | null
  vendor_comment: string | null
  merchant_comment: string | null
  updated_at: string | null
  pending_requests: any[]
  location_url: string | null
  location_address: string | null
  notes: string | null
  day_id: string | null
  event_value: number | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id: string | null
}

export interface TimelineItem {
  id: string
  created_at: string
  owner_id: string
  other_ids: any[]
  title: string
  description: string | null
  type: string
}

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export interface Merchant {
  id: string
  created_at: string
  merchant_name: string
  website: string | null
  instagram: string | null
  phone: string | null
  email: string | null
  average_vendor_rating: number | null
  formatted_address: string | null
  merchant_description: string | null
  avatar_url: string | null
  updated_at: string | null
  coordinates: string | null
  address_components: any[] | null
  address_url: string | null
  notes: string | null
  preferred_vendors: any[] | null
  business_hours: any[] | null
  subscription_id: string | null
  monthly_event_limit: number | null
  current_month_events: number | null
  seating_capacity: number | null
  default_event_value: number | null
  custom_event_pricing: boolean | null
  minimum_event_value: number | null
  maximum_event_value: number | null
  payment_preferences: any | null
  stripe_customer_id: string | null
  stripe_connect_account_id: string | null
  compliance_verified: boolean | null
  compliance_verified_at: string | null
  compliance_score: number | null
}

export interface Vendor {
  id: string
  created_at: string
  vendor_name: string | null
  vendor_description: string | null
  website: string | null
  instagram: string | null
  phone: string | null
  email: string | null
  average_merchant_rating: number | null
  avatar_url: string | null
  updated_at: string | null
  cuisine: string[] | null
  business_hours: any[] | null
  base_latitude: number | null
  base_longitude: number | null
  formatted_address: string | null
  service_radius: number | null
  subscription_id: string | null
  monthly_request_limit: number | null
  current_month_requests: number | null
  stripe_customer_id: string | null
  stripe_connect_account_id: string | null
  compliance_verified: boolean | null
  compliance_verified_at: string | null
  compliance_score: number | null
}

// ============================================================================
// MENU TYPES
// ============================================================================

export interface MenuItem {
  id: string
  vendor_id: string | null
  created_at: string
  name: string | null
  description: string | null
  type: string | null
  price: number | null
  special: boolean | null
  updated_at: string | null
  image_url: string | null
  image_name: string | null
  creator_id: string | null
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  id: string
  created_at: string
  event_id: string
  author_id: string
  sender_id: string
  recipient_id: string
  rating: number
  content: string
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string
  created_at: string
  is_admin: boolean
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  type: string | null
  available_to_contact: boolean
  associated_merchant_id: string | null
  associated_vendor_id: string | null
  avatar_url: string | null
  updated_at: string | null
  stripe_customer_id: string | null
  current_plan: 'free' | 'pro' | 'premium' | 'enterprise'
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export interface ComplianceDocument {
  id: string
  business_id: string
  business_type: 'vendor' | 'merchant'
  category: string
  title: string
  document_type: string | null
  document_number: string | null
  certificate_id: string | null
  license_id: string | null
  permit_id: string | null
  issuing_authority: string | null
  authority_contact: string | null
  authority_website: string | null
  issue_date: string | null
  expiry_date: string | null
  renewal_date: string | null
  file_path: string | null
  storage_url: string | null
  notes: string | null
  verification_notes: string | null
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verified: boolean
  verified_by: string | null
  verified_at: string | null
  required: boolean
  created_at: string
  updated_at: string
}

export interface ComplianceRequirement {
  id: string
  business_type: 'vendor' | 'merchant'
  category: string
  title: string
  description: string | null
  required: boolean
  order_index: number | null
  created_at: string
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface Payment {
  id: string
  event_id: string | null
  merchant_id: string | null
  vendor_id: string | null
  amount: number
  platform_fee: number
  processing_fee: number
  vendor_payout: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  refund_reason: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface Subscription {
  id: string
  user_id: string | null
  plan_type: 'free' | 'pro' | 'premium' | 'enterprise'
  status: 'active' | 'past_due' | 'canceled' | 'unpaid'
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  created_at: string
  updated_at: string
  business_id: string | null
  business_type: string | null
}

// ============================================================================
// USAGE TRACKING TYPES
// ============================================================================

export interface UsageTracking {
  id: string
  business_id: string
  business_type: string
  usage_type: string
  usage_count: number | null
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export type BusinessType = 'vendor' | 'merchant'
export type EventStatus = 'open' | 'booked' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ComplianceStatus = 'pending' | 'verified' | 'rejected' | 'expired'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid'
export type PlanType = 'free' | 'pro' | 'premium' | 'enterprise'
