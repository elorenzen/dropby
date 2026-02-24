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

    async loadUserVotes() {
      try {
        const supabase = useSupabaseClient()
        const user = useSupabaseUser()

        if (!user.value) return

        const { data, error } = await supabase
          .from('feedback_votes')
          .select('feedback_id')
          .eq('user_id', user.value.id)

        if (error) throw error

        this.userVotedIds = new Set(
          (data || []).map((v: any) => v.feedback_id)
        )
      } catch (error) {
        console.error('Error loading votes:', error)
      }
    },

    async toggleVote(feedbackId: string) {
      try {
        const supabase = useSupabaseClient()
        const user = useSupabaseUser()

        if (!user.value) throw new Error('Authentication required')

        const { data: existing } = await supabase
          .from('feedback_votes')
          .select('id')
          .eq('feedback_id', feedbackId)
          .eq('user_id', user.value.id)
          .maybeSingle()

        const index = this.feedbackList.findIndex(f => f.id === feedbackId)

        if (existing) {
          const { error } = await supabase
            .from('feedback_votes')
            .delete()
            .eq('id', existing.id)

          if (error) throw error

          this.userVotedIds.delete(feedbackId)

          if (index !== -1) {
            const currentCount = this.feedbackList[index].vote_count || 0
            this.feedbackList[index] = {
              ...this.feedbackList[index],
              vote_count: Math.max(currentCount - 1, 0)
            }
          }

          return { voted: false, vote_count: index !== -1 ? this.feedbackList[index].vote_count : 0 }
        }

        const { error } = await supabase
          .from('feedback_votes')
          .insert({ feedback_id: feedbackId, user_id: user.value.id })

        if (error) throw error

        this.userVotedIds.add(feedbackId)

        if (index !== -1) {
          this.feedbackList[index] = {
            ...this.feedbackList[index],
            vote_count: (this.feedbackList[index].vote_count || 0) + 1
          }
        }

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
