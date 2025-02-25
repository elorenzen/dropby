export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const store = useUserStore()
    const storeUser = store.getUser

    // if user exists and is signed in, set user data in store
    if (user.value && !storeUser) {
        const { data } = await supabase
            .from('users')
            .select()
            .eq('id', user.value.id)
        if (data && data.length > 0) await store.setUser(data[0])
        else return navigateTo('/onboarding')
    }

    if (user.value && storeUser && !storeUser.type) return navigateTo('/onboarding')

    if (
        user.value &&
        storeUser &&
        // Restrict users from accessing other vendors, merchants
        (to.params.id == storeUser[`associated_${storeUser.type}_id`])
    ) {
        return
    }
    return navigateTo('/')
  })
  