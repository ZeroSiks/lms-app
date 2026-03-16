<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <NuxtLink
                            to="/"
                            class="text-xl font-bold text-indigo-600"
                        >
                            LMS
                        </NuxtLink>
                    </div>

                    <!-- Nav Links -->
                    <div class="flex items-center space-x-4">
                        <NuxtLink
                            to="/courses"
                            class="text-gray-600 hover:text-gray-900"
                        >
                            Courses
                        </NuxtLink>

                        <template v-if="user">
                            <NuxtLink
                                to="/dashboard"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Dashboard
                            </NuxtLink>
                            <NuxtLink
                                v-if="user.role === 'ADMIN'"
                                to="/admin"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Admin
                            </NuxtLink>
                            <button
                                @click="logout"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </template>

                        <template v-else>
                            <NuxtLink
                                to="/login"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Login
                            </NuxtLink>
                            <NuxtLink
                                to="/register"
                                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Register
                            </NuxtLink>
                        </template>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const user = ref(null);

const logout = () => {
    // TODO: Implement logout
};
</script>
