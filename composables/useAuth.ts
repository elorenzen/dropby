export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userStore = useUserStore()
  const router = useRouter()

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!user.value && !!userStore.getUser
  })

  // Get current user with proper typing
  const currentUser = computed(() => {
    return userStore.getUser
  })

  // Get user type
  const userType = computed(() => {
    return userStore.userType
  })

  // Sign out user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return { error }
      }
      
      // Clear user store
      await userStore.clearUser()
      
      // Redirect to home
      await router.push('/')
      
      return { success: true }
    } catch (err) {
      console.error('Sign out error:', err)
      return { error: err }
    }
  }

  // Check if user can access a specific route
  const canAccess = (routeId: string, requiredType?: 'vendor' | 'merchant') => {
    if (!isAuthenticated.value) return false
    
    const currentUserData = currentUser.value
    if (!currentUserData) return false

    // If type is required, check if user matches
    if (requiredType && currentUserData.type !== requiredType) return false

    // Check if user is accessing their own profile
    const associatedIdKey = `associated_${currentUserData.type}_id` as keyof typeof currentUserData
    const userAssociatedId = currentUserData[associatedIdKey]
    
    return routeId === userAssociatedId
  }

  // Redirect based on user type
  const redirectToUserDashboard = async () => {
    if (!isAuthenticated.value) {
      await router.push('/')
      return
    }

    const currentUserData = currentUser.value
    if (!currentUserData?.type) {
      await router.push('/get-started')
      return
    }

    const associatedIdKey = `associated_${currentUserData.type}_id` as keyof typeof currentUserData
    const userAssociatedId = currentUserData[associatedIdKey]
    
    if (userAssociatedId) {
      await router.push(`/${currentUserData.type}/${userAssociatedId}`)
    } else {
      await router.push('/get-started')
    }
  }

  return {
    isAuthenticated,
    currentUser,
    userType,
    signOut,
    canAccess,
    redirectToUserDashboard
  }
} 