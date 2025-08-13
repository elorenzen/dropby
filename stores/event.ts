import { defineStore } from 'pinia'
import type { Event, TimelineItem } from '~/types'

export const useEventStore = defineStore('event', {
  state: () => ({
    eventsById: [] as Event[],
    allEvents: [] as Event[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getAllEvents: (state) => state.allEvents,
    getAllOpenEvents: (state) => {
      return state.allEvents
        .filter((e) =>
          e.status == 'open' &&
          (Date.now() < new Date(e.start).getTime())
        )
        .sort((a,b) => Date.parse(b.start) - Date.parse(b.start))
    },
    getAllOpenEventsForVendors: (state) => {
      return state.allEvents
        .filter((e) =>
          e.status == 'open' &&
          (Date.now() < new Date(e.start).getTime())
        )
        .sort((a,b) => Date.parse(a.start) - Date.parse(b.start))
    }
  },
  
  actions: {
    async setAllEvents(events: Event[]) {
      this.allEvents = events
    },
    
    async getEventsByMerchantId(id: string) {
      return this.allEvents
        .filter(e => e.merchant === id)
        .sort((a,b) => Date.parse(b.start) - Date.parse(b.start))
    },
    
    async getBookedEventsByVendorId(id: string) {
      return this.allEvents
        .filter(e => e.vendor === id && e.status === 'booked')
        .sort((a,b) => Date.parse(b.start) - Date.parse(b.start))
    },
    
    async getPendingEventsByVendorId(id: string) {
      return this.allEvents
        .filter(e => e.pending_requests && e.pending_requests.includes(id) && e.status === 'open')
        .sort((a,b) => Date.parse(a.start) - Date.parse(b.start))
    },

    async createEvent(eventData: Partial<Event>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('events')
          .insert(eventData as any)
          .select()
          .single()

        if (error) throw error

        // Add to local state
        this.allEvents.push(data)
        
        // Create timeline item for event creation
        if (data.merchant) {
          const timelineStore = useTimelineStore()
          await timelineStore.createTimelineItem({
            owner_id: data.merchant,
            other_ids: [data.id],
            title: 'Event Created',
            description: `New event scheduled for ${new Date(data.start).toLocaleDateString()} at ${new Date(data.start).toLocaleTimeString()}`,
            type: 'event_created'
          })
        }
        
        return data
      } catch (error) {
        console.error('Error creating event:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateEvent(eventId: string, updates: Partial<Event>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('events')
          .update(updates as any)
          .eq('id', eventId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.allEvents.findIndex(e => e.id === eventId)
        if (index !== -1) {
          this.allEvents[index] = { ...this.allEvents[index], ...data }
        }
        
        // Create timeline items for status changes
        const timelineStore = useTimelineStore()
        const originalEvent = this.allEvents[index]
        
        if (originalEvent && updates.status && updates.status !== originalEvent.status) {
          switch (updates.status) {
            case 'booked':
              if (updates.vendor && originalEvent.vendor !== updates.vendor) {
                await timelineStore.createTimelineItem({
                  owner_id: updates.vendor,
                  other_ids: [eventId],
                  title: 'Event Confirmed',
                  description: `Confirmed for event on ${new Date(data.start).toLocaleDateString()}`,
                  type: 'vendor_booked'
                })
              }
              break
            case 'completed':
              if (data.merchant && data.vendor) {
                // Create timeline items for both merchant and vendor
                await Promise.all([
                  timelineStore.createTimelineItem({
                    owner_id: data.merchant,
                    other_ids: [eventId, data.vendor],
                    title: 'Event Completed',
                    description: `Event completed successfully on ${new Date(data.start).toLocaleDateString()}`,
                    type: 'event_completed'
                  }),
                  timelineStore.createTimelineItem({
                    owner_id: data.vendor,
                    other_ids: [eventId, data.merchant],
                    title: 'Event Completed',
                    description: `Event completed successfully on ${new Date(data.start).toLocaleDateString()}`,
                    type: 'event_completed'
                  })
                ])
              }
              break
            case 'cancelled':
              // Create timeline items for merchant and vendor if exists
              const timelineItems = [
                timelineStore.createTimelineItem({
                  owner_id: data.merchant || '',
                  other_ids: [eventId],
                  title: 'Event Cancelled',
                  description: `Event cancelled for ${new Date(data.start).toLocaleDateString()}`,
                  type: 'event_cancelled'
                })
              ]

              if (data.vendor) {
                timelineItems.push(
                  timelineStore.createTimelineItem({
                    owner_id: data.vendor,
                    other_ids: [eventId],
                    title: 'Event Cancelled',
                    description: `Event cancelled for ${new Date(data.start).toLocaleDateString()}`,
                    type: 'event_cancelled'
                  })
                )
              }

              await Promise.all(timelineItems)
              break
          }
        }
        
        return data
      } catch (error) {
        console.error('Error updating event:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteEvent(eventId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)

        if (error) throw error

        // Remove from local state
        this.allEvents = this.allEvents.filter(e => e.id !== eventId)
        
        return true
      } catch (error) {
        console.error('Error deleting event:', error)
        throw error
      }
    },

    async createTimelineItem(timelineData: Partial<TimelineItem>) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('timeline_items')
          .insert(timelineData as any)
          .select()
          .single()

        if (error) throw error
        
        return data
      } catch (error) {
        console.error('Error creating timeline item:', error)
        throw error
      }
    },

    async loadEvents() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.allEvents = data || []
        return data
      } catch (error) {
        console.error('Error loading events:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
