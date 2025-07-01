export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const store = useUserStore()
    const storeUser = store.getUser

    // Define user interface for type safety
    interface User {
        id: string
        type?: 'vendor' | 'merchant'
        associated_vendor_id?: string
        associated_merchant_id?: string
        [key: string]: any
    }

    // If no user is authenticated, redirect to home
    if (!user.value) {
        return navigateTo('/')
    }

    // If user exists but not in store, fetch user data
    if (user.value && !storeUser) {
        try {
            const { data, error } = await supabase
            .from('users')
                .select('*')
            .eq('id', user.value.id)
                .single()
            
            if (error) {
                console.error('Error fetching user:', error)
                return navigateTo('/get-started')
            }
            
            if (data) {
                await store.setUser(data as User)
            } else {
                return navigateTo('/get-started')
    }
        } catch (err) {
            console.error('Auth middleware error:', err)
            return navigateTo('/get-started')
        }
    }

    // If user exists but has no type, redirect to onboarding
    if (user.value && storeUser && !storeUser.type) {
        return navigateTo('/get-started')
    }

    // Handle protected routes that require specific user access
    if (to.params.id && storeUser) {
        const userType = storeUser.type as 'vendor' | 'merchant'
        const associatedIdKey = `associated_${userType}_id` as keyof User
        const userAssociatedId = storeUser[associatedIdKey]
        
        // Allow access if user is accessing their own profile
        if (to.params.id === userAssociatedId) {
        return
    }
        
        // For now, redirect to home if trying to access someone else's profile
        // In the future, you might want to allow public profile viewing
    return navigateTo('/')
    }

    // Allow access to public routes
    return
  })
  