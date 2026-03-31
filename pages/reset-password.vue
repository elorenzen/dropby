<template>
  <div class="reset-password-container">
    <Card class="reset-password-card">
      <template #header>
        <div class="card-header">
          <Logo class="w-12 h-12" :fontControlled="false" style="color: var(--primary-color);" />
          <h1 class="text-2xl font-bold text-primary">Set New Password</h1>
          <p class="text-color-secondary text-center description-text">Enter your new password below.</p>
        </div>
      </template>
      <template #content>
        <div v-if="checkingAuth" class="reset-password-loading">
          <p class="text-color-secondary text-center">Verifying reset link...</p>
        </div>
        <div v-else-if="isAuthenticated" class="reset-password-form">
          <div class="field w-full">
            <FloatLabel variant="on" class="w-full">
              <Password 
                id="password" 
                v-model="password"
                :feedback="true"
                toggleMask
                class="w-full"
              />
              <label for="password">New Password</label>
            </FloatLabel>
            <p v-if="passwordError" class="text-error text-xs mt-1">{{ passwordError }}</p>
          </div>

          <div class="field w-full">
            <FloatLabel variant="on" class="w-full">
              <Password 
                id="confirmPassword" 
                v-model="confirmPassword"
                :feedback="false"
                toggleMask
                class="w-full"
              />
              <label for="confirmPassword">Confirm Password</label>
            </FloatLabel>
            <p v-if="confirmPasswordError" class="text-error text-xs mt-1">{{ confirmPasswordError }}</p>
          </div>

          <div class="field">
            <Button 
              label="Reset Password" 
              @click="resetPassword"
              :disabled="!password || !confirmPassword || loading"
              :loading="loading"
              class="w-full"
            />
          </div>

          <div class="field text-center">
            <Button 
              label="Back to Login" 
              severity="text"
              @click="navigateTo('/login')"
              class="text-link-button"
            />
          </div>
        </div>
      </template>
    </Card>

    <ErrorDialog v-if="errDialog" :errType="'Password Reset'" :errMsg="errMsg" @errorClose="errDialog = false" />
  </div>
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg'

const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref('')
const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isAuthenticated = ref(false)
const checkingAuth = ref(true)

onMounted(async () => {
  if (!import.meta.client) return

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session?.user) {
    isAuthenticated.value = true
    checkingAuth.value = false
    return
  }

  errMsg.value = 'Unable to verify password reset link. Please request a new password reset link.'
  errDialog.value = true
  checkingAuth.value = false
  setTimeout(() => {
    router.push('/forgot-password')
  }, 5000)
})

// Watch for auth state changes (in case Supabase authenticates after page load)
watch(user, (newUser: any) => {
  if (newUser && checkingAuth.value) {
    console.log('✅ User authenticated via auth state change')
    isAuthenticated.value = true
    checkingAuth.value = false
  }
}, { immediate: true })

const resetPassword = async () => {
  // Reset errors
  passwordError.value = ''
  confirmPasswordError.value = ''
  
  // Basic validation
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    // Update password using Supabase auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })

    if (updateError) {
      throw updateError
    }

    // Mark user as registered after password setup (handles invite flow)
    const userStore = useUserStore()
    if (user.value?.id) {
      try {
        await userStore.updateUser(user.value.id, { registered: true })
      } catch (regErr) {
        console.error('Failed to mark user as registered:', regErr)
      }
    }

    // Success - sign out the user (they were auto-logged in during password reset)
    // This ensures they need to log in with their new password
    await supabase.auth.signOut()
    
    // Clear any user store data
    userStore.clearUser()

    // Redirect to login with success message
    router.push('/login?passwordReset=success')
  } catch (err: any) {
    errMsg.value = err.message || 'Failed to reset password. The reset link may have expired.'
    errDialog.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.reset-password-card {
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

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.field {
  width: 100%;
}

.reset-password-loading {
  padding: 2rem 0;
  text-align: center;
}

/* Ensure FloatLabel and inputs are full width */
:deep(.p-float-label) {
  width: 100%;
}

:deep(.p-inputtext),
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

/* Text link button styling - flat text only, no background or border */
.text-link-button {
  padding: 0 !important;
  background: none !important;
  border: none !important;
  color: var(--primary-color) !important;
  box-shadow: none !important;
  text-decoration: none;
}

.text-link-button:hover {
  text-decoration: underline;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}

.description-text {
  margin: 0;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .reset-password-container {
    padding: 1rem;
  }
  
  .reset-password-card {
    max-width: 100%;
  }
  
  .description-text {
    padding: 0 0.5rem;
  }
}
</style>

