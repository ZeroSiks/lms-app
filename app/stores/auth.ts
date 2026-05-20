import { defineStore } from 'pinia'
import { $fetch as ofetch } from 'ofetch'

interface AuthUser {
    id: number
    email: string
    firstName: string
    lastName: string
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

export const useAuthStore = defineStore('auth', () => {

    // ====================
    //       State
    // ====================

    const userCookie = useCookie<AuthUser | null>('lms_user', {
        default: () => null,
        maxAge: 60 * 60 * 24 * 7,
    })
    const tokenCookie = useCookie<string | null>('lms_token', {
        default: () => null,
        maxAge: 60 * 60 * 15,
    })

    // ====================
    //      Computed
    // ====================

    const user = computed(() => userCookie.value)
    const accessToken = computed(() => tokenCookie.value)
    const isLoggedIn = computed(() => !!userCookie.value)
    const isAdmin = computed(() => userCookie.value?.role === 'ADMIN')

    // ====================
    //       Actions
    // ====================

    function setAuth(userData: AuthUser, token: string) {
        userCookie.value = userData
        tokenCookie.value = token
    }

    async function refreshToken(): Promise<boolean> {
        try {
            const res = await ofetch<{ accessToken: string }>('/api/auth/refresh', { method: 'POST' })
            tokenCookie.value = res.accessToken
            return true
        } catch {
            return false
        }
    }

    async function fetchWithAuth<T>(url: string, options: Record<string, unknown> = {}): Promise<T> {
        try {
            return await ofetch<T>(url, options)
        } catch (err: unknown) {
            const e = err as { status?: number; statusCode?: number }
            if (e?.status === 401 || e?.statusCode === 401) {
                const ok = await refreshToken()
                if (ok) return ofetch<T>(url, options)
                await logout()
                await navigateTo('/login')
                throw err
            }
            throw err
        }
    }

    async function logout() {
        await ofetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        userCookie.value = null
        tokenCookie.value = null
    }

    return { user, accessToken, isLoggedIn, isAdmin, setAuth, logout, refreshToken, fetchWithAuth }
})
