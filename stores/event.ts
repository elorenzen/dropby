import { defineStore } from 'pinia'
import type { Event, TimelineItem } from '~/types'
import { usageService } from '~/services/api/usageService'

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
    getEventsByMerchantId: (state) => {
      return (merchantId: string) => {
        return state.allEvents
          .filter(e => e.merchant === merchantId)
          .sort((a, b) => Date.parse(b.start) - Date.parse(a.start))
      }
    },
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
    },

    getEventProp: (state) => (eventId: string, prop: string): string => {
      if (!eventId) return ''
      const event = state.allEvents.find((e: Event) => e.id === eventId)
      return (event?.[prop as keyof typeof event] as string) || ''
    },

    getEventsForAnalytics: (state) => (businessId: string, businessType: 'merchant' | 'vendor', filters?: { status?: string[], dateRange?: { start: string, end: string } }) => {
      let filtered = state.allEvents.filter((e: Event) => {
        if (businessType === 'merchant') {
          return e.merchant === businessId
        } else {
          return e.vendor === businessId || (e.pending_requests && e.pending_requests.includes(businessId))
        }
      })

      if (filters?.status && filters.status.length > 0) {
        filtered = filtered.filter((e: Event) => filters.status!.includes(e.status))
      }

      if (filters?.dateRange) {
        filtered = filtered.filter((e: Event) => {
          const eventDate = new Date(e.start)
          const startDate = new Date(filters.dateRange!.start)
          const endDate = new Date(filters.dateRange!.end)
          return eventDate >= startDate && eventDate <= endDate
        })
      }

      return filtered.sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    },

    getEventsForProfile: (state) => (businessId: string, businessType: 'merchant' | 'vendor') => {
      return state.allEvents
        .filter((e: Event) => {
          if (businessType === 'merchant') {
            return e.merchant === businessId
          } else {
            return e.vendor === businessId
          }
        })
        .sort((a, b) => Date.parse(b.start) - Date.parse(a.start))
    }
  },
  
  actions: {
    async setAllEvents(events: Event[]) {
      this.allEvents = events
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
    },

    async requestEvent(eventId: string, vendorId: string, options?: { sendEmail?: boolean }) {
      try {
        // Check usage limit before allowing request
        const usageCheck = await usageService.check({
          businessId: vendorId,
          businessType: 'vendor',
          usageType: 'requests',
          requiredAmount: 1
        })

        if (!usageCheck.allowed) {
          return {
            success: false,
            error: 'usage_limit',
            usageLimit: usageCheck.usageLimit
          }
        }

        // Get the event
        const event = this.allEvents.find(e => e.id === eventId)
        if (!event) {
          throw new Error('Event not found')
        }

        // Add vendor to pending_requests
        const currentRequests = event.pending_requests || []
        if (currentRequests.includes(vendorId)) {
          return {
            success: false,
            error: 'already_requested'
          }
        }

        const updatedRequests = [...currentRequests, vendorId]
        
        // Update event
        await this.updateEvent(eventId, {
          updated_at: new Date().toISOString(),
          pending_requests: updatedRequests
        })

        // Increment usage after successful request
        await usageService.increment({
          businessId: vendorId,
          businessType: 'vendor',
          usageType: 'requests',
          incrementAmount: 1
        })

        // Create notification for merchant
        const userStore = useUserStore()
        const vendorStore = useVendorStore()
        const notificationStore = useNotificationStore()
        const currentUser = useSupabaseUser()
        
        const merchantUserIds = await userStore.getUserIdsFromBusiness(event.merchant || '', 'merchant')
        const vendorData = await vendorStore.getVendorById(vendorId)
        
        for (const merchantUserId of merchantUserIds) {
          try {
            await notificationStore.createNotification({
              recipient_id: merchantUserId,
              sender_id: currentUser.value?.id || null,
              sender_business_id: vendorId,
              sender_business_type: 'vendor',
              action_type: 'event_request_sent',
              entity_type: 'event',
              entity_id: eventId,
              title: 'New Event Request',
              message: `${vendorData?.vendor_name || 'A vendor'} requested to work your event on ${new Date(event.start).toLocaleDateString()}`,
              metadata: {
                event_id: eventId,
                vendor_id: vendorId,
                vendor_name: vendorData?.vendor_name,
                event_date: event.start
              }
            })
          } catch (notifError) {
            console.error('Failed to create notification for merchant user:', merchantUserId, notifError)
          }
        }

        // Send email notification if requested
        if (options?.sendEmail && event.merchant) {
          try {
            await $fetch(`/api/sendEventRequestNotification?eventId=${eventId}&vendorId=${vendorId}&merchantId=${event.merchant}`)
          } catch (emailErr) {
            console.error('Email notification failed:', emailErr)
          }
        }

        return {
          success: true,
          event: this.allEvents.find(e => e.id === eventId)
        }
      } catch (error: any) {
        console.error('Error requesting event:', error)
        return {
          success: false,
          error: 'unknown',
          message: error.message || 'Failed to request event'
        }
      }
    },

    async withdrawRequest(eventId: string, vendorId: string) {
      try {
        // Get the event
        const event = this.allEvents.find(e => e.id === eventId)
        if (!event) {
          throw new Error('Event not found')
        }

        // Remove vendor from pending_requests
        const currentRequests = event.pending_requests || []
        const updatedRequests = currentRequests.filter((id: string) => id !== vendorId)
        
        // Update event
        await this.updateEvent(eventId, {
          updated_at: new Date().toISOString(),
          pending_requests: updatedRequests
        })

        return {
          success: true,
          event: this.allEvents.find(e => e.id === eventId)
        }
      } catch (error: any) {
        console.error('Error withdrawing request:', error)
        return {
          success: false,
          error: 'unknown',
          message: error.message || 'Failed to withdraw request'
        }
      }
    }
  }
})
