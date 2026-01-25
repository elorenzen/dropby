import { defineStore } from 'pinia'
import type { Review } from '~/types'

export const useReviewStore = defineStore('review', {
  state: () => ({
    receivedReviews: [] as Review[],
    sentReviews: [] as Review[],
    allReviews: [] as Review[],
    currentUserId: null as string | null,
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getReceivedReviews: (state) => state.receivedReviews,
    getSentReviews: (state) => state.sentReviews,
    
    // Additional computed properties
    averageRating: (state) => {
      if (state.receivedReviews.length === 0) return 0
      const total = state.receivedReviews.reduce((sum, review) => sum + review.rating, 0)
      return Math.round((total / state.receivedReviews.length) * 10) / 10
    },
    
    totalReviews: (state) => state.receivedReviews.length,
    
    reviewsByRating: (state) => (rating: number) => {
      return state.receivedReviews.filter(review => review.rating === rating)
    }
  },
  
  actions: {
    // Existing actions
    async setReceivedReviews(reviews: Review[]) {
      this.receivedReviews = reviews
      // Update allReviews with received reviews
      reviews.forEach(review => {
        const existingIndex = this.allReviews.findIndex(r => r.id === review.id)
        if (existingIndex === -1) {
          this.allReviews.push(review)
        }
      })
    },
    
    async setSentReviews(reviews: Review[]) {
      this.sentReviews = reviews
      // Update allReviews with sent reviews
      reviews.forEach(review => {
        const existingIndex = this.allReviews.findIndex(r => r.id === review.id)
        if (existingIndex === -1) {
          this.allReviews.push(review)
        }
      })
    },

    // New actions to replace direct Supabase calls
    async createReview(reviewData: Partial<Review>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('reviews')
          .insert(reviewData as any)
          .select()
          .single()

        if (error) throw error

        if (data.sender_id === data.author_id) {
          this.sentReviews.unshift(data)
        } else {
          this.receivedReviews.unshift(data)
        }
        
        // Add to allReviews for viewer pages
        this.allReviews.unshift(data)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.sender_id,
          other_ids: [data.id, data.recipient_id, data.event_id],
          title: 'Review Submitted',
          description: `Submitted ${data.rating}-star review for event`,
          type: 'review_submitted'
        })
        
        // Create notification for recipient
        // Need to determine if recipient is merchant or vendor to get user IDs
        const notificationStore = useNotificationStore()
        const userStore = useUserStore()
        const currentUser = useSupabaseUser()
        const merchantStore = useMerchantStore()
        const vendorStore = useVendorStore()
        
        // Load merchants/vendors if not already loaded
        if (merchantStore.allMerchants.length === 0) {
          await merchantStore.loadMerchants()
        }
        if (vendorStore.allVendors.length === 0) {
          await vendorStore.loadVendors()
        }
        
        // Check if recipient is a merchant or vendor
        const isMerchant = merchantStore.getAllMerchants.some((m: any) => m.id === data.recipient_id)
        const businessType = isMerchant ? 'merchant' : 'vendor'
        
        // Get user IDs for the recipient business
        const recipientUserIds = await userStore.getUserIdsFromBusiness(data.recipient_id, businessType)
        
        // Create notification for each user associated with the recipient business
        for (const recipientUserId of recipientUserIds) {
          try {
            await notificationStore.createNotification({
              recipient_id: recipientUserId,
              sender_id: currentUser.value?.id || null,
              sender_business_id: data.sender_id,
              sender_business_type: businessType === 'merchant' ? 'vendor' : 'merchant',
              action_type: 'review_received',
              entity_type: 'review',
              entity_id: data.id,
              title: 'New Review Received',
              message: `You received a ${data.rating}-star review`,
              metadata: {
                review_id: data.id,
                rating: data.rating,
                event_id: data.event_id
              }
            })
          } catch (notifError) {
            console.error('Failed to create notification for recipient user:', recipientUserId, notifError)
          }
        }
        
        return data
      } catch (error) {
        console.error('Error creating review:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateReview(reviewId: string, updates: Partial<Review>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('reviews')
          .update(updates as any)
          .eq('id', reviewId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const sentIndex = this.sentReviews.findIndex(r => r.id === reviewId)
        const receivedIndex = this.receivedReviews.findIndex(r => r.id === reviewId)
        const allIndex = this.allReviews.findIndex(r => r.id === reviewId)
        
        if (sentIndex !== -1) {
          this.sentReviews[sentIndex] = { ...this.sentReviews[sentIndex], ...data }
        } else if (receivedIndex !== -1) {
          this.receivedReviews[receivedIndex] = { ...this.receivedReviews[receivedIndex], ...data }
        }
        
        // Update allReviews
        if (allIndex !== -1) {
          this.allReviews[allIndex] = { ...this.allReviews[allIndex], ...data }
        }

        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.sender_id,
          other_ids: [data.id, data.recipient_id, data.event_id],
          title: 'Review Updated',
          description: `Review updated`,
          type: 'review_updated'
        })
        
        return data
      } catch (error) {
        console.error('Error updating review:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteReview(reviewId: string) {
      try {
        // Get sender_id before deletion
        const reviewToDelete = this.sentReviews.find(r => r.id === reviewId) || 
                              this.receivedReviews.find(r => r.id === reviewId)
        const senderId = reviewToDelete?.sender_id || ''
        
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', reviewId)

        if (error) throw error

        this.sentReviews = this.sentReviews.filter(r => r.id !== reviewId)
        this.receivedReviews = this.receivedReviews.filter(r => r.id !== reviewId)
        this.allReviews = this.allReviews.filter(r => r.id !== reviewId)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: senderId,
          other_ids: [reviewId],
          title: 'Review Deleted',
          description: `Review deleted`,
          type: 'review_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting review:', error)
        throw error
      }
    },

    async loadReviewsForUser(userId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        // Load received reviews
        const { data: received, error: receivedError } = await supabase
          .from('reviews')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false })

        if (receivedError) throw receivedError

        // Load sent reviews
        const { data: sent, error: sentError } = await supabase
          .from('reviews')
          .select('*')
          .eq('sender_id', userId)
          .order('created_at', { ascending: false })

        if (sentError) throw sentError
        
        this.receivedReviews = received || []
        this.sentReviews = sent || []
        this.currentUserId = userId
        
        return { received: this.receivedReviews, sent: this.sentReviews }
      } catch (error) {
        console.error('Error loading reviews:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadReviewsForBusiness(businessId: string, businessType: 'merchant' | 'vendor') {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        // Load received reviews (where business is the recipient)
        const { data: received, error: receivedError } = await supabase
          .from('reviews')
          .select('*')
          .eq('recipient_id', businessId)
          .order('created_at', { ascending: false })

        if (receivedError) throw receivedError

        // Load sent reviews (where business is the sender)
        const { data: sent, error: sentError } = await supabase
          .from('reviews')
          .select('*')
          .eq('sender_id', businessId)
          .order('created_at', { ascending: false })

        if (sentError) throw sentError
        
        this.receivedReviews = received || []
        this.sentReviews = sent || []
        this.currentUserId = businessId
        
        // Also update allReviews for getReviewsForBusiness to work
        const allReviewsData = [...(received || []), ...(sent || [])]
        allReviewsData.forEach(review => {
          const existingIndex = this.allReviews.findIndex(r => r.id === review.id)
          if (existingIndex === -1) {
            this.allReviews.push(review)
          } else {
            this.allReviews[existingIndex] = review
          }
        })
        
        return { received: this.receivedReviews, sent: this.sentReviews }
      } catch (error) {
        console.error('Error loading reviews for business:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadReviewsForEvent(eventId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        return data || []
      } catch (error) {
        console.error('Error loading event reviews:', error)
        throw error
      }
    },

    async loadAllReviews() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Store all reviews in a separate state for lookup
        this.allReviews = data || []
        return data || []
      } catch (error) {
        console.error('Error loading all reviews:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    getReviewsForBusiness(businessId: string): Review[] {
      // Use receivedReviews if currentUserId matches, otherwise check allReviews
      if (this.currentUserId === businessId && this.receivedReviews.length > 0) {
        return this.receivedReviews
      }
      // Fallback to allReviews if available
      return this.allReviews.filter((review: Review) => review.recipient_id === businessId)
    },

    getAverageRatingForBusiness(businessId: string): number {
      const reviews = this.getReviewsForBusiness(businessId)
      if (reviews.length === 0) return 0
      const total = reviews.reduce((sum, review) => sum + review.rating, 0)
      return Math.round((total / reviews.length) * 10) / 10
    }
  }
})