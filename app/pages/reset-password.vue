<template>
  <div>
    <div v-if="success" class="text-center space-y-4">
      <div class="text-4xl mb-2">&#10003;</div>
      <h3 class="text-lg font-semibold text-gray-900">Password Reset Complete</h3>
      <p class="text-sm text-gray-500">{{ success }}</p>
      <NuxtLink
        to="/login"
        class="mt-4 inline-block text-sm text-[#0000ff] hover:text-[#0000cc] font-medium"
      >
        Go to Sign In &rarr;
      </NuxtLink>
    </div>

    <template v-else>
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5"
      >
        {{ error }}
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <input type="hidden" v-model="token" />

        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            placeholder="At least 8 characters"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#0000ff] text-white font-semibold py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors duration-200 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        <NuxtLink to="/login" class="text-[#0000ff] hover:text-[#0000cc] font-medium">
          Back to Sign In
        </NuxtLink>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' as any })

const route = useRoute()
const token = ref((route.query.token as string) ?? '')
const newPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await $fetch<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, newPassword: newPassword.value },
    })
    success.value = data.message
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    error.value = e.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
