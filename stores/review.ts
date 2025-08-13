import { defineStore } from 'pinia'
import type { Review } from '~/types'

export const useReviewStore = defineStore('review', {
  state: () => ({
    receivedReviews: [] as Review[],
    sentReviews: [] as Review[],
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
    },
    
    async setSentReviews(reviews: Review[]) {
      this.sentReviews = reviews
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
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.sender_id,
          other_ids: [data.id, data.recipient_id, data.event_id],
          title: 'Review Submitted',
          description: `Submitted ${data.rating}-star review for event`,
          type: 'review_submitted'
        })
        
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
        
        if (sentIndex !== -1) {
          this.sentReviews[sentIndex] = { ...this.sentReviews[sentIndex], ...data }
        } else if (receivedIndex !== -1) {
          this.receivedReviews[receivedIndex] = { ...this.receivedReviews[receivedIndex], ...data }
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
        
        return { received: this.receivedReviews, sent: this.sentReviews }
      } catch (error) {
        console.error('Error loading reviews:', error)
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
    }
  }
})