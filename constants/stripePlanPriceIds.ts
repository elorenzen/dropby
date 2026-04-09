/**
 * Stripe Price IDs for the client (plan picker, Get Started payload).
 * Server onboarding still prefers STRIPE_PRICE_* env vars when set (see server/utils/stripePlanPrices.ts).
 *
 * Switching:
 * - Set `NUXT_PUBLIC_STRIPE_LIVE_PRICE_IDS=true` on builds that use **live** Stripe keys and fill `LIVE` below.
 * - Or set `NUXT_PUBLIC_STRIPE_USE_TEST_PRICE_IDS=true` to force **test** IDs even in a production build.
 */

type PaidPriceKey =
  | 'merchantPro'
  | 'merchantPremium'
  | 'vendorPro'
  | 'vendorPremium'

/** Test mode Price IDs (default) */
const TEST: Record<PaidPriceKey, string> = {
  merchantPro: 'price_1RpHqpE5B6laqC9SWeiNDf2U',
  merchantPremium: 'price_1RpHrHE5B6laqC9SCChY5dJB',
  vendorPro: 'price_1RpHsOE5B6laqC9S2hYZtXdt',
  vendorPremium: 'price_1RpHsnE5B6laqC9S9FvB3k3E'
}

/**
 * Live mode Price IDs — replace with your Dashboard **live** prices before enabling live mode.
 * If `useLiveStripePriceIds` is true and a value is still empty, we fall back to the test ID (Stripe may reject).
 */
const LIVE: Record<PaidPriceKey, string> = {
  merchantPro: 'prod_U4EJ2BydY6lRef',
  merchantPremium: 'prod_U4EJNu032MxlgW',
  vendorPro: 'prod_U4EJyuZkmxtI5W',
  vendorPremium: 'prod_U4EJSKAUKbBZih'
}

const env = import.meta.env

/**
 * Whether to use `LIVE` Price IDs (vs `TEST`).
 * - `NUXT_PUBLIC_STRIPE_USE_TEST_PRICE_IDS=true` → always test (e.g. staging build + test Stripe).
 * - `NUXT_PUBLIC_STRIPE_LIVE_PRICE_IDS=true` → always live (e.g. local prod build check).
 * - Else → live when Vite `MODE === 'production'` (`nuxt build`), test in dev.
 */
export const useLiveStripePriceIds: boolean =
  env.NUXT_PUBLIC_STRIPE_USE_TEST_PRICE_IDS === 'true'
    ? false
    : env.NUXT_PUBLIC_STRIPE_LIVE_PRICE_IDS === 'true'
      ? true
      : env.MODE === 'production'

export function stripePlanPriceId(key: PaidPriceKey): string {
  if (useLiveStripePriceIds) {
    const id = LIVE[key]
    if (id) return id
  }
  return TEST[key]
}
