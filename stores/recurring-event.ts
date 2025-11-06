import { defineStore } from 'pinia'
import type { RecurringEvent } from '~/types'

export const useRecurringEventStore = defineStore('recurringEvent', {
  state: () => ({
    allRecurringEvents: [] as RecurringEvent[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getAllRecurringEvents: (state) => state.allRecurringEvents,
    getActiveRecurringEvents: (state) => {
      return state.allRecurringEvents
        .filter((e) => e.active === true)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    },
    getRecurringEventsByMerchantId: (state) => {
      return (merchantId: string) => {
        return state.allRecurringEvents
          .filter((e) => e.merchant === merchantId)
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      }
    },
    getActiveRecurringEventsByMerchantId: (state) => {
      return (merchantId: string) => {
        return state.allRecurringEvents
          .filter((e) => e.merchant === merchantId && e.active === true)
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      }
    }
  },
  
  actions: {
    async setAllRecurringEvents(recurringEvents: RecurringEvent[]) {
      this.allRecurringEvents = recurringEvents
    },
    
    async setAllRecurringEventsByMerchantId(merchantId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('recurring_events')
          .select('*')
          .eq('merchant', merchantId)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Remove existing events for this merchant, then add new ones
        this.allRecurringEvents = [
          ...this.allRecurringEvents.filter((e) => e.merchant !== merchantId),
          ...(data || [])
        ]
        
        return data
      } catch (error) {
        console.error('Error fetching recurring events by merchant:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRecurringEvent(recurringEventData: Partial<RecurringEvent>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('recurring_events')
          .insert(recurringEventData as any)
          .select()
          .single()

        if (error) throw error

        // Add to local state
        this.allRecurringEvents.push(data)
        
        return data
      } catch (error) {
        console.error('Error creating recurring event:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateRecurringEvent(recurringEventId: string, updates: Partial<RecurringEvent>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('recurring_events')
          .update(updates as any)
          .eq('id', recurringEventId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.allRecurringEvents.findIndex(e => e.id === recurringEventId)
        if (index !== -1 && data) {
          this.allRecurringEvents[index] = data as RecurringEvent
        }
        
        return data
      } catch (error) {
        console.error('Error updating recurring event:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteRecurringEvent(recurringEventId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('recurring_events')
          .delete()
          .eq('id', recurringEventId)

        if (error) throw error

        // Remove from local state
        this.allRecurringEvents = this.allRecurringEvents.filter(e => e.id !== recurringEventId)
        
        return true
      } catch (error) {
        console.error('Error deleting recurring event:', error)
        throw error
      }
    },

    async loadRecurringEvents() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('recurring_events')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.allRecurringEvents = data || []
        return data
      } catch (error) {
        console.error('Error loading recurring events:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadRecurringEventsByMerchantId(merchantId: string) {
      return await this.setAllRecurringEventsByMerchantId(merchantId)
    }
  }
})

