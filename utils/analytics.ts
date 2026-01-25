/**
 * Analytics calculation utilities for events, metrics, and aggregations
 */

import { getPeriodStart, getThisMonth, getLastMonth } from './dates'

/**
 * Calculate growth percentage between two periods
 * Handles zero cases appropriately
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Filter events by a time period
 */
export function filterEventsByPeriod(
  events: any[],
  period: string,
  dateField: string = 'start'
): any[] {
  if (period === 'all') return events
  
  const periodStart = getPeriodStart(period)
  return events.filter((event: any) => {
    const eventDate = new Date(event[dateField])
    return eventDate >= periodStart
  })
}

/**
 * Count events grouped by status
 */
export function countEventsByStatus(events: any[]): { [status: string]: number } {
  const counts: { [status: string]: number } = {}
  events.forEach(event => {
    counts[event.status] = (counts[event.status] || 0) + 1
  })
  return counts
}

/**
 * Count events by day of week (0 = Sunday, 6 = Saturday)
 */
export function countEventsByDayOfWeek(
  events: any[],
  dateField: string = 'start'
): { [day: number]: number } {
  const counts: { [day: number]: number } = {}
  events.forEach(event => {
    const dayOfWeek = new Date(event[dateField]).getDay()
    counts[dayOfWeek] = (counts[dayOfWeek] || 0) + 1
  })
  return counts
}

/**
 * Count events by hour of day (0-23)
 */
export function countEventsByHour(
  events: any[],
  dateField: string = 'start'
): { [hour: number]: number } {
  const counts: { [hour: number]: number } = {}
  events.forEach(event => {
    const hour = new Date(event[dateField]).getHours()
    counts[hour] = (counts[hour] || 0) + 1
  })
  return counts
}

/**
 * Calculate month-over-month growth metrics for events
 */
export function calculateGrowthMetrics(
  events: any[],
  dateField: string = 'created_at'
): { thisMonth: number; lastMonth: number; growth: number } {
  const thisMonth = getThisMonth()
  const lastMonth = getLastMonth()
  
  const thisMonthEvents = events.filter((e: any) => {
    const created = new Date(e[dateField])
    return created >= thisMonth
  }).length
  
  const lastMonthEvents = events.filter((e: any) => {
    const created = new Date(e[dateField])
    return created >= lastMonth && created < thisMonth
  }).length
  
  const growth = calculateGrowth(thisMonthEvents, lastMonthEvents)
  
  return {
    thisMonth: thisMonthEvents,
    lastMonth: lastMonthEvents,
    growth
  }
}

/**
 * Calculate relationship metrics (unique partners, repeat partners, average per partner)
 */
export function calculateRelationshipMetrics(
  events: any[],
  partnerIdField: 'merchant' | 'vendor'
): {
  uniquePartners: number
  repeatPartners: number
  avgPerPartner: number
  partnerCounts: { [id: string]: number }
} {
  const partnerIds = events
    .map((event: any) => event[partnerIdField])
    .filter((id): id is string => id !== null && id !== undefined)
  
  const uniquePartnerSet = new Set(partnerIds)
  const uniquePartners = uniquePartnerSet.size
  
  // Count events per partner
  const partnerCounts: { [key: string]: number } = {}
  partnerIds.forEach(id => {
    partnerCounts[id] = (partnerCounts[id] || 0) + 1
  })
  
  // Count repeat partners (partners with >1 event)
  const repeatPartners = Object.values(partnerCounts).filter(count => count > 1).length
  
  // Calculate average events per partner
  const avgPerPartner = uniquePartners > 0
    ? Math.round((events.length / uniquePartners) * 10) / 10
    : 0
  
  return {
    uniquePartners,
    repeatPartners,
    avgPerPartner,
    partnerCounts
  }
}

/**
 * Calculate rate metrics (acceptance rate, conversion rate, completion rate)
 */
export function calculateRateMetrics(
  accepted: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((accepted / total) * 100)
}

/**
 * Calculate event metrics by status and date filters
 */
export function calculateEventMetrics(
  events: any[],
  filters?: {
    status?: string[]
    dateRange?: { start: Date; end: Date }
    dateField?: string
  }
): {
  total: number
  byStatus: { [status: string]: number }
  upcoming: number
  upcomingWeek: number
} {
  let filtered = events
  
  // Filter by status
  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter((e: any) => filters.status!.includes(e.status))
  }
  
  // Filter by date range
  if (filters?.dateRange) {
    const { start, end } = filters.dateRange
    const dateField = filters.dateField || 'start'
    filtered = filtered.filter((e: any) => {
      const eventDate = new Date(e[dateField])
      return eventDate >= start && eventDate <= end
    })
  }
  
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const upcoming = filtered.filter((e: any) => {
    const eventDate = new Date(e.start)
    return eventDate > now
  }).length
  
  const upcomingWeek = filtered.filter((e: any) => {
    const eventDate = new Date(e.start)
    return eventDate >= now && eventDate <= nextWeek
  }).length
  
  return {
    total: filtered.length,
    byStatus: countEventsByStatus(filtered),
    upcoming,
    upcomingWeek
  }
}
