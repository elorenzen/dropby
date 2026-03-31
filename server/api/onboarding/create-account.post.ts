import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import Stripe from 'stripe'
import { resolveStripePriceIdForPlan } from '~/server/utils/stripePlanPrices'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

type BusinessType = 'merchant' | 'vendor'

interface OnboardingPlan {
  id: string
  price: number
  stripePriceId?: string
}

interface OnboardingBody {
  type: BusinessType
  firstName: string
  lastName: string
  email: string
  phone: string
  isAdmin: boolean
  availableToContact: boolean
  password: string
  business: {
    name: string
    description: string
    website?: string
    instagram?: string
    phone: string
    email: string
    avatarUrl?: string
    addressComponents?: any[]
    coordinates?: { lat?: number; lng?: number }
    formattedAddress?: string
    addressUrl?: string
    cuisine?: string[]
  }
  plan: OnboardingPlan
}

const normalizePlanType = (planId: string) => {
  const parts = (planId || '').split('-').filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 1] : planId || 'free'
}

const insertTimelineBestEffort = async (
  client: Awaited<ReturnType<typeof serverSupabaseServiceRole>>,
  timeline: {
    owner_id: string
    other_ids: string[]
    title: string
    description: string
    type: string
  }
) => {
  try {
    await client.from('timeline_items').insert({
      ...timeline,
      created_at: new Date().toISOString()
    } as any)
  } catch (error) {
    console.warn('Best-effort timeline insert failed:', error)
  }
}

const isBetaTesterEmail = async (
  client: Awaited<ReturnType<typeof serverSupabaseServiceRole>>,
  email: string
) => {
  const { data } = await client
    .from('beta_testers')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  return !!data
}

const createBetaPremiumSubscription = async (
  client: Awaited<ReturnType<typeof serverSupabaseServiceRole>>,
  businessId: string,
  businessType: BusinessType,
  userId: string
) => {
  const { data, error } = await client
    .from('subscriptions')
    .insert({
      business_id: businessId,
      business_type: businessType,
      user_id: userId,
      plan_type: 'premium',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

const createFreeSubscription = async (
  client: Awaited<ReturnType<typeof serverSupabaseServiceRole>>,
  businessId: string,
  businessType: BusinessType,
  userId: string
) => {
  const { data, error } = await client
    .from('subscriptions')
    .insert({
      business_id: businessId,
      business_type: businessType,
      user_id: userId,
      plan_type: 'free',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

const createPaidSubscription = async (
  client: Awaited<ReturnType<typeof serverSupabaseServiceRole>>,
  params: {
    businessId: string
    businessType: BusinessType
    userId: string
    businessName: string
    businessEmail: string
    planType: string
    stripePriceId: string
  }
) => {
  const stripeCustomer = await stripe.customers.create({
    email: params.businessEmail,
    name: params.businessName,
    metadata: {
      business_id: params.businessId,
      business_type: params.businessType,
      user_id: params.userId
    }
  })

  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomer.id,
    items: [{ price: params.stripePriceId }],
    trial_period_days: 7,
    payment_behavior: 'default_incomplete',
    collection_method: 'charge_automatically',
    metadata: {
      business_id: params.businessId,
      business_type: params.businessType,
      user_id: params.userId,
      plan_type: params.planType
    }
  })

  const subscriptionStatus =
    stripeSubscription.status === 'active'
      ? 'active'
      : stripeSubscription.status === 'trialing'
        ? 'trialing'
        : 'unpaid'

  const currentPeriodStart = stripeSubscription.current_period_start
    ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
    : new Date().toISOString()

  const currentPeriodEnd = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const trialEnd = stripeSubscription.trial_end
    ? new Date(stripeSubscription.trial_end * 1000).toISOString()
    : null

  const insertPayload: Record<string, any> = {
    business_id: params.businessId,
    business_type: params.businessType,
    user_id: params.userId,
    plan_type: params.planType,
    status: subscriptionStatus,
    stripe_customer_id: stripeCustomer.id,
    stripe_subscription_id: stripeSubscription.id,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (trialEnd) {
    insertPayload.trial_end = trialEnd
  }

  const { data, error } = await client
    .from('subscriptions')
    .insert(insertPayload as any)
    .select()
    .single()

  if (error) {
    try {
      await stripe.subscriptions.cancel(stripeSubscription.id)
    } catch (stripeCancelError) {
      console.warn('Failed to cancel Stripe subscription after DB failure:', stripeCancelError)
    }
    throw error
  }

  return {
    record: data,
    stripeCustomerId: stripeCustomer.id
  }
}

export default defineEventHandler(async (event) => {
  const authClient = await serverSupabaseClient(event)
  const serviceClient = await serverSupabaseServiceRole(event)
  const runtimeConfig = useRuntimeConfig(event)
  const body = await readBody<OnboardingBody>(event)

  const siteUrl = String(runtimeConfig.public.siteUrl || 'https://dropby.dev').replace(/\/$/, '')
  const emailRedirectTo = `${siteUrl}/auth/callback?flow=signup`

  if (!body?.type || !body?.email || !body?.password || !body?.plan) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required onboarding fields'
    })
  }

  const isBetaTester = await isBetaTesterEmail(serviceClient, body.email)
  const resolvedStripePriceId = resolveStripePriceIdForPlan(body.plan)

  if (!isBetaTester && body.plan.price > 0 && !resolvedStripePriceId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Paid plan is missing a Stripe price ID. Set STRIPE_PRICE_* env vars for production or use a valid test plan.'
    })
  }

  const businessType: BusinessType = body.type
  const businessId = crypto.randomUUID()

  let authUserId: string | null = null
  let userCreated = false
  let businessCreated = false

  try {
    const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        emailRedirectTo
      }
    })

    if (signUpError) {
      throw createError({
        statusCode: 400,
        statusMessage: signUpError.message || 'Unable to create auth account'
      })
    }

    if (!signUpData.user?.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Auth account was not created'
      })
    }

    authUserId = signUpData.user.id

    const { data: userData, error: userInsertError } = await serviceClient
      .from('users')
      .insert({
        id: authUserId,
        created_at: new Date().toISOString(),
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        is_admin: body.isAdmin,
        type: businessType,
        associated_merchant_id: businessType === 'merchant' ? businessId : null,
        associated_vendor_id: businessType === 'vendor' ? businessId : null,
        available_to_contact: body.availableToContact,
        // Password and profile are complete; email confirmation only activates the session.
        registered: true,
        current_plan: 'free'
      } as any)
      .select()
      .single()

    if (userInsertError || !userData) {
      throw createError({
        statusCode: 500,
        statusMessage: userInsertError?.message || 'Failed to create user profile'
      })
    }
    userCreated = true

    const businessPayload: Record<string, any> = {
      id: businessId,
      created_at: new Date().toISOString(),
      [`${businessType}_name`]: body.business.name,
      [`${businessType}_description`]: body.business.description,
      website: body.business.website || '',
      instagram: body.business.instagram || '',
      phone: body.business.phone,
      email: body.business.email,
      avatar_url: body.business.avatarUrl || ''
    }

    if (businessType === 'merchant') {
      businessPayload.address_components = body.business.addressComponents || []
      businessPayload.coordinates = body.business.coordinates || {}
      businessPayload.formatted_address = body.business.formattedAddress || ''
      businessPayload.address_url = body.business.addressUrl || ''
    } else {
      businessPayload.cuisine = body.business.cuisine || []
    }

    const { data: businessData, error: businessInsertError } = await serviceClient
      .from(`${businessType}s`)
      .insert(businessPayload as any)
      .select()
      .single()

    if (businessInsertError || !businessData) {
      throw createError({
        statusCode: 500,
        statusMessage: businessInsertError?.message || 'Failed to create business record'
      })
    }
    businessCreated = true

    await insertTimelineBestEffort(serviceClient, {
      owner_id: authUserId,
      other_ids: [authUserId],
      title: 'User Created',
      description: 'New user account created',
      type: 'user_created'
    })

    await insertTimelineBestEffort(serviceClient, {
      owner_id: businessId,
      other_ids: [businessId],
      title: `${businessType === 'merchant' ? 'Merchant' : 'Vendor'} Created`,
      description: `New ${businessType} account created`,
      type: `${businessType}_created`
    })

    let subscriptionData: any = null
    let usedFallbackPlan = false

    const planType = normalizePlanType(body.plan.id)

    const syncUserCurrentPlan = async (plan: 'free' | 'pro' | 'premium') => {
      await serviceClient
        .from('users')
        .update({ current_plan: plan } as any)
        .eq('id', authUserId!)
    }

    if (isBetaTester) {
      const premium = await createBetaPremiumSubscription(
        serviceClient,
        businessId,
        businessType,
        authUserId
      )
      subscriptionData = premium
      await serviceClient
        .from(`${businessType}s`)
        .update({ subscription_id: premium.id } as any)
        .eq('id', businessId)
      await syncUserCurrentPlan('premium')
    } else if (body.plan.price > 0 && resolvedStripePriceId) {
      try {
        const paid = await createPaidSubscription(serviceClient, {
          businessId,
          businessType,
          userId: authUserId,
          businessName: body.business.name,
          businessEmail: body.business.email || body.email,
          planType,
          stripePriceId: resolvedStripePriceId
        })
        subscriptionData = paid.record

        await serviceClient
          .from(`${businessType}s`)
          .update({
            stripe_customer_id: paid.stripeCustomerId,
            subscription_id: paid.record.id
          } as any)
          .eq('id', businessId)

        const paidPlan = planType === 'pro' || planType === 'premium' ? planType : 'premium'
        await syncUserCurrentPlan(paidPlan)
      } catch (paidError) {
        console.error('Paid subscription onboarding failed, falling back to free:', paidError)
        try {
          const free = await createFreeSubscription(
            serviceClient,
            businessId,
            businessType,
            authUserId
          )
          subscriptionData = free
          usedFallbackPlan = true
          await serviceClient
            .from(`${businessType}s`)
            .update({ subscription_id: free.id } as any)
            .eq('id', businessId)
          await syncUserCurrentPlan('free')
        } catch (fallbackError) {
          console.error('Free subscription fallback failed after paid error:', fallbackError)
          throw createError({
            statusCode: 502,
            statusMessage:
              'Could not complete subscription setup. No account charges were made; please try again or contact support.'
          })
        }
      }
    } else {
      const free = await createFreeSubscription(serviceClient, businessId, businessType, authUserId)
      subscriptionData = free
      await serviceClient
        .from(`${businessType}s`)
        .update({ subscription_id: free.id } as any)
        .eq('id', businessId)
      await syncUserCurrentPlan('free')
    }

    if (!subscriptionData) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Subscription record was not created'
      })
    }

    return {
      success: true,
      userId: authUserId,
      businessId,
      businessType,
      requiresEmailConfirmation: true,
      subscription: subscriptionData,
      usedFallbackPlan
    }
  } catch (error: any) {
    if (authUserId && !businessCreated) {
      if (userCreated) {
        try {
          await serviceClient.from('users').delete().eq('id', authUserId)
        } catch (cleanupError) {
          console.warn('Failed to clean up user row after onboarding failure:', cleanupError)
        }
      }
      try {
        await serviceClient.auth.admin.deleteUser(authUserId)
      } catch (cleanupError) {
        console.warn('Failed to clean up auth user after onboarding failure:', cleanupError)
      }
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Onboarding failed'
    })
  }
})
