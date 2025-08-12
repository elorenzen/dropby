import { defineStore } from 'pinia'

export interface Event {
  id: string
  created_at: string
  vendor: string | null
  merchant: string | null
  start: string
  end: string
  location_coordinates: string
  status: string
  vendor_rating: number | null
  merchant_rating: number | null
  vendor_comment: string | null
  merchant_comment: string | null
  updated_at: string
  pending_requests: any[]
  location_url: string | null
  location_address: string | null
  notes: string | null
  day_id: string | null
  event_value: number | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_id: string | null
}

export interface TimelineItem {
  id: string
  created_at: string
  owner_id: string
  other_ids: any[]
  title: string
  description: string | null
  type: string
}

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
