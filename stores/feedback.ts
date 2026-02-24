import { defineStore } from 'pinia'
import type { UserFeedback, FeedbackType, FeedbackStatus } from '~/types'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    feedbackList: [] as UserFeedback[],
    userVotedIds: new Set<string>(),
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
    },

    hasVoted: (state) => (feedbackId: string) => {
      return state.userVotedIds.has(feedbackId)
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

    loadUserVotes() {
      // Vote state is client-only (no feedback_votes table); no-op for compatibility
      this.userVotedIds = new Set<string>()
    },

    async toggleVote(feedbackId: string) {
      const addingVote = !this.userVotedIds.has(feedbackId)
      try {
        const response = await $fetch<{ success: boolean; voted: boolean; vote_count: number }>(
          `/api/feedback/${feedbackId}/vote`,
          { method: 'POST', body: { voted: addingVote } }
        )

        if (response.voted) {
          this.userVotedIds = new Set([...this.userVotedIds, feedbackId])
        } else {
          this.userVotedIds = new Set([...this.userVotedIds].filter(id => id !== feedbackId))
        }

        this.feedbackList = this.feedbackList.map(f =>
          f.id === feedbackId ? { ...f, vote_count: response.vote_count } : f
        )

        return { voted: true, vote_count: index !== -1 ? this.feedbackList[index].vote_count : 0 }
      } catch (error) {
        console.error('Error toggling vote:', error)
        throw error
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
        const supabase = useSupabaseClient()
        const user = useSupabaseUser()

        const { data, error } = await supabase
          .from('user_feedback')
          .insert({
            user_id: user.value?.id || null,
            email: payload.email || user.value?.email || null,
            type: payload.type,
            title: payload.title.trim(),
            description: payload.description.trim(),
            status: 'new' as FeedbackStatus,
            vote_count: 0
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          this.feedbackList.unshift(data as UserFeedback)
        }
        return data as UserFeedback
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
