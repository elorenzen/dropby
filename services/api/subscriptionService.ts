// ============================================================================
// SUBSCRIPTION SERVICE
// ============================================================================

import { useApi } from '~/composables/useApi'

// Request/Response Types
export interface CreateSubscriptionParams {
  planType: 'free' | 'pro' | 'premium'
  stripePriceId: string
  paymentMethodId?: string
}

export interface CreateSubscriptionResponse {
  success: boolean
  subscriptionId?: string
  subscription?: any
  clientSecret?: string
  message?: string
}

// Service implementation
export const subscriptionService = {
  /**
   * Create a new subscription
   */
  create: async (params: CreateSubscriptionParams): Promise<CreateSubscriptionResponse> => {
    const api = useApi()
    return await api.post<CreateSubscriptionResponse>('/api/subscriptions/create', params)
  }
}
