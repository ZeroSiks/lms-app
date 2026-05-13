<template>
    <div class="p-6 space-y-6">

        <div>
            <h1 class="text-xl font-bold text-gray-900">My Progress</h1>
            <p class="text-sm text-gray-400 mt-0.5">Track your learning journey across all courses</p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-24">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else>
            <!-- Summary stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="stat in summaryStats" :key="stat.label" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.iconBg]">
                        <component :is="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
                    </div>
                    <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                    <p class="text-sm text-gray-500 mt-0.5">{{ stat.label }}</p>
                </div>
            </div>

            <!-- Empty state -->
            <div v-if="!data || data.courses.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <BarChart2 class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-base font-semibold text-gray-700">No progress data yet</p>
                <p class="text-sm text-gray-400 mt-1">Enroll in courses and complete lessons to see your progress here.</p>
                <NuxtLink to="/courses" class="inline-flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors mt-5">
                    Browse Courses
                </NuxtLink>
            </div>

            <!-- Per-course progress -->
            <div v-else class="space-y-4">
                <h2 class="text-base font-semibold text-gray-900">Course Progress</h2>
                <div v-for="course in data.courses" :key="course.id" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ course.title }}</h3>
                            <p class="text-xs text-gray-400 mt-0.5">{{ course.code }}<template v-if="course.instructor"> &bull; {{ course.instructor }}</template></p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <span class="text-2xl font-black text-[#0000ff]">{{ course.progress }}%</span>
                        </div>
                    </div>
                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div class="h-full rounded-full transition-all duration-700" :style="{ width: course.progress + '%', background: course.color }"></div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-400">
                        <span>{{ course.completedLessons }} of {{ course.totalLessons }} lessons completed</span>
                        <span v-if="course.progress === 100" class="text-green-600 font-semibold flex items-center gap-1">
                            <CheckCircle class="w-3.5 h-3.5" /> Complete
                        </span>
                        <NuxtLink v-else :to="`/courses/${course.id}`" class="text-[#0000ff] font-medium hover:underline">
                            Continue →
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Streak section -->
            <div v-if="data" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <Flame class="w-5 h-5 text-orange-500" />
                    <h3 class="font-semibold text-gray-900 text-sm">Learning Streak</h3>
                    <span class="text-2xl font-black text-[#0000ff] ml-auto">{{ data.streak }}</span>
                    <span class="text-xs text-gray-400">days</span>
                </div>
                <p class="text-xs text-gray-500">{{ streakMessage }}</p>
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import { BookOpen, CheckCircle, Flame, BarChart2 } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface StudentDashboard {
    streak: number; totalCompleted: number; enrolledCount: number
    courses: { id: number; title: string; code: string; instructor: string | null; progress: number; completedLessons: number; totalLessons: number; color: string }[]
}

const data = ref<StudentDashboard | null>(null)
const loading = ref(true)

onMounted(async () => {
    try { data.value = await $fetch<StudentDashboard>('/api/student/dashboard') } finally { loading.value = false }
})

const summaryStats = computed(() => [
    { label: 'Enrolled Courses', value: String(data.value?.enrolledCount ?? 0), icon: BookOpen, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]' },
    { label: 'Lessons Completed', value: String(data.value?.totalCompleted ?? 0), icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Courses Completed', value: String(data.value?.courses.filter(c => c.progress === 100).length ?? 0), icon: BarChart2, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Day Streak', value: String(data.value?.streak ?? 0), icon: Flame, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
])

const streakMessage = computed(() => {
    const s = data.value?.streak ?? 0
    if (s === 0) return 'Complete a lesson today to start your streak!'
    if (s >= 7) return 'Amazing! You\'ve been learning every day this week.'
    return `${s} consecutive days of learning. Keep it up!`
})
</script>
