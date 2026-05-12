export default defineNuxtRouteMiddleware((to) => {
    const auth = useAuthStore()

    if (!auth.isLoggedIn) {
        return navigateTo('/login')
    }

    if (to.path.startsWith('/admin') && auth.user?.role !== 'ADMIN') {
        return navigateTo('/dashboard')
    }

    if (to.path === '/dashboard' && auth.user?.role === 'ADMIN') {
        return navigateTo('/admin')
    }
})
