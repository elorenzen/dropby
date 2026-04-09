/**
 * Resolve Stripe Price IDs for onboarding (server-only).
 * Prefer environment variables in production so live keys use live price IDs.
 * See docs/ENVIRONMENTS.md.
 */
const PLAN_ID_TO_ENV_KEY: Record<string, string> = {
  'merchant-pro': 'STRIPE_PRICE_MERCHANT_PRO',
  'merchant-premium': 'STRIPE_PRICE_MERCHANT_PREMIUM',
  'vendor-pro': 'STRIPE_PRICE_VENDOR_PRO',
  'vendor-premium': 'STRIPE_PRICE_VENDOR_PREMIUM'
}

export function resolveStripePriceIdForPlan(plan: {
  id: string
  stripePriceId?: string
}): string | undefined {
  const envKey = PLAN_ID_TO_ENV_KEY[plan.id]
  const fromEnv = envKey ? process.env[envKey]?.trim() : undefined
  const fromClient = (plan.stripePriceId || '').trim()
  const resolved = fromEnv || fromClient
  return resolved || undefined
}
