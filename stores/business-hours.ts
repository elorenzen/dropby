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
    }
  }
})

