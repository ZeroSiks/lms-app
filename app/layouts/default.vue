<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200 sticky top-0 z-50" role="navigation" aria-label="Main">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <NuxtLink
                            to="/"
                            class="text-xl font-extrabold text-[#020B2D] tracking-tight"
                        >
                            Lumify<span class="text-[#0000ff]">.</span>
                        </NuxtLink>
                    </div>

                    <!-- Nav Links -->
                    <div class="flex items-center space-x-4">
                        <NuxtLink
                            to="/courses"
                            class="text-gray-600 hover:text-[#0000ff] transition text-sm font-medium"
                        >
                            Courses
                        </NuxtLink>

                        <template v-if="user">
                            <NuxtLink
                                to="/dashboard"
                                class="text-gray-600 hover:text-[#0000ff] transition text-sm font-medium"
                            >
                                Dashboard
                            </NuxtLink>
                            <NuxtLink
                                v-if="user.role === 'ADMIN'"
                                to="/admin"
                                class="text-gray-600 hover:text-[#0000ff] transition text-sm font-medium"
                            >
                                Admin
                            </NuxtLink>
                            <button
                                @click="logout"
                                class="text-gray-600 hover:text-[#0000ff] transition text-sm font-medium"
                            >
                                Logout
                            </button>
                        </template>

                        <template v-else>
                            <NuxtLink
                                to="/login"
                                class="text-gray-600 hover:text-[#0000ff] transition text-sm font-medium"
                            >
                                Login
                            </NuxtLink>
                            <NuxtLink
                                to="/register"
                                class="bg-[#0000ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0000cc] transition"
                            >
                                Register
                            </NuxtLink>
                        </template>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
interface AuthUser {
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}

const user = ref<AuthUser | null>(null)

const logout = () => {
    // TODO: Implement logout
}

useHead({
  bodyAttrs: {
    style: 'background-color: #f9fafb'
  }
})
</script>
