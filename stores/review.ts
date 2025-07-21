import { defineStore } from 'pinia'

interface Review {
  id: string
  created_at: string
  event_id: string
  author_id: string
  sender_id: string
  recipient_id: string
  rating: number
  content: string
}

export const useReviewStore = defineStore('review', {
  state: () => ({
    receivedReviews: [] as Review[],
    sentReviews: [] as Review[]
  }),
  getters: {
    getReceivedReviews: (state) => state.receivedReviews,
    getSentReviews: (state) => state.sentReviews
  },
  actions: {
    async setReceivedReviews(reviews: Review[]) {
      this.receivedReviews = reviews
    },
    async setSentReviews(reviews: Review[]) {
      this.sentReviews = reviews
    }
  }
})