<template>
  <div class="feedback-page">
    <div class="feedback-container">
      <h2>Report a Bug or Request a Feature</h2>
      <p class="feedback-subtitle">
        We'd love to hear from you. Use the form below to report a bug, request a feature, or send us any other feedback.
      </p>

      <div v-if="submitted" class="success-message">
        <i class="pi pi-check-circle" style="font-size: 2rem; color: var(--p-green-500);" />
        <h3>Thank you for your feedback!</h3>
        <p>We've received your submission and will review it shortly.</p>
        <Button label="Submit Another" icon="pi pi-plus" @click="resetForm" outlined />
      </div>

      <form v-else @submit.prevent="handleSubmit" class="feedback-form">
        <div class="form-field">
          <label for="feedback-type">Type</label>
          <Select
            id="feedback-type"
            v-model="form.type"
            :options="feedbackTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a type"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="feedback-title">Title</label>
          <InputText
            id="feedback-title"
            v-model="form.title"
            placeholder="Brief summary of your feedback"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="feedback-description">Description</label>
          <Textarea
            id="feedback-description"
            v-model="form.description"
            placeholder="Provide as much detail as possible..."
            rows="6"
            class="w-full"
            autoResize
          />
        </div>

        <div v-if="!isAuthenticated" class="form-field">
          <label for="feedback-email">Email</label>
          <InputText
            id="feedback-email"
            v-model="form.email"
            type="email"
            placeholder="Your email address"
            class="w-full"
          />
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            label="Submit Feedback"
            icon="pi pi-send"
            :loading="submitting"
            :disabled="!isFormValid"
          />
        </div>
      </form>

      <!-- Existing Feedback List -->
      <div v-if="isAuthenticated" class="feedback-list-section">
        <div class="list-header">
          <h3>All Submissions</h3>
          <div class="list-header-actions">
            <Select
              v-model="listFilterType"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Types"
              size="small"
              class="filter-select"
            />
            <Button
              icon="pi pi-refresh"
              outlined
              size="small"
              @click="refreshFeedback"
              :loading="loading"
            />
          </div>
        </div>
        <p class="list-subtitle">
          Browse existing reports. Upvote items you'd like to see prioritized.
        </p>

        <div v-if="loading && allFeedback.length === 0" class="loading-state">
          <i class="pi pi-spinner pi-spin" style="font-size: 1.5rem; color: var(--p-text-muted-color);" />
          <p>Loading submissions...</p>
        </div>

        <div v-else-if="filteredFeedback.length === 0" class="empty-list">
          <i class="pi pi-inbox" style="font-size: 1.5rem; color: var(--p-text-muted-color);" />
          <p>No submissions yet. Be the first to report!</p>
        </div>

        <div v-else class="feedback-cards">
          <EventBaseListCard
            v-for="item in filteredFeedback"
            :key="item.id"
            :show-status-badge="true"
          >
            <template #vendor-avatar>
              <div class="type-icon" :class="`type-icon--${item.type}`">
                <i :class="typeIcon(item.type)" />
              </div>
            </template>
            <template #event-content>
              <p class="font-semibold truncate">{{ item.title }}</p>
              <p class="text-sm text-md-gray line-clamp-2">{{ item.description }}</p>
              <p class="text-xs text-md-gray">{{ formatDate(item.created_at) }}</p>
            </template>
            <template #status-badge>
              <Tag :value="formatType(item.type)" :severity="typeSeverity(item.type)" />
            </template>
            <template #action-buttons>
              <Button
                :icon="feedbackStore.hasVoted(item.id) ? 'pi pi-thumbs-up-fill' : 'pi pi-thumbs-up'"
                :label="String(item.vote_count || 0)"
                :severity="feedbackStore.hasVoted(item.id) ? 'primary' : 'secondary'"
                :outlined="!feedbackStore.hasVoted(item.id)"
                size="small"
                @click="handleVote(item.id)"
              />
            </template>
          </EventBaseListCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackType } from '~/types'
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: ['auth']
})

useSeoMeta({ title: 'Feedback' })

const { isAuthenticated, currentUser } = useAuth()
const {
  allFeedback,
  loading,
  submitting,
  loadAllFeedback,
  toggleVote,
  submitFeedback
} = useFeedback()
const feedbackStore = useFeedbackStore()
const { showToast } = useToast()

const submitted = ref(false)
const listFilterType = ref<FeedbackType | ''>('')

const form = reactive({
  type: 'bug' as FeedbackType,
  title: '',
  description: '',
  email: ''
})

const feedbackTypeOptions = [
  { label: 'Bug Report', value: 'bug' },
  { label: 'Feature Request', value: 'feature_request' },
  { label: 'Other', value: 'other' }
]

const typeFilterOptions = [
  { label: 'All Types', value: '' },
  { label: 'Bugs', value: 'bug' },
  { label: 'Feature Requests', value: 'feature_request' },
  { label: 'Other', value: 'other' }
]

const filteredFeedback = computed(() => {
  if (!listFilterType.value) return allFeedback.value
  return allFeedback.value.filter(f => f.type === listFilterType.value)
})

const isFormValid = computed(() => {
  const hasType = !!form.type
  const hasTitle = !!form.title.trim()
  const hasDescription = !!form.description.trim()
  const hasEmail = isAuthenticated.value || !!form.email.trim()
  return hasType && hasTitle && hasDescription && hasEmail
})

const typeIcon = (type: string) => {
  const map: Record<string, string> = {
    bug: 'pi pi-exclamation-triangle',
    feature_request: 'pi pi-lightbulb',
    other: 'pi pi-comment'
  }
  return map[type] || 'pi pi-comment'
}

const formatType = (type: string) => {
  const map: Record<string, string> = {
    bug: 'Bug',
    feature_request: 'Feature Request',
    other: 'Other'
  }
  return map[type] || type
}

const typeSeverity = (type: string) => {
  const map: Record<string, string> = {
    bug: 'danger',
    feature_request: 'info',
    other: 'secondary'
  }
  return map[type] || 'secondary'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    await submitFeedback({
      type: form.type,
      title: form.title,
      description: form.description,
      email: form.email || undefined
    })
    submitted.value = true
    showToast('Feedback submitted successfully!', 'success')
  } catch (error: any) {
    showToast(error.statusMessage || 'Failed to submit feedback', 'error')
  }
}

const handleVote = async (feedbackId: string) => {
  try {
    await toggleVote(feedbackId)
  } catch (error: any) {
    showToast(error.statusMessage || 'Failed to vote', 'error')
  }
}

const refreshFeedback = async () => {
  try {
    await loadAllFeedback()
  } catch (error: any) {
    showToast(error.statusMessage || 'Failed to load feedback', 'error')
  }
}

const resetForm = () => {
  form.type = 'bug'
  form.title = ''
  form.description = ''
  form.email = ''
  submitted.value = false
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await refreshFeedback()
  }
})
</script>

<style scoped>
.feedback-page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.feedback-container {
  max-width: 720px;
  width: 100%;
}

.feedback-container h2 {
  margin-bottom: 0.5rem;
}

.feedback-subtitle {
  color: var(--p-text-muted-color);
  margin-bottom: 2rem;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.success-message {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-message h3 {
  margin: 0;
}

.success-message p {
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Feedback list section */
.feedback-list-section {
  margin-top: 3rem;
  border-top: 1px solid var(--p-surface-border);
  padding-top: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.list-header h3 {
  margin: 0;
}

.list-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  min-width: 150px;
}

.list-subtitle {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.feedback-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-icon--bug {
  background-color: var(--p-red-50);
  color: var(--p-red-500);
}

.type-icon--feature_request {
  background-color: var(--p-blue-50);
  color: var(--p-blue-500);
}

.type-icon--other {
  background-color: var(--p-surface-100);
  color: var(--p-text-muted-color);
}

.p-dark .type-icon--bug {
  background-color: var(--p-red-900);
}

.p-dark .type-icon--feature_request {
  background-color: var(--p-blue-900);
}

.p-dark .type-icon--other {
  background-color: var(--p-surface-700);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.loading-state,
.empty-list {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.loading-state p,
.empty-list p {
  color: var(--p-text-muted-color);
  margin: 0;
}

@media (max-width: 600px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .list-header-actions {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }
}
</style>
