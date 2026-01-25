// ============================================================================
// USAGE SERVICE
// ============================================================================

import { useApi } from '~/composables/useApi'

// Request/Response Types
export interface UsageCheckParams {
  businessId: string
  businessType: 'merchant' | 'vendor'
  usageType: 'events' | 'requests' | 'messages'
  requiredAmount?: number
}

export interface UsageCheckResponse {
  success: boolean
  allowed: boolean
  currentUsage: number
  usageLimit: number
  remainingUsage: number
  usageType: string
  businessId: string
  businessType: string
  subscription: {
    planType: string
    status: string
  }
}

export interface UsageIncrementParams {
  businessId: string
  businessType: 'merchant' | 'vendor'
  usageType: 'events' | 'requests' | 'messages'
  incrementAmount?: number
}

export interface UsageIncrementResponse {
  success: boolean
  message?: string
  currentUsage?: number
  usageType: string
  businessId: string
  businessType: string
}

// Service implementation
export const usageService = {
  /**
   * Check if business can perform an action based on usage limits
   */
  check: async (params: UsageCheckParams): Promise<UsageCheckResponse> => {
    const api = useApi()
    return await api.post<UsageCheckResponse>('/api/usage/check', params)
  },
  
  /**
   * Increment usage count for a business
   */
  increment: async (params: UsageIncrementParams): Promise<UsageIncrementResponse> => {
    const api = useApi()
    return await api.post<UsageIncrementResponse>('/api/usage/increment', params)
  }
}
