import type { FeedbackType, FeedbackStatus } from '~/types'

export const useFeedback = () => {
  const feedbackStore = useFeedbackStore()

  const allFeedback = computed(() => feedbackStore.getAllFeedback)
  const loading = computed(() => feedbackStore.loading)
  const submitting = computed(() => feedbackStore.submitting)
  const updating = computed(() => feedbackStore.updating)

  const feedbackByStatus = (status: FeedbackStatus) => {
    return computed(() => feedbackStore.getFeedbackByStatus(status))
  }

  const feedbackByType = (type: FeedbackType) => {
    return computed(() => feedbackStore.getFeedbackByType(type))
  }

  const loadAllFeedback = () => feedbackStore.loadAllFeedback()

  const submitFeedback = (payload: {
    type: FeedbackType
    title: string
    description: string
    email?: string
  }) => feedbackStore.submitFeedback(payload)

  const updateFeedbackStatus = (id: string, status: FeedbackStatus) =>
    feedbackStore.updateFeedbackStatus(id, status)

  return {
    allFeedback,
    loading,
    submitting,
    updating,
    feedbackByStatus,
    feedbackByType,
    loadAllFeedback,
    submitFeedback,
    updateFeedbackStatus
  }
}
