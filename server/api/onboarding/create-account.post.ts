import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import Stripe from 'stripe'

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
  const body = await readBody<OnboardingBody>(event)

  if (!body?.type || !body?.email || !body?.password || !body?.plan) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required onboarding fields'
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
      password: body.password
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
        registered: false
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
    let subscriptionError: any = null

    try {
      const planType = normalizePlanType(body.plan.id)
      if (body.plan.price > 0 && body.plan.stripePriceId) {
        const paid = await createPaidSubscription(serviceClient, {
          businessId,
          businessType,
          userId: authUserId,
          businessName: body.business.name,
          businessEmail: body.business.email || body.email,
          planType,
          stripePriceId: body.plan.stripePriceId
        })
        subscriptionData = paid.record

        await serviceClient
          .from(`${businessType}s`)
          .update({
            stripe_customer_id: paid.stripeCustomerId,
            subscription_id: paid.record.id
          } as any)
          .eq('id', businessId)
      } else {
        const free = await createFreeSubscription(serviceClient, businessId, businessType, authUserId)
        subscriptionData = free
        await serviceClient
          .from(`${businessType}s`)
          .update({ subscription_id: free.id } as any)
          .eq('id', businessId)
      }
    } catch (subscriptionCreationError) {
      subscriptionError = subscriptionCreationError
      console.warn('Onboarding subscription creation failed (non-blocking):', subscriptionCreationError)
    }

    return {
      success: true,
      userId: authUserId,
      businessId,
      businessType,
      requiresEmailConfirmation: true,
      subscription: subscriptionData,
      subscriptionError: subscriptionError ? 'Subscription setup failed, can be completed in settings.' : null
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
