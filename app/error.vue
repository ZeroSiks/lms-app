<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="text-center max-w-md">
      <div class="text-6xl mb-4 text-gray-300">
        <svg class="w-20 h-20 mx-auto text-[#0000ff]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p class="text-gray-500 mb-6">
        {{ error?.message || 'An unexpected error occurred. Please try again.' }}
      </p>
      <div class="flex gap-3 justify-center">
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center px-4 py-2 bg-[#0000ff] text-white text-sm font-medium rounded-lg hover:bg-[#0000cc] transition-colors"
        >
          Go to Dashboard
        </NuxtLink>
        <button
          @click="handleError"
          class="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

useHead({
  bodyAttrs: {
    style: 'background-color: #f9fafb'
  }
})
</script>
