export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userStore = useUserStore()
  const subscriptionStore = useSubscriptionStore()
  const recurringEventStore = useRecurringEventStore()
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

  // Check if user is superadmin
  const isSuperadmin = computed(() => {
    return userStore.isSuperadmin
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
      if (userStore.isSuperadmin) {
        await router.push('/admin')
        return
      }
      await router.push('/get-started')
      return
    }

    const associatedIdKey = `associated_${currentUserData.type}_id` as keyof typeof currentUserData
    const userAssociatedId = currentUserData[associatedIdKey]
    
    if (userAssociatedId) {
      // Try to load subscription, but don't fail if none exists (user might be on free tier)
      try {
        await subscriptionStore.setActiveSubscription(userAssociatedId as string, currentUserData.type as 'merchant' | 'vendor')
      } catch (error) {
        // Subscription loading failed - that's OK, user might not have one
        console.log('No active subscription found, user is on free tier')
      }
      
      // Load recurring events if user is a merchant
      if (currentUserData.type === 'merchant') {
        try {
          await recurringEventStore.setAllRecurringEventsByMerchantId(userAssociatedId as string)
        } catch (error) {
          console.log('Error loading recurring events:', error)
        }
      }
      
      await router.push(`/${currentUserData.type}/${userAssociatedId}/dashboard`)
    } else {
      await router.push('/get-started')
    }
  }

  return {
    isAuthenticated,
    currentUser,
    userType,
    isSuperadmin,
    signOut,
    canAccess,
    redirectToUserDashboard
  }
} 