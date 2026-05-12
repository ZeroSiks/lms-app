<template>
    <div>
        <CommonLoadingScreen />

        <div
            v-if="error"
            class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5"
        >
            {{ error }}
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                </label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                />
            </div>

            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="password" class="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <a href="#" class="text-xs text-[#0000ff] hover:text-[#0000cc] transition-colors">
                        Forgot password?
                    </a>
                </div>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    required
                    placeholder="••••••••"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                />
            </div>

            <button
                type="submit"
                :disabled="loading"
                class="w-full bg-[#0000ff] text-white font-semibold py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors duration-200 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

        </form>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' as any })

interface LoginResponse {
    accessToken: string
    user: { id: number; email: string; firstName: string; lastName: string; role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' }
}

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
    email: '',
    password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
    loading.value = true
    error.value = ''

    try {
        const { accessToken, user } = await $fetch<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: form,
        })

        auth.setAuth(user, accessToken)
        router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        error.value = e.data?.message ?? 'Something went wrong. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>
