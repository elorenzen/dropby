import { defineStore } from 'pinia'
import type { Merchant } from '~/types'
import { addDays } from '~/utils/dates'
import { calculateGrowthMetrics, filterEventsByPeriod, calculateRateMetrics, calculateRelationshipMetrics } from '~/utils/analytics'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    allMerchants: [] as Merchant[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getAllMerchants: (state) => state.allMerchants,
    
    // Additional computed properties
    getVerifiedMerchants: (state) => {
      return state.allMerchants.filter(merchant => merchant.compliance_verified)
    },
    

    
    getMerchantsByLocation: (state) => (lat: number, lng: number, radiusKm: number = 50) => {
      return state.allMerchants.filter(merchant => {
        if (!merchant.coordinates) return false
        
        const distance = calculateDistance(
          lat, lng, 
          merchant.coordinates.lat, merchant.coordinates.lng
        )
        return distance <= radiusKm
      })
    },

    getMerchantProp: (state) => (merchantId: string, prop: string): string => {
      if (!merchantId) return ''
      const merchant = state.allMerchants.find((m: Merchant) => m.id === merchantId)
      return (merchant?.[prop as keyof typeof merchant] as string) || ''
    }
  },
  
  actions: {
    async setAllMerchants(merchants: Merchant[]) {
      this.allMerchants = merchants
    },
    
    async getMerchantById(id: string) {
      return this.allMerchants.find(merchant => merchant.id === id)
    },

    async createMerchant(merchantData: Partial<Merchant>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .insert(merchantData as any)
          .select()
          .single()

        if (error) throw error

        this.allMerchants.push(data)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.id,
          other_ids: [data.id],
          title: 'Merchant Created',
          description: `New merchant account created: ${data.merchant_name}`,
          type: 'merchant_created'
        })
        
        return data
      } catch (error) {
        console.error('Error creating merchant:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateMerchant(merchantId: string, updates: Partial<Merchant>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .update(updates as any)
          .eq('id', merchantId)
          .select()
          .single()

        if (error) throw error

        const index = this.allMerchants.findIndex(merchant => merchant.id === merchantId)
        if (index !== -1) {
          this.allMerchants[index] = { ...this.allMerchants[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating merchant:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteMerchant(merchantId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('merchants')
          .delete()
          .eq('id', merchantId)

        if (error) throw error

        // Remove from local state
        this.allMerchants = this.allMerchants.filter(merchant => merchant.id !== merchantId)
        
        // Create timeline item for merchant deletion
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: merchantId,
          other_ids: [merchantId],
          title: 'Merchant Deleted',
          description: `Merchant account deleted`,
          type: 'merchant_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting merchant:', error)
        throw error
      }
    },

    async loadMerchants() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.allMerchants = data || []
        return data
      } catch (error) {
        console.error('Error loading merchants:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateComplianceStatus(merchantId: string, verified: boolean, score: number) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .update({ 
            compliance_verified: verified, 
            compliance_score: score,
            updated_at: new Date().toISOString() 
          } as any)
          .eq('id', merchantId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.allMerchants.findIndex(merchant => merchant.id === merchantId)
        if (index !== -1) {
          this.allMerchants[index] = { ...this.allMerchants[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating compliance status:', error)
        throw error
      }
    },

    async getDashboardMetrics(merchantId: string) {
      try {
        const supabase = useSupabaseClient()
        const reviewStore = useReviewStore()
        
        // Get events for this merchant
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('merchant', merchantId)
        
        const now = new Date()
        const nextWeek = addDays(now, 7)
        
        // Count completed events for the "Completed Events" card
        const completedEvents = events?.filter((e: any) => e.status === 'completed') || []
        const totalEvents = completedEvents.length
        
        // Count booked events (those with a vendor) for the "Booked Events" card
        const bookedEvents = events?.filter((e: any) => e.vendor && e.status === 'booked') || []
        const bookedEventsCount = bookedEvents.length
        
        // Count future events with open status
        const futureOpenEvents = events?.filter((e: any) => e.status === 'open' && new Date(e.start) > now) || []
        const openEvents = futureOpenEvents.length
        
        // Calculate pending requests for future events with open status that have pending requests
        const futureOpenEventsWithRequests = events?.filter((e: any) => 
          e.status === 'open' && 
          new Date(e.start) > now && 
          e.pending_requests && 
          e.pending_requests.length > 0
        ) || []
        const totalPendingRequests = futureOpenEventsWithRequests.reduce((total: number, e: any) => {
          return total + (e.pending_requests?.length || 0)
        }, 0)
        const pendingRequests = totalPendingRequests
      
        // Calculate upcoming events in next 7 days
        const upcomingWeek = bookedEvents.filter((e: any) => {
          const startDate = new Date(e.start)
          return startDate >= now && startDate <= nextWeek
        }).length
        
        // Calculate events growth using utility
        const growthMetrics = calculateGrowthMetrics(completedEvents, 'created_at')
        
        // Ensure reviews are loaded, then use review store method instead of recalculating
        // Note: Reviews should already be loaded by the dashboard page, but ensure they're available
        const reviews = reviewStore.getReviewsForBusiness(merchantId)
        const averageRating = reviews.length > 0
          ? reviewStore.getAverageRatingForBusiness(merchantId)
          : 0
        const totalRatings = reviews.length
        
        return {
          totalEvents,
          eventsGrowth: growthMetrics.growth,
          openEvents,
          bookedEvents: bookedEventsCount,
          upcomingWeek,
          pendingRequests,
          averageRating,
          totalRatings
        }
      } catch (error) {
        console.error('Error loading merchant dashboard metrics:', error)
        throw error
      }
    },

    async getAnalyticsMetrics(merchantId: string, period: string) {
      try {
        const eventStore = useEventStore()
        const supabase = useSupabaseClient()

        // Analytics can be loaded directly via hard refresh before events are in store
        if (eventStore.allEvents.length === 0) {
          await eventStore.loadEvents()
        }
        
        // Get all events for this merchant from store
        const allEvents = eventStore.getEventsByMerchantId(merchantId)
        
        if (!allEvents || allEvents.length === 0) {
          return {
            metrics: {
              conversionRate: 0,
              totalBookings: 0,
              totalRequests: 0,
              uniqueVendors: 0,
              repeatVendors: 0,
              avgVendorRating: 0,
              totalReviews: 0,
              openEvents: 0
            },
            periodEvents: [],
            vendorCounts: {}
          }
        }

        // Filter events by period using utility
        const periodEvents = filterEventsByPeriod(allEvents, period, 'start')

        // Process analytics data
        // Get booked/completed events (treated as successful bookings)
        const bookedEvents = periodEvents.filter((event: any) => 
          event.status === 'booked' || event.status === 'completed'
        )
        const totalBookings = bookedEvents.length

        // Booking conversion (requested formula):
        // booked events / all created events in selected period.
        const totalCreatedEvents = periodEvents.length
        const conversionRate = calculateRateMetrics(totalBookings, totalCreatedEvents)
        
        // Calculate vendor relationship metrics using utility
        const relationshipMetrics = calculateRelationshipMetrics(bookedEvents, 'vendor')
        
        // Average vendor rating over selected period:
        // use review rows tied to events in this selected period (merchant -> vendor reviews).
        let avgVendorRating = 0
        let totalReviews = 0
        const periodEventIds = periodEvents.map((event: any) => event.id).filter(Boolean)
        if (periodEventIds.length > 0) {
          const { data: periodReviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating,event_id,sender_id')
            .eq('sender_id', merchantId)
            .in('event_id', periodEventIds)

          if (reviewsError) throw reviewsError

          const ratings = (periodReviews || [])
            .map((review: any) => review.rating)
            .filter((rating: any) => rating !== null && rating !== undefined)

          totalReviews = ratings.length
          if (totalReviews > 0) {
            const totalRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0)
            avgVendorRating = Math.round((totalRating / totalReviews) * 10) / 10
          }
        }
        
        // Count open events
        const openEvents = periodEvents.filter((event: any) => event.status === 'open').length
        const totalRequests = totalCreatedEvents

        return {
          metrics: {
            conversionRate,
            totalBookings,
            totalRequests,
            uniqueVendors: relationshipMetrics.uniquePartners,
            repeatVendors: relationshipMetrics.repeatPartners,
            avgVendorRating,
            totalReviews,
            openEvents
          },
          periodEvents,
          vendorCounts: relationshipMetrics.partnerCounts
        }
      } catch (error) {
        console.error('Error loading merchant analytics metrics:', error)
        throw error
      }
    }
  }
})

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
