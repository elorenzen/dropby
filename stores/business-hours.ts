import { defineStore } from 'pinia'

export interface BusinessHour {
  id: string
  business_id: string
  business_type: 'merchant' | 'vendor'
  day_of_week: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  open_time: string | null // TIME format 'HH:MM:SS'
  close_time: string | null // TIME format 'HH:MM:SS'
  is_closed: boolean
  created_at: string
  updated_at: string
}

export interface BusinessHoursByDay {
  [dayOfWeek: number]: {
    open: string | null
    close: string | null
    isClosed: boolean
  }
}

export const useBusinessHoursStore = defineStore('businessHours', {
  state: () => ({
    allBusinessHours: [] as BusinessHour[],
    loading: false
  }),

  getters: {
    /**
     * Get all business hours for a specific business
     */
    getBusinessHours: (state) => (businessId: string, businessType: 'merchant' | 'vendor'): BusinessHour[] => {
      return state.allBusinessHours.filter(
        bh => bh.business_id === businessId && bh.business_type === businessType
      )
    },

    /**
     * Get open/close time for a specific day
     * Returns formatted time string (HH:MM) or default if not found
     */
    getBusinessHour: (state) => (businessId: string, businessType: 'merchant' | 'vendor', dayOfWeek: number, type: 'open' | 'close'): string => {
      const hour = state.allBusinessHours.find(
        bh => bh.business_id === businessId 
          && bh.business_type === businessType 
          && bh.day_of_week === dayOfWeek
      )

      if (!hour || hour.is_closed) {
        // Default to 9am-5pm if closed or not found
        return type === 'open' ? '09:00' : '17:00'
      }

      const time = type === 'open' ? hour.open_time : hour.close_time
      if (!time) {
        return type === 'open' ? '09:00' : '17:00'
      }

      // Convert TIME format (HH:MM:SS) to HH:MM
      return time.substring(0, 5)
    }
  },

  actions: {
    /**
     * Set all business hours in state
     * Accepts data array from database query
     */
    setBusinessHours(data: BusinessHour[] | null) {
      this.allBusinessHours = data || []
    },

    /**
     * Load business hours from database
     */
    async loadBusinessHours(businessId: string, businessType: 'merchant' | 'vendor') {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', businessId)
          .eq('business_type', businessType)
          .order('day_of_week', { ascending: true })

        if (error) throw error
        
        // Update state - merge with existing to avoid duplicates
        const existing = this.allBusinessHours.filter(
          bh => !(bh.business_id === businessId && bh.business_type === businessType)
        )
        this.allBusinessHours = [...existing, ...(data || [])]
        
        return data || []
      } catch (error) {
        console.error('Error loading business hours:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update business hours (upsert operation)
     */
    async updateBusinessHours(businessId: string, businessType: 'merchant' | 'vendor', hours: Array<{
      dayOfWeek: number
      open: string | null
      close: string | null
      isClosed: boolean
    }>) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        // Format time for database (HH:MM:SS)
        const formatTimeForDatabase = (time: string | null): string | null => {
          if (!time) return null
          if (typeof time === 'string' && time.includes(':')) {
            // If already in HH:MM format, add seconds
            if (time.split(':').length === 2) {
              return `${time}:00`
            }
            return time
          }
          return null
        }
        
        // Upsert each day's hours
        for (const day of hours) {
          const isClosed = day.isClosed || (!day.open && !day.close)
          
          const { error } = await supabase
            .from('business_hours')
            .upsert({
              business_id: businessId,
              business_type: businessType,
              day_of_week: day.dayOfWeek,
              open_time: formatTimeForDatabase(day.open),
              close_time: formatTimeForDatabase(day.close),
              is_closed: isClosed,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'business_id,business_type,day_of_week'
            })
          
          if (error) throw error
        }
        
        // Reload to update local state
        await this.loadBusinessHours(businessId, businessType)
        
        return true
      } catch (error) {
        console.error('Error updating business hours:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

