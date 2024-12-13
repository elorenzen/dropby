export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const userStore = useUserStore()

    // if user exists and is signed in, set user data in store
    if (user.value) {
        const { data } = await supabase
            .from('users')
            .select()
            .eq('id', user.value.id)
        await userStore.setUser(data && data.length > 0 ? data[0] : '')
    }

    const storeUser = userStore.getUser

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
  