import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { accountId } = body

    if (!accountId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing accountId parameter'
      })
    }

    // Retrieve the Stripe Connect account
    const account = await stripe.accounts.retrieve(accountId)

    // Determine account status
    let accountStatus: 'complete' | 'pending' | null = null
    
    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      accountStatus = 'complete'
    } else if (account.details_submitted) {
      accountStatus = 'pending'
    } else {
      accountStatus = null
    }

    return {
      success: true,
      accountStatus,
      account: {
        id: account.id,
        business_type: account.business_type,
        country: account.country,
        created: account.created,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      }
    }

  } catch (error: any) {
    console.error('Error checking Stripe Connect status:', error)
    
    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stripe Connect account not found'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to check Stripe Connect status'
    })
  }
}) 