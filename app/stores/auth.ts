import { defineStore } from 'pinia'

interface AuthUser {
    id: number
    email: string
    firstName: string
    lastName: string
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

export const useAuthStore = defineStore('auth', () => {
    const userCookie = useCookie<AuthUser | null>('lms_user', {
        default: () => null,
        maxAge: 60 * 60 * 24 * 7,
    })
    const tokenCookie = useCookie<string | null>('lms_token', {
        default: () => null,
        maxAge: 60 * 60 * 15,
    })

    const user = computed(() => userCookie.value)
    const accessToken = computed(() => tokenCookie.value)
    const isLoggedIn = computed(() => !!userCookie.value)
    const isAdmin = computed(() => userCookie.value?.role === 'ADMIN')

    function setAuth(userData: AuthUser, token: string) {
        userCookie.value = userData
        tokenCookie.value = token
    }

    async function logout() {
        await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        userCookie.value = null
        tokenCookie.value = null
    }

    return { user, accessToken, isLoggedIn, isAdmin, setAuth, logout }
})
