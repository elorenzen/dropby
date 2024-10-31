export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()
    const userStore = useUserStore()
    console.log('to: ', to)
    console.log('from: ', from)
    console.log('user: ', userStore.getUser)
    if (user.value) {
        return
    }
    return navigateTo('/')
  })
  