// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

import { useApi } from '~/composables/useApi'

export interface SendReviewNotificationParams {
  recipientId: string
  senderId: string
  rating: number
  content?: string
}

export interface SendReviewNotificationResponse {
  success: boolean
  skipped?: boolean
  message?: string
  data?: any
  error?: string
}

export const notificationService = {
  sendReviewNotification: async (params: SendReviewNotificationParams): Promise<SendReviewNotificationResponse> => {
    const api = useApi()
    return await api.post<SendReviewNotificationResponse>('/api/sendReviewNotification', params)
  }
}
