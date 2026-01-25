/**
 * Date and period utility functions for analytics and time-based calculations
 */

export type Period = '7d' | '30d' | '90d' | '6m' | '1y' | 'all'
export type Interval = 'daily' | '3day' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

/**
 * Calculate the start date for a given period
 */
export function getPeriodStart(period: string): Date {
  if (period === 'all') return new Date(0) // Beginning of time
  const now = new Date()
  switch (period) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '6m': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - date.getDay())
  return weekStart
}

/**
 * Get the start of the month for a given date
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Get the start of the year for a given date
 */
export function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

/**
 * Calculate the number of days between two dates
 */
export function getDaysBetween(date1: Date, date2: Date): number {
  return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Get the start of the current month
 */
export function getThisMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Get the start of the previous month
 */
export function getLastMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, 1)
}

/**
 * Get today at midnight (start of day)
 */
export function getToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Determine the appropriate interval type for a given period
 */
export function getPeriodInterval(period: string): Interval {
  if (period === '7d') return 'daily'
  if (period === '30d') return '3day'
  if (period === '90d') return 'weekly'
  if (period === '6m') return 'biweekly'
  if (period === '1y') return 'monthly'
  
  // For 'all' period, determine based on date range
  const periodStart = getPeriodStart(period)
  const endDate = getToday()
  const daysDiff = getDaysBetween(periodStart, endDate)
  
  if (daysDiff > 730) { // More than 2 years
    return 'yearly'
  }
  return 'monthly'
}

/**
 * Get a date formatter function for a given interval
 */
export function getDateFormatter(interval: Interval): (date: Date) => string {
  switch (interval) {
    case 'daily':
    case '3day':
      return (date: Date) => date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    case 'weekly':
      return (date: Date) => {
        const weekStart = getStartOfWeek(date)
        return weekStart.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
      }
    case 'biweekly':
      return (date: Date) => date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    case 'monthly':
      return (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    case 'yearly':
      return (date: Date) => date.getFullYear().toString()
  }
}

/**
 * Format date with various options
 * @param date - Date object or date string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options?: {
    includeWeekday?: boolean
    format?: 'short' | 'long' | 'medium' | 'simple'
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return ''
  }

  const { includeWeekday = false, format = 'medium' } = options || {}

  // Simple format - just basic date
  if (format === 'simple') {
    return dateObj.toLocaleDateString()
  }

  // Short format - month short, day, year (e.g., "Jan 25, 2026")
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Medium format - weekday short, month short, day (e.g., "Mon, Jan 25")
  if (format === 'medium') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Long format - weekday long, month long, day, year (e.g., "Monday, January 25, 2026")
  if (format === 'long' || includeWeekday) {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Default to medium format
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time with various options
 * @param date - Date object or date string
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  options?: {
    hour12?: boolean
    includeSeconds?: boolean
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return ''
  }

  const { hour12 = true, includeSeconds = false } = options || {}

  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
    hour12
  })
}
