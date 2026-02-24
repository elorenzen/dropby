import { defineStore } from 'pinia'
import type { UserFeedback, FeedbackType, FeedbackStatus } from '~/types'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    feedbackList: [] as UserFeedback[],
    loading: false,
    submitting: false,
    updating: false
  }),

  getters: {
    getAllFeedback: (state): UserFeedback[] => state.feedbackList,

    getFeedbackByStatus: (state) => (status: FeedbackStatus) => {
      return state.feedbackList.filter(f => f.status === status)
    },

    getFeedbackByType: (state) => (type: FeedbackType) => {
      return state.feedbackList.filter(f => f.type === type)
    }
  },

  actions: {
    async loadAllFeedback() {
      this.loading = true
      try {
        const response = await $fetch<{ success: boolean; feedback: UserFeedback[] }>('/api/feedback', {
          method: 'GET'
        })
        this.feedbackList = response.feedback || []
        return this.feedbackList
      } catch (error) {
        console.error('Error loading feedback:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitFeedback(payload: {
      type: FeedbackType
      title: string
      description: string
      email?: string
    }) {
      this.submitting = true
      try {
        const response = await $fetch<{ success: boolean; feedback: UserFeedback }>('/api/feedback', {
          method: 'POST',
          body: payload
        })
        return response.feedback
      } catch (error) {
        console.error('Error submitting feedback:', error)
        throw error
      } finally {
        this.submitting = false
      }
    },

    async updateFeedbackStatus(id: string, status: FeedbackStatus) {
      this.updating = true
      try {
        const response = await $fetch<{ success: boolean; feedback: UserFeedback }>(`/api/feedback/${id}`, {
          method: 'PATCH',
          body: { status }
        })

        const index = this.feedbackList.findIndex(f => f.id === id)
        if (index !== -1 && response.feedback) {
          this.feedbackList[index] = response.feedback
        }

        return response.feedback
      } catch (error) {
        console.error('Error updating feedback:', error)
        throw error
      } finally {
        this.updating = false
      }
    }
  }
})
