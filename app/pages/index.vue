<template>
    <div>
        <!-- Hero Section -->
        <div class="text-center py-16">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                Welcome to LMS
            </h1>
            <p class="text-xl text-gray-600 mb-8">
                Your Learning Management System
            </p>
            <div class="space-x-4">
                <NuxtLink
                    to="/courses"
                    class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                >
                    Browse Courses
                </NuxtLink>
                <NuxtLink
                    to="/register"
                    class="inline-block bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50"
                >
                    Get Started
                </NuxtLink>
            </div>
        </div>

        <!-- Features Section -->
        <div class="grid md:grid-cols-3 gap-8 mt-16">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Learn Online
                </h3>
                <p class="text-gray-600">
                    Access courses from anywhere, anytime.
                </p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Track Progress
                </h3>
                <p class="text-gray-600">Monitor your learning journey.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Get Certified
                </h3>
                <p class="text-gray-600">Earn certificates upon completion.</p>
            </div>
        </div>
    </div>
</template>
