/**
 * Event-related utility functions
 */

import type { Event } from '~/types'

export type Severity = 'success' | 'info' | 'warning' | 'danger' | 'secondary'

/**
 * Get the formatted status string for an event
 * Can accept either a status string or an Event object
 * 
 * @param eventOrStatus - Event object or status string
 * @returns Uppercase status string
 */
export function getEventStatus(eventOrStatus: Event | string): string {
  const status = typeof eventOrStatus === 'string' 
    ? eventOrStatus 
    : eventOrStatus.status || ''
  return status.toUpperCase()
}

/**
 * Get the severity color for an event status
 * Can accept either a status string or an Event object
 * 
 * @param eventOrStatus - Event object or status string
 * @returns Severity string for PrimeVue components
 */
export function getEventStatusSeverity(eventOrStatus: Event | string): Severity {
  // Extract status from Event object or use string directly
  const status = typeof eventOrStatus === 'string' 
    ? eventOrStatus.toLowerCase() 
    : (eventOrStatus.status || '').toLowerCase()

  // Map status to severity
  switch (status) {
    case 'open':
      return 'danger' // Red - needs attention
    case 'pending':
      return 'warning' // Orange - awaiting action
    case 'booked':
    case 'in-progress':
      return 'success' // Green - confirmed/active
    case 'completed':
      return 'info' // Blue - finished
    case 'closed':
    case 'cancelled':
      return 'secondary' // Gray - inactive
    default:
      return 'secondary' // Gray - unknown/other
  }
}
