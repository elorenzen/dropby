import { defineStore } from 'pinia'
import type { Vendor } from '~/types'
import { addDays } from '~/utils/dates'
import { calculateGrowthMetrics, filterEventsByPeriod, calculateRateMetrics, calculateRelationshipMetrics } from '~/utils/analytics'

export const useVendorStore = defineStore('vendor', {
  state: () => ({
    allVendors: [] as Vendor[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getAllVendors: (state) => state.allVendors,
    
    // Additional computed properties
    getVerifiedVendors: (state) => {
      return state.allVendors.filter(vendor => vendor.compliance_verified)
    },
    
    getVendorsByCuisine: (state) => (cuisineType: string) => {
      return state.allVendors.filter(vendor => vendor.cuisine.includes(cuisineType))
    },
    
    getTopRatedVendors: (state) => (limit: number = 10) => {
      return state.allVendors
        .filter(vendor => vendor.average_merchant_rating > 0)
        .sort((a, b) => b.average_merchant_rating - a.average_merchant_rating)
        .slice(0, limit)
    },

    getVendorProp: (state) => (vendorId: string, prop: string): string => {
      if (!vendorId) return ''
      const vendor = state.allVendors.find((v: Vendor) => v.id === vendorId)
      return (vendor?.[prop as keyof typeof vendor] as string) || ''
    },
    vendorById: (state) => (id: string) => state.allVendors.find((v: Vendor) => v.id === id)
  },
  
  actions: {
    async setAllVendors(vendors: Vendor[]) {
      this.allVendors = vendors
    },
    
    async getVendorById(id: string) {
      return this.vendorById(id)
    },

    async createVendor(vendorData: Partial<Vendor>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .insert(vendorData as any)
          .select()
          .single()

        if (error) throw error

        this.allVendors.push(data)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.id,
          other_ids: [data.id],
          title: 'Vendor Created',
          description: `New vendor account created: ${data.vendor_name}`,
          type: 'vendor_created'
        })
        
        return data
      } catch (error) {
        console.error('Error creating vendor:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateVendor(vendorId: string, updates: Partial<Vendor>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .update(updates as any)
          .eq('id', vendorId)
          .select()
          .single()

        if (error) throw error

        const index = this.allVendors.findIndex(vendor => vendor.id === vendorId)
        if (index !== -1) {
          this.allVendors[index] = { ...this.allVendors[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating vendor:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteVendor(vendorId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('vendors')
          .delete()
          .eq('id', vendorId)

        if (error) throw error

        this.allVendors = this.allVendors.filter(vendor => vendor.id !== vendorId)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: vendorId,
          other_ids: [vendorId],
          title: 'Vendor Deleted',
          description: `Vendor account deleted`,
          type: 'vendor_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting vendor:', error)
        throw error
      }
    },

    async loadVendors() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.allVendors = data || []
        return data
      } catch (error) {
        console.error('Error loading vendors:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateComplianceStatus(vendorId: string, verified: boolean, score: number) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .update({ 
            compliance_verified: verified, 
            compliance_score: score,
            updated_at: new Date().toISOString() 
          } as any)
          .eq('id', vendorId)
          .select()
          .single()

        if (error) throw error

        const index = this.allVendors.findIndex(vendor => vendor.id === vendorId)
        if (index !== -1) {
          this.allVendors[index] = { ...this.allVendors[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating compliance status:', error)
        throw error
      }
    },

    async updateVendorRating(vendorId: string, newRating: number) {
      try {
        const vendor = this.allVendors.find(v => v.id === vendorId)
        if (!vendor) throw new Error('Vendor not found')

        const currentTotal = vendor.average_merchant_rating * vendor.total_events
        const newTotal = currentTotal + newRating
        const newTotalEvents = vendor.total_events + 1
        const newAverage = newTotal / newTotalEvents

        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .update({ 
            average_merchant_rating: Math.round(newAverage * 10) / 10,
            total_events: newTotalEvents,
            updated_at: new Date().toISOString() 
          } as any)
          .eq('id', vendorId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.allVendors.findIndex(v => v.id === vendorId)
        if (index !== -1) {
          this.allVendors[index] = { ...this.allVendors[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating vendor rating:', error)
        throw error
      }
    },

    async getDashboardMetrics(vendorId: string) {
      try {
        const eventStore = useEventStore()
        const reviewStore = useReviewStore()
        const { usageService } = await import('~/services/api/usageService')
        
        // Ensure events are loaded
        if (eventStore.allEvents.length === 0) {
          await eventStore.loadEvents()
        }
        
        const events = eventStore.allEvents.filter((e: any) => e.vendor === vendorId)
        const now = new Date()
        const nextWeek = addDays(now, 7)
        
        // Only count booked events (those with a merchant)
        const bookedEvents = events.filter((e: any) => e.merchant && e.status === 'booked')
        const totalEvents = bookedEvents.length
        const upcomingEvents = bookedEvents.filter((e: any) => new Date(e.start) > now).length
        
        // Get all events where this vendor has pending requests
        const allEvents = eventStore.allEvents
        
        // Calculate pending requests for future events with open status that have pending requests
        const futureOpenEventsWithRequests = allEvents?.filter((e: any) => 
          e.status === 'open' && 
          new Date(e.start) > now && 
          e.pending_requests && 
          e.pending_requests.includes(vendorId)
        ) || []
        const pendingRequests = futureOpenEventsWithRequests.length
        
        // Calculate upcoming events in next 7 days
        const upcomingWeek = bookedEvents.filter((e: any) => {
          const startDate = new Date(e.start)
          return startDate >= now && startDate <= nextWeek
        }).length
        
        // Calculate events growth using utility
        const growthMetrics = calculateGrowthMetrics(bookedEvents, 'created_at')
        
        // Ensure reviews are loaded, then use review store method instead of recalculating
        // Note: Reviews should already be loaded by the dashboard page, but ensure they're available
        const reviews = reviewStore.getReviewsForBusiness(vendorId)
        const averageRating = reviews.length > 0 
          ? reviewStore.getAverageRatingForBusiness(vendorId)
          : 0
        const totalRatings = reviews.length
        
        // Load usage data and subscription info
        let usage = {
          currentRequests: 0,
          maxRequests: 5,
          remainingRequests: 5
        }
        let subscription = null
        
        try {
          const usageCheck = await usageService.check({
            businessId: vendorId,
            businessType: 'vendor',
            usageType: 'requests',
            requiredAmount: 0
          })

          usage.currentRequests = usageCheck.currentUsage || 0
          usage.maxRequests = usageCheck.usageLimit || 5
          usage.remainingRequests = Math.max(0, usage.maxRequests - usage.currentRequests)
          subscription = usageCheck.subscription || null
        } catch (usageError) {
          console.error('Error loading usage data:', usageError)
        }
        
        return {
          totalEvents,
          eventsGrowth: growthMetrics.growth,
          upcomingEvents,
          upcomingWeek,
          pendingRequests,
          averageRating,
          totalRatings,
          usage,
          subscription
        }
      } catch (error) {
        console.error('Error loading vendor dashboard metrics:', error)
        throw error
      }
    },

    async getAnalyticsMetrics(vendorId: string, period: string) {
      try {
        const eventStore = useEventStore()
        
        // Ensure events are loaded
        if (eventStore.allEvents.length === 0) {
          await eventStore.loadEvents()
        }

        // Get all events where this vendor has pending requests OR is booked
        const allEvents = eventStore.getEventsForAnalytics(vendorId, 'vendor')

        if (!allEvents || allEvents.length === 0) {
          return {
            metrics: {
              acceptanceRate: 0,
              totalBookings: 0,
              pendingRequests: 0,
              uniqueMerchants: 0,
              repeatMerchants: 0,
              avgBookingsPerMerchant: 0
            },
            acceptedEvents: [],
            pendingRequests: [],
            periodEvents: [],
            merchantCounts: {}
          }
        }

        // Filter events by period using utility
        const periodEvents = filterEventsByPeriod(allEvents, period, 'start')

        // Get all events for this vendor (matches past events page logic - all events where vendor is assigned)
        const acceptedEvents = periodEvents.filter((event: any) => 
          event.vendor === vendorId
        )

        // Get requests that vendor made (vendor_id in pending_requests array)
        const pendingRequests = periodEvents.filter((event: any) => 
          event.pending_requests && 
          Array.isArray(event.pending_requests) && 
          event.pending_requests.includes(vendorId)
        )

        // Process metrics using utilities
        const totalBookings = acceptedEvents.length
        const pendingRequestsCount = pendingRequests.length
        const acceptanceRate = calculateRateMetrics(totalBookings, pendingRequestsCount)

        // Calculate merchant relationship metrics using utility
        const relationshipMetrics = calculateRelationshipMetrics(acceptedEvents, 'merchant')

        return {
          metrics: {
            acceptanceRate,
            totalBookings,
            pendingRequests: pendingRequestsCount,
            uniqueMerchants: relationshipMetrics.uniquePartners,
            repeatMerchants: relationshipMetrics.repeatPartners,
            avgBookingsPerMerchant: relationshipMetrics.avgPerPartner
          },
          acceptedEvents,
          pendingRequests,
          periodEvents,
          merchantCounts: relationshipMetrics.partnerCounts
        }
      } catch (error) {
        console.error('Error loading vendor analytics metrics:', error)
        throw error
      }
    }
  }
})
