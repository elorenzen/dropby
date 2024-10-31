export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const userStore = useUserStore()

    if (user.value) {
        const { data } = await supabase
            .from('users')
            .select()
            .eq('id', user.value.id)
        await userStore.fetchUser(data && data.length > 0 ? data[0] : '')
    }

    const storeUser = userStore.getUser

    if (
        user.value &&
        storeUser &&
        (to.params.id == storeUser[`associated_${storeUser.type}_id`])
    ) {
        return
    }
    return navigateTo('/')
  })
  