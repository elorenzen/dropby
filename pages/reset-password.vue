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
const route = useRoute()
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

// According to Supabase docs, when user clicks password reset link:
// 1. Supabase automatically authenticates them
// 2. We just need to check if they're authenticated
// 3. Then allow them to update their password

// Check authentication status and handle URL parameters
onMounted(async () => {
  if (process.client) {
    const hash = window.location.hash
    const query = route.query
    
    console.log('=== PASSWORD RESET FLOW ===')
    console.log('URL hash:', hash)
    console.log('URL query:', query)
    
    // PRIORITY 1: Check for errors first (Supabase redirects with errors if token is invalid)
    if (query.error) {
      const errorCode = query.error_code as string || 'unknown'
      const errorDesc = query.error_description as string || query.error as string
      
      console.error('❌ Error in URL:', { error: query.error, errorCode, errorDesc })
      
      if (errorCode === 'otp_expired' || errorDesc?.includes('expired')) {
        errMsg.value = 'This password reset link has expired. Password reset links expire after 1 hour. Please request a new password reset link.'
      } else if (errorCode === 'access_denied') {
        errMsg.value = 'This password reset link is invalid or has already been used. Please request a new password reset link.'
      } else {
        errMsg.value = `Password reset error: ${errorDesc || query.error}. Please request a new password reset link.`
      }
      
      errDialog.value = true
      checkingAuth.value = false
      setTimeout(() => {
        router.push('/forgot-password')
      }, 5000)
      return
    }
    
    // PRIORITY 2: Handle hash-based recovery token (preferred method)
    if (hash && hash.includes('type=recovery')) {
      console.log('Found recovery token in hash, setting session...')
      
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      const refreshToken = hashParams.get('refresh_token')

      if (type === 'recovery' && accessToken) {
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (sessionError) {
            throw sessionError
          }
          
          console.log('✅ Session set from hash token')
          // Clear hash from URL
          router.replace({ hash: '' })
          isAuthenticated.value = true
          checkingAuth.value = false
          return
        } catch (err: any) {
          console.error('Failed to set session from hash:', err)
          errMsg.value = err.message?.includes('expired') || err.message?.includes('invalid')
            ? 'This password reset link has expired or is invalid. Please request a new password reset link.'
            : `Unable to validate reset link: ${err.message}. Please request a new password reset link.`
          errDialog.value = true
          checkingAuth.value = false
          setTimeout(() => {
            router.push('/forgot-password')
          }, 5000)
          return
        }
      }
    }
    
    // PRIORITY 3: Check if user is already authenticated (Supabase may have auto-authenticated)
    // This handles both code parameters and cases where Supabase already set the session
    const checkAuth = async () => {
      // Check current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session && session.user) {
        console.log('✅ User is authenticated (Supabase auto-authenticated from reset link)')
        isAuthenticated.value = true
        // Clear any URL parameters
        if (query.code || hash) {
          router.replace({ query: {}, hash: '' })
        }
        checkingAuth.value = false
        return
      }
      
      // If we have a code parameter, wait a moment for Supabase to process it
      if (query.code) {
        console.log('Found code parameter, waiting for Supabase to process...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession && retrySession.user) {
          console.log('✅ User authenticated after code processing')
          isAuthenticated.value = true
          router.replace({ query: {} })
          checkingAuth.value = false
          return
        }
      }
      
      // No authentication found
      console.warn('❌ User is not authenticated')
      errMsg.value = 'Unable to verify password reset link. Please ensure your Supabase redirect URL (http://localhost:3000/reset-password) is configured in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, then request a new password reset link.'
      errDialog.value = true
      checkingAuth.value = false
      setTimeout(() => {
        router.push('/forgot-password')
      }, 5000)
    }
    
    await checkAuth()
  }
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

