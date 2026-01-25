/**
 * Time series generation utilities for chart data
 */

import { 
  getPeriodStart, 
  getToday, 
  getPeriodInterval, 
  getDateFormatter,
  getStartOfWeek,
  getStartOfMonth,
  getStartOfYear,
  getDaysBetween
} from './dates'
import type { Interval } from './dates'

export interface TimeSeriesResult {
  labels: string[]
  data: number[]
}

/**
 * Generate time series data for events over a given period
 * 
 * @param events - Array of events with date fields
 * @param period - Period string ('7d', '30d', '90d', '6m', '1y', 'all')
 * @param dateField - Field name in event object that contains the date (default: 'start')
 * @returns Object with labels and data arrays for charting
 */
export function generateTimeSeries(
  events: any[],
  period: string,
  dateField: string = 'start'
): TimeSeriesResult {
  const periodStart = getPeriodStart(period)
  const endDate = getToday()
  const interval = getPeriodInterval(period)
  const dateFormat = getDateFormatter(interval)
  
  // Generate date labels and buckets
  const labels: string[] = []
  const data: number[] = []
  const buckets: { [key: string]: number } = {}
  
  // Initialize buckets with zeros
  let currentDate = new Date(periodStart)
  while (currentDate <= endDate) {
    const { bucketKey, nextDate } = getBucketForInterval(currentDate, interval, dateFormat, periodStart)
    
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = 0
      labels.push(bucketKey)
    }
    
    currentDate = nextDate
  }
  
  // Map events to buckets
  events.forEach(event => {
    const eventDate = new Date(event[dateField])
    const bucketKey = getEventBucketKey(eventDate, interval, dateFormat, periodStart)
    
    if (buckets[bucketKey] !== undefined) {
      buckets[bucketKey]++
    }
  })
  
  // Convert to data array in label order
  data.push(...labels.map(label => buckets[label] || 0))
  
  return { labels, data }
}

/**
 * Get the bucket key and next date for a given interval
 */
function getBucketForInterval(
  currentDate: Date,
  interval: Interval,
  dateFormat: (date: Date) => string,
  periodStart: Date
): { bucketKey: string; nextDate: Date } {
  switch (interval) {
    case 'daily': {
      const bucketKey = dateFormat(currentDate)
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)
      return { bucketKey, nextDate }
    }
    
    case '3day': {
      const bucketKey = dateFormat(currentDate)
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 3)
      return { bucketKey, nextDate }
    }
    
    case 'weekly': {
      const weekStart = getStartOfWeek(currentDate)
      const bucketKey = dateFormat(weekStart)
      const nextDate = new Date(weekStart)
      nextDate.setDate(nextDate.getDate() + 7)
      return { bucketKey, nextDate }
    }
    
    case 'biweekly': {
      const weekStart = getStartOfWeek(currentDate)
      const weeksSinceEpoch = Math.floor(weekStart.getTime() / (1000 * 60 * 60 * 24 * 7))
      const biweekStart = new Date(weekStart)
      biweekStart.setDate(weekStart.getDate() - (weeksSinceEpoch % 2) * 7)
      const bucketKey = dateFormat(biweekStart)
      const nextDate = new Date(biweekStart)
      nextDate.setDate(nextDate.getDate() + 14)
      return { bucketKey, nextDate }
    }
    
    case 'monthly': {
      const monthStart = getStartOfMonth(currentDate)
      const bucketKey = dateFormat(monthStart)
      const nextDate = new Date(monthStart)
      nextDate.setMonth(nextDate.getMonth() + 1)
      return { bucketKey, nextDate }
    }
    
    case 'yearly': {
      const yearStart = getStartOfYear(currentDate)
      const bucketKey = dateFormat(yearStart)
      const nextDate = new Date(yearStart)
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      return { bucketKey, nextDate }
    }
  }
}

/**
 * Get the bucket key for an event date based on interval
 */
function getEventBucketKey(
  eventDate: Date,
  interval: Interval,
  dateFormat: (date: Date) => string,
  periodStart: Date
): string {
  switch (interval) {
    case 'daily':
      return dateFormat(eventDate)
    
    case '3day': {
      // Round to nearest 3-day interval (every 3 days starting from period start)
      const daysSinceStart = getDaysBetween(periodStart, eventDate)
      const intervalIndex = Math.floor(daysSinceStart / 3)
      const intervalStart = new Date(periodStart)
      intervalStart.setDate(periodStart.getDate() + (intervalIndex * 3))
      return dateFormat(intervalStart)
    }
    
    case 'weekly': {
      const weekStart = getStartOfWeek(eventDate)
      return dateFormat(weekStart)
    }
    
    case 'biweekly': {
      const weekStart = getStartOfWeek(eventDate)
      const weeksSinceEpoch = Math.floor(weekStart.getTime() / (1000 * 60 * 60 * 24 * 7))
      const biweekStart = new Date(weekStart)
      biweekStart.setDate(weekStart.getDate() - (weeksSinceEpoch % 2) * 7)
      return dateFormat(biweekStart)
    }
    
    case 'monthly': {
      const monthStart = getStartOfMonth(eventDate)
      return dateFormat(monthStart)
    }
    
    case 'yearly': {
      const yearStart = getStartOfYear(eventDate)
      return dateFormat(yearStart)
    }
  }
}
