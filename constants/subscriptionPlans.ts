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
      'Basic dashboard',
      'Email support'
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
      '3 preferred vendors',
      'Event value pricing',
      'Date range creation',
      'Priority support'
    ],
    buttonText: 'Start Pro Trial',
    featured: true,
    stripePriceId: 'price_1RpHqpE5B6laqC9SWeiNDf2U'
  },
  {
    id: 'merchant-premium',
    name: 'Premium',
    price: 49,
    description: 'For premium merchants',
    features: [
      'Unlimited events',
      'Recurring events',
      'Unlimited preferred vendors',
      'Event value promo',
      'Date range creation',
      'Dedicated support'
    ],
    buttonText: 'Start Premium',
    featured: false,
    stripePriceId: 'price_1RpHrHE5B6laqC9SCChY5dJB'
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
      'Basic profile',
      'Email support'
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
      'Menu management',
      'Preferred vendor status',
      'Priority support'
    ],
    buttonText: 'Start Pro Trial',
    featured: true,
    stripePriceId: 'price_1RpHsOE5B6laqC9S2hYZtXdt'
  },
  {
    id: 'vendor-premium',
    name: 'Premium',
    price: 79,
    description: 'For premium vendors',
    features: [
      'Unlimited event requests',
      'Menu management',
      'Preferred vendor status',
      'Availability calendar',
      'Auto-booking',
      'Dedicated support'
    ],
    buttonText: 'Start Premium',
    featured: false,
    stripePriceId: 'price_1RpHsnE5B6laqC9S9FvB3k3E'
  }
]

