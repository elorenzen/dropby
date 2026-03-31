<template>
  <div class="auth-callback-container">
    <Card class="auth-callback-card">
      <template #content>
        <div class="text-center py-6">
          <p class="text-color-secondary">Completing sign in...</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { redirectToUserDashboard } = useAuth()

const parseHashParams = () => {
  if (!import.meta.client) return new URLSearchParams()
  const hash = window.location.hash || ''
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
}

const toErrorDescription = (value: unknown) => {
  return typeof value === 'string' ? value : 'Unable to process authentication callback.'
}

const routeToForgotPassword = async (description: string) => {
  await router.replace({
    path: '/forgot-password',
    query: {
      error: 'auth_callback_failed',
      error_description: description
    }
  })
}

onMounted(async () => {
  const hashParams = parseHashParams()
  const hashType = hashParams.get('type')
  const hashAccessToken = hashParams.get('access_token')
  const hashRefreshToken = hashParams.get('refresh_token')

  const queryType = typeof route.query.type === 'string' ? route.query.type : null
  const flow = typeof route.query.flow === 'string' ? route.query.flow : null
  const queryCode = typeof route.query.code === 'string' ? route.query.code : null
  const queryError = typeof route.query.error === 'string' ? route.query.error : null
  const queryErrorDescription = route.query.error_description

  const authType = hashType || queryType || null
  const flowWantsPasswordReset = flow === 'invite' || flow === 'recovery'

  if (queryError) {
    await routeToForgotPassword(toErrorDescription(queryErrorDescription || queryError))
    return
  }

  if (hashAccessToken && hashRefreshToken) {
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: hashAccessToken,
      refresh_token: hashRefreshToken
    })

    if (setSessionError) {
      await routeToForgotPassword(setSessionError.message)
      return
    }
  } else if (queryCode) {
    // Supabase processes PKCE/code exchanges automatically in most setups.
    // Give it a moment before evaluating session state.
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user) {
    if (authType === 'invite' || authType === 'recovery' || flowWantsPasswordReset) {
      await routeToForgotPassword('This link is invalid or expired. Please request a new one.')
      return
    }
    await router.replace('/login')
    return
  }

  try {
    await userStore.loadUser(session.user.id)
  } catch {
    await userStore.setUser(null)
  }

  const appUser = userStore.getUser as any
  const mustSetPassword = appUser?.registered === false

  if (flowWantsPasswordReset || authType === 'invite' || authType === 'recovery' || mustSetPassword) {
    await router.replace('/reset-password')
    return
  }

  await redirectToUserDashboard()
})
</script>

<style scoped>
.auth-callback-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-callback-card {
  width: 100%;
  max-width: 420px;
}
</style>
