<template>
    <div class="min-h-screen flex" role="main">

        <!-- Left panel — branding (desktop only) -->
        <div
            class="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-[#020B2D] via-[#0A2472] to-[#0033CC] flex-col justify-between p-12"
        >
            <!-- Dot grid -->
            <div class="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
            <!-- Orbs -->
            <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#0000ff] opacity-20 blur-3xl" />
            <div class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#0033cc] opacity-25 blur-3xl" />

            <!-- Top: logo -->
            <NuxtLink to="/" class="relative text-2xl font-extrabold text-white tracking-tight">
                Lumify<span class="text-[#0000ff]">.</span>
            </NuxtLink>

            <!-- Middle: headline + bullets -->
            <div class="relative">
                <h2 class="text-4xl font-bold text-white leading-tight mb-4">
                    Your gateway to<br />
                    <span class="text-blue-300">academic excellence.</span>
                </h2>
                <p class="text-blue-200 text-sm mb-10">
                    Join thousands of students and instructors on a platform
                    built for serious learning.
                </p>
                <ul class="space-y-4">
                    <li
                        v-for="item in benefits"
                        :key="item"
                        class="flex items-center gap-3 text-blue-100 text-sm"
                    >
                        <span class="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                            <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                        {{ item }}
                    </li>
                </ul>
            </div>

            <!-- Bottom: tagline -->
            <p class="relative text-blue-400 text-xs">Learn Today. Lead Tomorrow.</p>
        </div>

        <!-- Right panel — form -->
        <div class="flex-1 flex flex-col justify-center py-12 px-6 sm:px-10 lg:px-16 bg-white">

            <!-- Mobile logo -->
            <div class="lg:hidden text-center mb-8">
                <NuxtLink to="/" class="text-2xl font-extrabold text-[#020B2D] tracking-tight">Lumify<span class="text-[#0000ff]">.</span></NuxtLink>
            </div>

            <div class="max-w-md w-full mx-auto">
                <h1 class="text-2xl font-bold text-gray-900 mb-1">
                    <slot name="title">Sign in to your account</slot>
                </h1>
                <p class="text-sm text-gray-500 mb-8">
                    <slot name="subtitle">Welcome back. Enter your details below.</slot>
                </p>

                <slot />

                <p v-if="$route.path === '/login'" class="text-sm text-gray-500 text-center mt-8">
                    Don't have an account?
                    <NuxtLink to="/register" class="text-[#0000ff] font-medium hover:text-[#0000cc] transition-colors">
                        Register here
                    </NuxtLink>
                </p>
                <p v-else-if="$route.path === '/register'" class="text-sm text-gray-500 text-center mt-8">
                    Already have an account?
                    <NuxtLink to="/login" class="text-[#0000ff] font-medium hover:text-[#0000cc] transition-colors">
                        Login here
                    </NuxtLink>
                </p>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
const benefits = [
    'Access hundreds of courses anytime, anywhere',
    'Track your progress and earn certificates',
    'Connect with expert instructors',
]
</script>

<style scoped>
.dot-grid {
    background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.4) 1px,
        transparent 1px
    );
    background-size: 28px 28px;
}
</style>
