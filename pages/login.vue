<template>
  <div class="login-container">
    <Card class="login-card">
      <template #header>
        <div class="card-header">
          <Logo class="w-12 h-12" :fontControlled="false" style="color: var(--primary-color);" />
          <h1 class="text-2xl font-bold text-primary">Welcome to DropBy</h1>
        </div>
      </template>
      <template #content>
        <div class="login-form">
          <div class="field">
            <FloatLabel variant="on" class="w-full">
              <InputText 
                id="email" 
                v-model="email" 
                type="email"
                class="w-full"
              />
              <label for="email">Email</label>
            </FloatLabel>
            <p v-if="emailError" class="text-error text-xs mt-1">{{ emailError }}</p>
          </div>

          <div class="field">
            <FloatLabel variant="on" class="w-full">
              <Password 
                id="password" 
                v-model="password"
                :feedback="false"
                toggleMask
                class="w-full"
              />
              <label for="password">Password</label>
            </FloatLabel>
            <p v-if="passwordError" class="text-error text-xs mt-1">{{ passwordError }}</p>
          </div>

          <div class="field">
            <Button 
              label="Login" 
              @click="fireAuth"
              :disabled="!email || !password || loading"
              :loading="loading"
              class="w-full"
            />
          </div>

          <div class="field text-center">
            <Button 
              label="Forgot Password?" 
              text
              @click="navigateTo('/forgot-password')"
              class="text-link-button"
            />
          </div>

          <div class="field text-center">
            <span class="text-sm text-color-secondary">
              Don't have an account? 
              <Button 
                label="Sign Up" 
                text
                @click="navigateTo('/get-started')"
                class="text-link-button"
              />
            </span>
          </div>
        </div>
      </template>
    </Card>

    <ErrorDialog v-if="errDialog" :errType="'Sign In'" :errMsg="errMsg" @errorClose="errDialog = false" />
  </div>
</template>

<script setup lang="ts">
import Logo from '~/assets/logo-one.svg'

const supabase = useSupabaseClient()
const router = useRouter()
const { redirectToUserDashboard } = useAuth()

const loading = ref(false)
const errDialog = ref(false)
const errMsg = ref('')
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

const fireAuth = async () => {
  // Reset errors
  emailError.value = ''
  passwordError.value = ''
  
  // Basic validation
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      await errored(error.message)
    } else if (data?.user) {
      await confirmed(data.user.id)
    }
  } catch (err) {
    await errored('An unexpected error occurred')
  } finally {
    loading.value = false
  }
}

const userStore = useUserStore()

const confirmed = async (userId: string) => {
  try {
    await userStore.loadUser(userId)

    // Mark user as registered on first sign-in
    const loadedUser = userStore.getUser
    if (loadedUser && !loadedUser.registered) {
      await userStore.updateUser(userId, { registered: true })
    }
    
    // Redirect to user dashboard
    await redirectToUserDashboard()
  } catch (err) {
    console.error('Error in confirmed:', err)
  }
}

const errored = async (message: string) => {
  errMsg.value = message
  errDialog.value = true
}

// Redirect if already authenticated
const { isAuthenticated } = useAuth()
watch(isAuthenticated, (newVal: boolean) => {
  if (newVal) {
    redirectToUserDashboard()
  }
}, { immediate: true })

// Show success message if redirected from password reset
onMounted(() => {
  const route = useRoute()
  if (route.query.passwordReset === 'success') {
    // Could show a toast here if you have a toast system
    console.log('Password reset successful!')
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.login-card {
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

.login-form {
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
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    max-width: 100%;
  }
}
</style>

