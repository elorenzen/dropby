// ============================================================================
// PAYMENT SERVICE
// ============================================================================

import { useApi } from '~/composables/useApi'
import type Stripe from 'stripe'

// Request/Response Types
export interface ListPaymentMethodsParams {
  customerId: string
}

export interface AttachPaymentMethodParams {
  customerId: string
  paymentMethodId: string
  title: string
  defaultPaymentMethod?: boolean
}

export interface AttachPaymentMethodResponse {
  success: boolean
  paymentMethod: Stripe.PaymentMethod
}

export interface DetachPaymentMethodParams {
  paymentMethodId: string
}

export interface DetachPaymentMethodResponse {
  success: boolean
  message: string
}

export interface CreateOneTimePaymentParams {
  businessId: string
  businessType: 'merchant' | 'vendor'
  actionType: 'events' | 'requests'
  amount: number
  paymentMethodId: string
}

export interface CreateOneTimePaymentResponse {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  message?: string
}

// Service implementation
export const paymentService = {
  /**
   * List payment methods for a customer
   */
  listPaymentMethods: async (params: ListPaymentMethodsParams): Promise<Stripe.PaymentMethod[]> => {
    const api = useApi()
    return await api.post<Stripe.PaymentMethod[]>('/api/payments/list-payment-methods', params)
  },
  
  /**
   * Attach a payment method to a customer
   */
  attachPaymentMethod: async (params: AttachPaymentMethodParams): Promise<AttachPaymentMethodResponse> => {
    const api = useApi()
    return await api.post<AttachPaymentMethodResponse>('/api/payments/attach-payment-method', params)
  },
  
  /**
   * Detach a payment method from a customer
   */
  detachPaymentMethod: async (params: DetachPaymentMethodParams): Promise<DetachPaymentMethodResponse> => {
    const api = useApi()
    return await api.post<DetachPaymentMethodResponse>('/api/payments/detach-payment-method', params)
  },
  
  /**
   * Create a one-time payment
   */
  createOneTimePayment: async (params: CreateOneTimePaymentParams): Promise<CreateOneTimePaymentResponse> => {
    const api = useApi()
    return await api.post<CreateOneTimePaymentResponse>('/api/payments/create-one-time-payment', params)
  }
}
