export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const store = useUserStore()
    const storeUser = store.getUser

    // Allow public profile pages to be accessed without authentication
    const isPublicProfile = to.path.includes('/profile')
    
    // If no user is authenticated, allow public profile access, otherwise redirect to home
    if (!user.value) {
        if (isPublicProfile) {
            return // Allow access to public profiles
        }
        return navigateTo('/')
    }

    // If user exists but not in store, fetch user data
    if (user.value && !storeUser) {
        try {
            const { data, error } = await supabase
            .from('users')
                .select('*')
            .eq('id', user.value.id)
                .maybeSingle()
            
            if (error) {
                console.error('Error fetching user:', error)
                return navigateTo('/get-started')
            }
            
            if (data) {
                await store.setUser(data as any)
            } else {
                return navigateTo('/get-started')
    }
        } catch (err) {
            console.error('Auth middleware error:', err)
            return navigateTo('/get-started')
        }
    }

    // If user exists but has no type, redirect to onboarding (except when going to /admin — superadmin may have type null)
    if (user.value && storeUser && !storeUser.type) {
        if (to.path === '/admin') {
            return // Let superadmin middleware handle access
        }
        return navigateTo('/get-started')
    }

    // Handle protected routes that require specific user access
    if (to.params.id && storeUser && !isPublicProfile) {
        const userType = storeUser.type as 'vendor' | 'merchant'
        const associatedIdKey = `associated_${userType}_id`
        const userAssociatedId = (storeUser as any)[associatedIdKey]
        
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
  