<template>
    <div
        class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
        <div class="max-w-md w-full space-y-8">
            <!-- Logo -->
            <div class="text-center">
                <NuxtLink to="/" class="text-3xl font-bold text-indigo-600">
                    LMS
                </NuxtLink>
                <h2 class="mt-6 text-2xl font-bold text-gray-900">
                    <slot name="title">Sign in to your account</slot>
                </h2>
            </div>

            <!-- Form Container -->
            <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <slot />
            </div>

            <!-- Footer Links -->
            <div class="text-center">
                <p
                    v-if="$route.path === '/login'"
                    class="text-sm text-gray-600"
                >
                    Don't have an account?
                    <NuxtLink
                        to="/register"
                        class="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Register here
                    </NuxtLink>
                </p>
                <p
                    v-else-if="$route.path === '/register'"
                    class="text-sm text-gray-600"
                >
                    Already have an account?
                    <NuxtLink
                        to="/login"
                        class="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Login here
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>
