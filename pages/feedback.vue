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
const { submitFeedback, submitting } = useFeedback()
const { showToast } = useToast()

const submitted = ref(false)

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

const isFormValid = computed(() => {
  const hasType = !!form.type
  const hasTitle = !!form.title.trim()
  const hasDescription = !!form.description.trim()
  const hasEmail = isAuthenticated.value || !!form.email.trim()
  return hasType && hasTitle && hasDescription && hasEmail
})

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

const resetForm = () => {
  form.type = 'bug'
  form.title = ''
  form.description = ''
  form.email = ''
  submitted.value = false
}
</script>

<style scoped>
.feedback-page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.feedback-container {
  max-width: 640px;
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
</style>
