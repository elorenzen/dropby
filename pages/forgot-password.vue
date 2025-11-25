<template>
  <div class="forgot-password-container">
    <Card class="forgot-password-card">
      <template #header>
        <div class="card-header">
          <Logo class="w-12 h-12" :fontControlled="false" style="color: var(--primary-color);" />
          <h1 class="text-2xl font-bold text-primary">Reset Password</h1>
          <p class="text-color-secondary text-center">Enter your email address and we'll send you a link to reset your password.</p>
        </div>
      </template>
      <template #content>
        <div class="forgot-password-form">
          <div class="field">
            <FloatLabel variant="on" class="w-full">
              <InputText 
                id="email" 
                v-model="email" 
                type="email"
                class="w-full"
                @keyup.enter="requestPasswordReset"
              />
              <label for="email">Email</label>
            </FloatLabel>
            <p v-if="emailError" class="text-error text-xs mt-1">{{ emailError }}</p>
          </div>

          <div class="field">
            <Button 
              label="Send Reset Link" 
              @click="requestPasswordReset"
              :disabled="!email || loading"
              :loading="loading"
              class="w-full"
            />
          </div>

          <div class="field text-center">
            <Button 
              label="Back to Login" 
              text
              @click="navigateTo('/login')"
              class="text-link-button"
            />
          </div>
        </div>
      </template>
    </Card>

    <Message v-if="successMessage" severity="success" :closable="false" class="mt-4">
      {{ successMessage }}
    </Message>

    <ErrorDialog v-if="errDialog" :errType="'Password Reset'" :errMsg="errMsg" @errorClose="errDialog = false" />
  </div>
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg'

const supabase = useSupabaseClient()
const router = useRouter()

const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref('')
const email = ref('')
const emailError = ref('')
const successMessage = ref('')

const requestPasswordReset = async () => {
  // Reset errors
  emailError.value = ''
  successMessage.value = ''
  
  // Basic validation
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }

  loading.value = true
  try {
    // Get the base URL for redirect
    const baseUrl = process.client ? window.location.origin : ''
    const redirectTo = `${baseUrl}/reset-password`

    console.log('Requesting password reset for:', email.value)
    console.log('Redirect URL:', redirectTo)

    // Request password reset from Supabase
    // This will send an email with a reset link that includes the token in the URL hash
    // IMPORTANT: Make sure this redirectTo URL is added to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: redirectTo
    })

    if (resetError) {
      throw resetError
    }

    // Always show success message (for security, don't reveal if email exists)
    successMessage.value = 'If an account with that email exists, a password reset link has been sent. Please check your email.'
    email.value = ''
  } catch (err: any) {
    errMsg.value = err.message || 'Failed to send password reset email'
    errDialog.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.forgot-password-card {
  width: 100%;
  max-width: 450px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0 1rem;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.field {
  width: 100%;
}

/* Ensure FloatLabel and inputs are full width */
:deep(.p-float-label) {
  width: 100%;
}

:deep(.p-inputtext) {
  width: 100%;
}

/* Text link button styling - flat text only, no background or border */
.text-link-button {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  color: var(--primary-color) !important;
  text-decoration: none !important;
  box-shadow: none !important;
  font-size: inherit !important;
  font-weight: inherit !important;
}

.text-link-button:hover {
  background: transparent !important;
  border: none !important;
  text-decoration: underline !important;
  opacity: 0.8;
}

.text-link-button:focus {
  box-shadow: none !important;
}

@media (max-width: 768px) {
  .forgot-password-container {
    padding: 1rem;
  }
  
  .forgot-password-card {
    max-width: 100%;
  }
}
</style>

