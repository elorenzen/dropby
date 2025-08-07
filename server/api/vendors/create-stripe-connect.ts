import { serverSupabaseClient } from '#supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)
    
    const { vendorId, email, businessName, businessType = 'individual' } = body

    // Validate required parameters
    if (!vendorId || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: vendorId, email'
      })
    }

    // Check if vendor already has a Stripe Connect account
    const { data: existingVendor, error: vendorError } = await client
      .from('vendors')
      .select('stripe_connect_account_id')
      .eq('id', vendorId)
      .single()

    if (vendorError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found'
      })
    }

    if (existingVendor.stripe_connect_account_id) {
      return {
        success: true,
        message: 'Vendor already has Stripe Connect account',
        accountId: existingVendor.stripe_connect_account_id
      }
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express', // Simplest onboarding for vendors
      country: 'US',
      email: email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true }
      },
      business_type: businessType,
      controller: {
        fees: { payer: 'application' },
        losses: { payments: 'application' },
        stripe_dashboard: { type: 'express' }
      },
      metadata: {
        vendor_id: vendorId,
        business_name: businessName
      }
    })

    // Update vendor with Stripe Connect account ID
    const { error: updateError } = await client
      .from('vendors')
      .update({ 
        stripe_connect_account_id: account.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update vendor with Stripe Connect account'
      })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NUXT_PUBLIC_SITE_URL}/vendor/${vendorId}/dashboard`,
      return_url: `${process.env.NUXT_PUBLIC_SITE_URL}/vendor/${vendorId}/dashboard`,
      type: 'account_onboarding',
    })

    return {
      success: true,
      message: 'Stripe Connect account created successfully',
      accountId: account.id,
      accountLink: accountLink.url,
      accountStatus: account.details_submitted ? 'complete' : 'pending'
    }

  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to create Stripe Connect account'
    })
  }
}) 