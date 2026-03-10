/**
 * notification action types and their associated icons
 */

export const NOTIFICATION_ACTION_TYPES = {
  // Event-related
  EVENT_REQUEST_SENT: 'event_request_sent',
  EVENT_REQUEST_APPROVED: 'event_request_approved',
  EVENT_CONFIRMED: 'event_confirmed',
  EVENT_CANCELLED: 'event_cancelled',
  EVENT_COMPLETED: 'event_completed',
  
  // Review-related
  REVIEW_RECEIVED: 'review_received',
  REVIEW_UPDATED: 'review_updated',
  
  // Compliance-related
  COMPLIANCE_VERIFIED: 'compliance_verified',
  COMPLIANCE_REJECTED: 'compliance_rejected',
  COMPLIANCE_EXPIRING: 'compliance_expiring',
  COMPLIANCE_EXPIRED: 'compliance_expired',
  
  // Event invite-related
  EVENT_INVITE_SENT: 'event_invite_sent',
  EVENT_INVITE_ACCEPTED: 'event_invite_accepted',
  EVENT_INVITE_DECLINED: 'event_invite_declined',
  
  // Partnership-related
  PARTNERSHIP_REQUEST: 'partnership_request',
  PARTNERSHIP_REMOVED: 'partnership_removed',
  
  // Subscription-related
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription_downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription_payment_failed'
} as const

/**
 * Icon mapping for notification action types
 * Used for display in NotificationPanel and other UI components
 */
export const NOTIFICATION_ICONS: Record<string, string> = {
  [NOTIFICATION_ACTION_TYPES.EVENT_REQUEST_SENT]: 'pi pi-calendar-plus',
  [NOTIFICATION_ACTION_TYPES.EVENT_REQUEST_APPROVED]: 'pi pi-check-circle',
  [NOTIFICATION_ACTION_TYPES.EVENT_CONFIRMED]: 'pi pi-calendar-check',
  [NOTIFICATION_ACTION_TYPES.EVENT_CANCELLED]: 'pi pi-calendar-times',
  [NOTIFICATION_ACTION_TYPES.EVENT_COMPLETED]: 'pi pi-check',
  [NOTIFICATION_ACTION_TYPES.REVIEW_RECEIVED]: 'pi pi-star',
  [NOTIFICATION_ACTION_TYPES.REVIEW_UPDATED]: 'pi pi-star-fill',
  [NOTIFICATION_ACTION_TYPES.COMPLIANCE_VERIFIED]: 'pi pi-file-check',
  [NOTIFICATION_ACTION_TYPES.COMPLIANCE_REJECTED]: 'pi pi-file-excel',
  [NOTIFICATION_ACTION_TYPES.COMPLIANCE_EXPIRING]: 'pi pi-exclamation-triangle',
  [NOTIFICATION_ACTION_TYPES.COMPLIANCE_EXPIRED]: 'pi pi-exclamation-circle',
  [NOTIFICATION_ACTION_TYPES.EVENT_INVITE_SENT]: 'pi pi-envelope',
  [NOTIFICATION_ACTION_TYPES.EVENT_INVITE_ACCEPTED]: 'pi pi-check-circle',
  [NOTIFICATION_ACTION_TYPES.EVENT_INVITE_DECLINED]: 'pi pi-times-circle',
  [NOTIFICATION_ACTION_TYPES.PARTNERSHIP_REQUEST]: 'pi pi-handshake',
  [NOTIFICATION_ACTION_TYPES.PARTNERSHIP_REMOVED]: 'pi pi-user-minus',
  [NOTIFICATION_ACTION_TYPES.SUBSCRIPTION_UPGRADED]: 'pi pi-arrow-up',
  [NOTIFICATION_ACTION_TYPES.SUBSCRIPTION_DOWNGRADED]: 'pi pi-arrow-down',
  [NOTIFICATION_ACTION_TYPES.SUBSCRIPTION_CANCELLED]: 'pi pi-ban',
  [NOTIFICATION_ACTION_TYPES.SUBSCRIPTION_PAYMENT_FAILED]: 'pi pi-exclamation-triangle'
}

export type NotificationActionType = typeof NOTIFICATION_ACTION_TYPES[keyof typeof NOTIFICATION_ACTION_TYPES]

