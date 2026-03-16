export default defineNuxtRouteMiddleware((to) => {
  // TODO: Implement proper auth check
  // For now, this is a placeholder that redirects to login if not authenticated

  const isAuthenticated = useCookie('auth_token')

  if (!isAuthenticated.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
})
