<template>
    <div>
        <CommonLoadingScreen />

        <div
            v-if="error"
            class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5"
        >
            {{ error }}
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        v-model="form.firstName"
                        type="text"
                        required
                        placeholder="John"
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                    />
                </div>
                <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        v-model="form.lastName"
                        type="text"
                        required
                        placeholder="Doe"
                        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                    />
                </div>
            </div>

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
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                    Password
                </label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    required
                    placeholder="••••••••"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    I am registering as a
                </label>
                <div class="grid grid-cols-2 gap-3 mt-1">
                    <button
                        type="button"
                        @click="form.role = 'STUDENT'"
                        :class="[
                            'py-2.5 px-4 rounded-lg border text-sm font-medium transition-all duration-200',
                            form.role === 'STUDENT'
                                ? 'bg-[#0000ff] text-white border-[#0000ff]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#0000ff] hover:text-[#0000ff]'
                        ]"
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        @click="form.role = 'INSTRUCTOR'"
                        :class="[
                            'py-2.5 px-4 rounded-lg border text-sm font-medium transition-all duration-200',
                            form.role === 'INSTRUCTOR'
                                ? 'bg-[#0000ff] text-white border-[#0000ff]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#0000ff] hover:text-[#0000ff]'
                        ]"
                    >
                        Instructor
                    </button>
                </div>
            </div>

            <button
                type="submit"
                :disabled="loading"
                class="w-full bg-[#0000ff] text-white font-semibold py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors duration-200 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>

        </form>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' as any })

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'INSTRUCTOR',
})

interface RegisterResponse {
    accessToken: string
    user: { id: number; email: string; firstName: string; lastName: string; role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' }
}

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
    loading.value = true
    error.value = ''

    try {
        const { accessToken, user } = await $fetch<RegisterResponse>('/api/auth/register', {
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
