import { serverSupabaseClient } from '#supabase/server'
import type { RecurringEvent } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Verify this is a legitimate cron request
    const authHeader = getHeader(event, 'authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const client = await serverSupabaseClient(event)
    const now = new Date()
    
    // Get all active recurring events
    const { data: recurringEvents, error: recurringEventsError } = await client
      .from('recurring_events')
      .select('*')
      .eq('active', true) as { data: RecurringEvent[] | null, error: any }

    if (recurringEventsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch recurring events'
      })
    }

    if (!recurringEvents || recurringEvents.length === 0) {
      return {
        success: true,
        message: 'No active recurring events found',
        processedCount: 0,
        createdEvents: [],
        timestamp: now.toISOString()
      }
    }

    const createdEvents = []
    const errors = []

    // Process each recurring event
    for (const recurringEvent of recurringEvents) {
      try {
        // Calculate schedule interval in milliseconds
        const scheduleIntervalMs = calculateIntervalMs(
          recurringEvent.schedule_interval_amount,
          recurringEvent.schedule_interval_unit
        )

        // Calculate the target date (now + schedule_interval)
        const targetDate = new Date(now.getTime() + scheduleIntervalMs)

        // Get the last created event for this recurring event to determine the base date
        // Note: We check by merchant and matching start time pattern since recurring_event_id may not exist
        const { data: lastEvent } = await client
          .from('events')
          .select('start')
          .eq('merchant', recurringEvent.merchant)
          .gte('start', recurringEvent.first_event_start)
          .order('start', { ascending: false })
          .limit(1)
          .single() as { data: { start: string } | null, error: any }

        // Use last event start as base, or first_event_start if no events exist yet
        const baseDate = lastEvent?.start 
          ? new Date(lastEvent.start)
          : new Date(recurringEvent.first_event_start)

        // Calculate next event dates based on recurrence pattern
        const nextEventDates = calculateNextEventDates(
          recurringEvent,
          baseDate,
          targetDate
        )

        // Create events for dates that don't already exist
        for (const eventDate of nextEventDates) {
          // Check if event already exists for this date
          const eventStart = new Date(eventDate)
          const eventEnd = new Date(eventDate)
          
          // Set the time from first_event_start and first_event_end
          const firstStart = new Date(recurringEvent.first_event_start)
          const firstEnd = new Date(recurringEvent.first_event_end)
          
          eventStart.setHours(firstStart.getHours(), firstStart.getMinutes(), 0, 0)
          eventEnd.setHours(firstEnd.getHours(), firstEnd.getMinutes(), 0, 0)

          // Check if event already exists (within 1 hour window to account for time differences)
          const { data: existingEvent } = await client
            .from('events')
            .select('id')
            .eq('merchant', recurringEvent.merchant)
            .gte('start', new Date(eventStart.getTime() - 60 * 60 * 1000).toISOString())
            .lte('start', new Date(eventStart.getTime() + 60 * 60 * 1000).toISOString())
            .limit(1)
            .single()

          if (existingEvent) {
            continue // Event already exists, skip
          }

          // Check if event date is past the recurrence end date
          if (recurringEvent.recurrence_end_date) {
            const endDate = new Date(recurringEvent.recurrence_end_date)
            if (eventStart > endDate) {
              continue // Past end date, skip
            }
          }

          // Create the event
          const { data: newEvent, error: createError } = await client
            .from('events')
            .insert({
              merchant: recurringEvent.merchant,
              start: eventStart.toISOString(),
              end: eventEnd.toISOString(),
              location_coordinates: recurringEvent.location_coordinates,
              location_address: recurringEvent.location_address,
              location_url: recurringEvent.location_url,
              event_value: recurringEvent.event_value,
              notes: recurringEvent.notes,
              status: 'open',
              payment_status: 'pending'
            } as any)
            .select()
            .single() as { data: { id: string } | null, error: any }

          if (createError || !newEvent) {
            errors.push(`Failed to create event for recurring event ${recurringEvent.id}: ${createError?.message || 'Unknown error'}`)
            continue
          }

          // Create timeline item
          await client
            .from('timeline_items')
            .insert({
              id: crypto.randomUUID(),
              owner_id: recurringEvent.merchant,
              other_ids: [newEvent.id, recurringEvent.id],
              title: 'Event Created from Recurring Schedule',
              description: `Event automatically created from recurring schedule for ${eventStart.toLocaleDateString()} at ${eventStart.toLocaleTimeString()}`,
              type: 'event_created',
              created_at: new Date().toISOString()
            } as any)

          createdEvents.push({
            eventId: newEvent.id,
            recurringEventId: recurringEvent.id,
            start: eventStart.toISOString(),
            end: eventEnd.toISOString()
          })
        }

      } catch (error: any) {
        console.error(`Error processing recurring event ${recurringEvent.id}:`, error)
        errors.push(`Error processing recurring event ${recurringEvent.id}: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Processed ${recurringEvents.length} recurring events, created ${createdEvents.length} new events`,
      processedCount: recurringEvents.length,
      createdEventsCount: createdEvents.length,
      createdEvents,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    }

  } catch (error: any) {
    console.error('Cron job error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to process recurring events'
    })
  }
})

/**
 * Calculate interval in milliseconds based on amount and unit
 */
function calculateIntervalMs(amount: number, unit: 'days' | 'weeks' | 'months'): number {
  const dayMs = 24 * 60 * 60 * 1000
  const weekMs = 7 * dayMs
  const monthMs = 30 * dayMs // Approximate month as 30 days

  switch (unit) {
    case 'days':
      return amount * dayMs
    case 'weeks':
      return amount * weekMs
    case 'months':
      return amount * monthMs
    default:
      return amount * dayMs
  }
}

/**
 * Calculate next event dates based on recurrence pattern
 */
function calculateNextEventDates(
  recurringEvent: any,
  baseDate: Date,
  targetDate: Date
): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(baseDate)

  // Move to the next occurrence after base date
  if (recurringEvent.recurrence_type === 'daily') {
    // Add recurrence_interval days
    currentDate.setDate(currentDate.getDate() + recurringEvent.recurrence_interval)
  } else if (recurringEvent.recurrence_type === 'weekly') {
    // Move to next week
    currentDate.setDate(currentDate.getDate() + (7 * recurringEvent.recurrence_interval))
    
    // If specific days of week are specified, adjust to those days
    if (recurringEvent.recurrence_days_of_week && recurringEvent.recurrence_days_of_week.length > 0) {
      // Find the next occurrence of any of the specified days
      const targetDays = recurringEvent.recurrence_days_of_week
      let found = false
      let attempts = 0
      
      while (!found && attempts < 14) {
        const dayOfWeek = currentDate.getDay()
        if (targetDays.includes(dayOfWeek)) {
          found = true
        } else {
          currentDate.setDate(currentDate.getDate() + 1)
          attempts++
        }
      }
    } else if (recurringEvent.recurrence_day_of_week !== null) {
      // Move to the specific day of week
      const targetDay = recurringEvent.recurrence_day_of_week
      const currentDay = currentDate.getDay()
      let daysToAdd = (targetDay - currentDay + 7) % 7
      if (daysToAdd === 0) {
        daysToAdd = 7 * recurringEvent.recurrence_interval
      }
      currentDate.setDate(currentDate.getDate() + daysToAdd)
    }
  } else if (recurringEvent.recurrence_type === 'monthly') {
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + recurringEvent.recurrence_interval)
    
    // Adjust to the specific day of month
    if (recurringEvent.recurrence_day_of_month !== null) {
      if (recurringEvent.recurrence_day_of_month === -1) {
        // Last day of month
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        currentDate.setDate(lastDay)
      } else if (recurringEvent.recurrence_day_of_month === 1) {
        // First day of month
        currentDate.setDate(1)
      } else {
        // Specific day of month
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        const targetDay = Math.min(recurringEvent.recurrence_day_of_month, lastDay)
        currentDate.setDate(targetDay)
      }
    }
  }

  // Generate dates until we reach or exceed the target date
  while (currentDate <= targetDate) {
    // Check if we've passed the recurrence end date
    if (recurringEvent.recurrence_end_date) {
      const endDate = new Date(recurringEvent.recurrence_end_date)
      if (currentDate > endDate) {
        break
      }
    }

    dates.push(new Date(currentDate))

    // Calculate next occurrence
    if (recurringEvent.recurrence_type === 'daily') {
      currentDate.setDate(currentDate.getDate() + recurringEvent.recurrence_interval)
    } else if (recurringEvent.recurrence_type === 'weekly') {
      if (recurringEvent.recurrence_days_of_week && recurringEvent.recurrence_days_of_week.length > 0) {
        // Find next day in the list
        const targetDays = recurringEvent.recurrence_days_of_week.sort((a: number, b: number) => a - b)
        const currentDay = currentDate.getDay()
        const nextDayIndex = targetDays.findIndex((day: number) => day > currentDay)
        
        if (nextDayIndex !== -1) {
          // Next day is in the same week
          const daysToAdd = targetDays[nextDayIndex] - currentDay
          currentDate.setDate(currentDate.getDate() + daysToAdd)
        } else {
          // Move to next week and use first day
          const daysToAdd = 7 - currentDay + targetDays[0] + (7 * (recurringEvent.recurrence_interval - 1))
          currentDate.setDate(currentDate.getDate() + daysToAdd)
        }
      } else {
        currentDate.setDate(currentDate.getDate() + (7 * recurringEvent.recurrence_interval))
      }
    } else if (recurringEvent.recurrence_type === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + recurringEvent.recurrence_interval)
      
      // Adjust to the specific day of month
      if (recurringEvent.recurrence_day_of_month !== null) {
        if (recurringEvent.recurrence_day_of_month === -1) {
          const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
          currentDate.setDate(lastDay)
        } else if (recurringEvent.recurrence_day_of_month === 1) {
          currentDate.setDate(1)
        } else {
          const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
          const targetDay = Math.min(recurringEvent.recurrence_day_of_month, lastDay)
          currentDate.setDate(targetDay)
        }
      }
    }
  }

  return dates
}

