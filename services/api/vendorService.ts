// ============================================================================
// VENDOR SERVICE
// ============================================================================

import { useApi } from '~/composables/useApi'

// Request/Response Types
export interface CheckStripeStatusParams {
  accountId: string
}

export interface CheckStripeStatusResponse {
  accountStatus: string
  [key: string]: any
}

export interface CreateStripeConnectParams {
  vendorId: string
  email: string
  businessName: string
}

export interface CreateStripeConnectResponse {
  success: boolean
  accountId?: string
  accountLink?: string
  message?: string
  [key: string]: any
}

// Service implementation
export const vendorService = {
  /**
   * Check Stripe Connect account status
   */
  checkStripeStatus: async (params: CheckStripeStatusParams): Promise<CheckStripeStatusResponse> => {
    const api = useApi()
    return await api.post<CheckStripeStatusResponse>('/api/vendors/check-stripe-status', params)
  },
  
  /**
   * Create Stripe Connect account for vendor
   */
  createStripeConnect: async (params: CreateStripeConnectParams): Promise<CreateStripeConnectResponse> => {
    const api = useApi()
    return await api.post<CreateStripeConnectResponse>('/api/vendors/create-stripe-connect', params)
  }
}
