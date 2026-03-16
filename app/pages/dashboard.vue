<template>
    <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <!-- Welcome Message -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-900">
                Welcome back, {{ user?.firstName || "User" }}!
            </h2>
            <p class="text-gray-600 mt-1">Role: {{ user?.role || "N/A" }}</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-2xl font-bold text-indigo-600">
                    {{ enrolledCourses.length }}
                </div>
                <div class="text-gray-600">Enrolled Courses</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-2xl font-bold text-green-600">
                    {{ completedLessons }}
                </div>
                <div class="text-gray-600">Lessons Completed</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <div class="text-2xl font-bold text-yellow-600">
                    {{ pendingAssignments }}
                </div>
                <div class="text-gray-600">Pending Assignments</div>
            </div>
        </div>

        <!-- My Courses -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">My Courses</h3>

            <div v-if="enrolledCourses.length > 0" class="space-y-4">
                <div
                    v-for="course in enrolledCourses"
                    :key="course.id"
                    class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                >
                    <NuxtLink :to="`/courses/${course.id}`" class="block">
                        <h4 class="font-medium text-gray-900">
                            {{ course.title }}
                        </h4>
                        <p class="text-sm text-gray-600 mt-1">
                            {{ course.code }}
                        </p>
                    </NuxtLink>
                </div>
            </div>

            <div v-else class="text-center py-8">
                <p class="text-gray-600">
                    You haven't enrolled in any courses yet.
                </p>
                <NuxtLink
                    to="/courses"
                    class="inline-block mt-4 text-indigo-600 hover:text-indigo-700"
                >
                    Browse Courses
                </NuxtLink>
            </div>
        </div>

        <!-- For Instructors: My Teaching Courses -->
        <div
            v-if="user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'"
            class="bg-white rounded-lg shadow p-6 mt-8"
        >
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                    My Teaching Courses
                </h3>
                <NuxtLink
                    to="/admin/courses/new"
                    class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                >
                    Create Course
                </NuxtLink>
            </div>

            <div v-if="teachingCourses.length > 0" class="space-y-4">
                <div
                    v-for="course in teachingCourses"
                    :key="course.id"
                    class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                >
                    <NuxtLink :to="`/courses/${course.id}`" class="block">
                        <h4 class="font-medium text-gray-900">
                            {{ course.title }}
                        </h4>
                        <p class="text-sm text-gray-600 mt-1">
                            {{ course.code }}
                        </p>
                    </NuxtLink>
                </div>
            </div>

            <div v-else class="text-center py-8">
                <p class="text-gray-600">
                    You haven't created any courses yet.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: "auth",
});

const user = ref(null);
const enrolledCourses = ref([]);
const teachingCourses = ref([]);
const completedLessons = ref(0);
const pendingAssignments = ref(0);

// TODO: Fetch user data and stats from API
</script>
