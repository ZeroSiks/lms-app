<template>
    <div class="min-h-screen bg-white">
        <CommonLoadingScreen />
        <nav class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <NuxtLink to="/" class="text-xl font-extrabold text-[#020B2D] tracking-tight">
                        Lumify<span class="text-[#0000ff]">.</span>
                    </NuxtLink>
                    <div class="flex items-center gap-6">
                        <NuxtLink
                            to="/courses"
                            class="text-sm font-medium text-gray-600 hover:text-[#0000ff] transition-colors duration-200"
                        >
                            Courses
                        </NuxtLink>
                        <NuxtLink
                            to="/login"
                            class="text-sm font-medium text-gray-600 hover:text-[#0000ff] transition-colors duration-200"
                        >
                            Login
                        </NuxtLink>
                        <NuxtLink
                            to="/register"
                            class="text-sm font-medium bg-[#0000ff] text-white px-4 py-2 rounded-lg hover:bg-[#0000cc] transition-colors duration-200"
                        >
                            Register
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </nav>
        <main role="main">
            <slot />
        </main>
    </div>
</template>
