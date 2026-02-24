export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const store = useUserStore()
  const user = store.getUser

  if (!user) {
    return navigateTo('/')
  }

  if (user.is_superadmin !== true) {
    return navigateTo('/')
  }
})
