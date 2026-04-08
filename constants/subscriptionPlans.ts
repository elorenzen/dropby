import { stripePlanPriceId } from './stripePlanPriceIds'
import { MERCHANT_PRO_MAX_PREFERRED_VENDORS } from './subscriptionFeatures'

/**
 * Stripe Price IDs come from `stripePlanPriceIds.ts` (test vs live from `import.meta.env`; see docs/ENVIRONMENTS.md).
 * Server onboarding can still override with STRIPE_PRICE_* env vars.
 */

// Plan interface for subscription plans display
export interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  buttonText: string
  featured: boolean
  stripePriceId: string
}

export const merchantPlans: Plan[] = [
  {
    id: 'merchant-free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '3 events per month',
      'Basic dashboard'
    ],
    buttonText: 'Get Started',
    featured: false,
    stripePriceId: ''
  },
  {
    id: 'merchant-pro',
    name: 'Pro',
    price: 19,
    description: 'For growing businesses',
    features: [
      '10 events per month',
      `${MERCHANT_PRO_MAX_PREFERRED_VENDORS} preferred vendors`,
      // 'Event value pricing', // deferred — not implemented
      'Date-range events',
      'Post-event reviews'
    ],
    buttonText: 'Start Pro',
    featured: true,
    stripePriceId: stripePlanPriceId('merchantPro')
  },
  {
    id: 'merchant-premium',
    name: 'Premium',
    price: 49,
    description: 'For premium merchants',
    features: [
      'Everything in Pro',
      'Unlimited events',
      'Recurring events',
      'Unlimited preferred vendors'
      // 'Event value promo', // deferred — not implemented
    ],
    buttonText: 'Start Premium',
    featured: false,
    stripePriceId: stripePlanPriceId('merchantPremium')
  }
]

export const vendorPlans: Plan[] = [
  {
    id: 'vendor-free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '5 event requests per month',
      'Menu: name, price, category',
      'Basic profile'
    ],
    buttonText: 'Get Started',
    featured: false,
    stripePriceId: ''
  },
  {
    id: 'vendor-pro',
    name: 'Pro',
    price: 29,
    description: 'For active food trucks',
    features: [
      '15 event requests per month',
      'Rich menu (photos, descriptions, specials)',
      'Post-event reviews'
    ],
    buttonText: 'Start Pro',
    featured: true,
    stripePriceId: stripePlanPriceId('vendorPro')
  },
  {
    id: 'vendor-premium',
    name: 'Premium',
    price: 79,
    description: 'For premium vendors',
    features: [
      'Everything in Pro',
      'Unlimited event requests',
      'Availability calendar',
      'Auto-booking'
    ],
    buttonText: 'Start Premium',
    featured: false,
    stripePriceId: stripePlanPriceId('vendorPremium')
  }
]

