<template>
    <div class="p-6 space-y-6">

        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-[#020B2D] via-[#0A2472] to-[#0033CC] rounded-2xl p-6 text-white relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div class="absolute bottom-0 left-1/3 w-64 h-64 bg-white rounded-full translate-y-1/2"></div>
            </div>
            <div class="relative flex items-start justify-between">
                <div>
                    <p class="text-white/60 text-sm font-medium">{{ greeting }},</p>
                    <h1 class="text-2xl font-bold mt-0.5">{{ user?.firstName }} {{ user?.lastName }}</h1>
                    <p class="text-white/70 text-sm mt-2 max-w-sm">{{ roleMessage }}</p>
                    <div class="flex items-center gap-2 mt-4">
                        <div class="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-xs font-medium">
                            <Flame class="w-3.5 h-3.5 text-orange-400" />
                            <span>{{ streak }} day streak</span>
                        </div>
                        <div class="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-xs font-medium">
                            <Calendar class="w-3.5 h-3.5 text-blue-300" />
                            <span>{{ today }}</span>
                        </div>
                    </div>
                </div>
                <div class="hidden md:block">
                    <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <GraduationCap class="w-8 h-8 text-white/80" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', stat.iconBg]">
                        <component :is="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
                    </div>
                    <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', stat.badgeBg, stat.badgeColor]">
                        {{ stat.badge }}
                    </span>
                </div>
                <p class="text-2xl font-bold text-gray-900">
                    <span v-if="dashLoading" class="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse"></span>
                    <span v-else>{{ stat.value }}</span>
                </p>
                <p class="text-sm text-gray-500 mt-0.5">{{ stat.label }}</p>
            </div>
        </div>

        <!-- Main Grid -->
        <div class="grid lg:grid-cols-3 gap-6">

            <!-- Courses section (2 cols) -->
            <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-base font-semibold text-gray-900">
                        {{ user?.role === 'INSTRUCTOR' ? 'My Courses' : 'Enrolled Courses' }}
                    </h2>
                    <NuxtLink :to="user?.role === 'INSTRUCTOR' ? '/instructor/courses' : '/courses'" class="text-xs text-[#0000ff] font-medium hover:underline">
                        {{ user?.role === 'INSTRUCTOR' ? 'Manage courses' : 'Browse courses' }}
                    </NuxtLink>
                </div>

                <div v-if="dashLoading" class="bg-white rounded-xl p-8 border border-gray-100 text-center">
                    <div class="w-6 h-6 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>

                <!-- Student: no enrollments -->
                <div v-else-if="user?.role === 'STUDENT' && studentData?.courses.length === 0 && (studentData?.enrolledCount ?? 0) === 0"
                    class="bg-white rounded-xl p-10 border border-gray-100 shadow-sm text-center">
                    <div class="w-14 h-14 bg-[#0000ff]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen class="w-7 h-7 text-[#0000ff]" />
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">No enrolled courses yet</h3>
                    <p class="text-xs text-gray-400 mb-5">Browse available courses and apply to get started.</p>
                    <NuxtLink to="/courses" class="inline-flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors">
                        Enroll Now →
                    </NuxtLink>
                </div>

                <!-- Course cards -->
                <div v-else class="space-y-3">
                    <NuxtLink
                        v-for="course in displayCourses"
                        :key="course.id"
                        :to="`/courses/${course.id}`"
                        class="block bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0000ff]/20 transition-all duration-200"
                    >
                        <div class="flex items-start gap-4">
                            <div :style="{ background: course.color }" class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BookOpen class="w-6 h-6 text-white" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 class="font-semibold text-gray-900 text-sm leading-snug">{{ course.title }}</h3>
                                        <p class="text-xs text-gray-400 mt-0.5">
                                            {{ course.code }}
                                            <template v-if="course.instructor"> &bull; {{ course.instructor }}</template>
                                        </p>
                                    </div>
                                    <span class="text-xs font-bold text-gray-900 flex-shrink-0">{{ course.progress }}%</span>
                                </div>
                                <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full transition-all duration-700" :style="{ width: course.progress + '%', background: course.color }"></div>
                                </div>
                                <div class="flex items-center justify-between mt-2">
                                    <span class="text-xs text-gray-400">{{ course.completedLessons }}/{{ course.totalLessons }} lessons</span>
                                </div>
                            </div>
                        </div>
                    </NuxtLink>

                    <!-- Instructor: no courses assigned yet -->
                    <div v-if="user?.role === 'INSTRUCTOR' && displayCourses.length === 0" class="bg-white rounded-xl p-10 border border-gray-100 text-center">
                        <BookOpen class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p class="text-sm font-medium text-gray-500">No courses assigned yet</p>
                        <p class="text-xs text-gray-400 mt-1">Contact an admin to be assigned to a course.</p>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">

                <!-- Learning Streak (students only) -->
                <div v-if="user?.role === 'STUDENT'" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4">
                        <Flame class="w-5 h-5 text-orange-500" />
                        <h3 class="font-semibold text-gray-900 text-sm">Learning Streak</h3>
                    </div>
                    <div class="text-center mb-4">
                        <span class="text-4xl font-black text-[#0000ff]">{{ streak }}</span>
                        <p class="text-xs text-gray-400 mt-0.5">consecutive days</p>
                    </div>
                    <div class="grid grid-cols-7 gap-1.5">
                        <div v-for="(day, i) in weekDays" :key="day" class="flex flex-col items-center gap-1.5">
                            <div :class="['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all', i < streak && streak <= 7 ? 'bg-[#0000ff] text-white shadow-md shadow-[#0000ff]/30' : i === todayIndex ? 'bg-[#0000ff]/15 text-[#0000ff] ring-2 ring-[#0000ff]/30' : 'bg-gray-100 text-gray-300']">
                                <Check v-if="i < streak && streak <= 7" class="w-3.5 h-3.5" />
                                <span v-else>{{ day[0] }}</span>
                            </div>
                            <span class="text-[10px] text-gray-400">{{ day }}</span>
                        </div>
                    </div>
                    <p class="text-center text-xs text-gray-500 mt-4 font-medium">{{ streakMessage }}</p>
                </div>

                <!-- Upcoming Deadlines / Pending Submissions (instructors) -->
                <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4">
                        <ClipboardList class="w-5 h-5 text-[#0000ff]" />
                        <h3 class="font-semibold text-gray-900 text-sm">
                            {{ user?.role === 'INSTRUCTOR' ? 'Pending Reviews' : 'Upcoming Deadlines' }}
                        </h3>
                    </div>

                    <div v-if="dashLoading" class="py-4 text-center">
                        <div class="w-5 h-5 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>

                    <!-- Student deadlines -->
                    <div v-else-if="user?.role === 'STUDENT'" class="space-y-2.5">
                        <div v-if="!studentData?.upcomingAssignments?.length" class="text-xs text-gray-400 text-center py-4">
                            No upcoming deadlines.
                        </div>
                        <div v-for="a in studentData?.upcomingAssignments" :key="a.id"
                            class="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <div :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', daysLeft(a.dueDate) <= 2 ? 'bg-red-500' : 'bg-[#0000ff]']"></div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-800 leading-snug">{{ a.title }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ a.Module.Course.code }} &bull; Due {{ formatDate(a.dueDate) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Instructor pending submissions -->
                    <div v-else class="space-y-2.5">
                        <div v-if="!instructorData?.pendingReviews" class="text-xs text-gray-400 text-center py-4">
                            No pending submissions.
                        </div>
                        <div v-else class="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                            <div class="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ClipboardList class="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-orange-800">{{ instructorData?.pendingReviews }} submission{{ instructorData?.pendingReviews !== 1 ? 's' : '' }}</p>
                                <p class="text-xs text-orange-600 mt-0.5">Awaiting your grade</p>
                            </div>
                        </div>
                        <NuxtLink to="/instructor/courses" class="block text-center text-xs text-[#0000ff] font-medium py-2 hover:underline">
                            Review now →
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Flame, Calendar, GraduationCap, BookOpen, ClipboardList, Activity, Check, CheckCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const now = new Date()
const hours = now.getHours()
const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening'
const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const todayIndex = (now.getDay() + 6) % 7
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface StudentDashboard {
    streak: number
    totalCompleted: number
    enrolledCount: number
    courses: { id: number; title: string; code: string; instructor: string | null; progress: number; completedLessons: number; totalLessons: number; color: string }[]
    upcomingAssignments: { id: number; title: string; dueDate: string; maxPoints: number; Module: { Course: { title: string; code: string } } }[]
}

interface InstructorDashboard {
    totalStudents: number
    totalCourses: number
    publishedCourses: number
    pendingReviews: number
    courses: { id: number; title: string; code: string; isPublished: boolean; students: number; totalLessons: number; pendingSubmissions: number }[]
}

const studentData = ref<StudentDashboard | null>(null)
const instructorData = ref<InstructorDashboard | null>(null)
const dashLoading = ref(true)

onMounted(async () => {
    if (user.value?.role === 'STUDENT') {
        try { studentData.value = await $fetch<StudentDashboard>('/api/student/dashboard') } catch {}
    } else if (user.value?.role === 'INSTRUCTOR') {
        try { instructorData.value = await $fetch<InstructorDashboard>('/api/instructor/dashboard') } catch {}
    }
    dashLoading.value = false
})

const streak = computed(() => studentData.value?.streak ?? 0)

const streakMessage = computed(() => {
    const s = streak.value
    if (s === 0) return 'Complete a lesson today to start your streak!'
    if (s >= 7) return 'Perfect week! Amazing dedication!'
    if (s >= 5) return `${7 - s} more day${7 - s !== 1 ? 's' : ''} for a perfect week!`
    return `Keep going — you're building momentum!`
})

const colors = ['#0000ff', '#0033CC', '#0A2472', '#7C3AED', '#059669']

const displayCourses = computed(() => {
    if (user.value?.role === 'INSTRUCTOR') {
        return (instructorData.value?.courses ?? []).map((c, i) => ({
            id: c.id, title: c.title, code: c.code, instructor: null,
            progress: 0, completedLessons: 0, totalLessons: c.totalLessons,
            color: colors[i % colors.length],
        }))
    }
    return studentData.value?.courses ?? []
})

const roleMessage = computed(() => {
    if (user.value?.role === 'INSTRUCTOR') {
        const p = instructorData.value?.pendingReviews ?? 0
        const c = instructorData.value?.totalCourses ?? 0
        return p > 0 ? `You have ${p} submission${p !== 1 ? 's' : ''} to review.` : c > 0 ? `Managing ${c} course${c !== 1 ? 's' : ''}.` : 'Welcome! Contact an admin to get assigned to a course.'
    }
    const enrolled = studentData.value?.enrolledCount ?? 0
    if (enrolled > 0) return `You're enrolled in ${enrolled} course${enrolled !== 1 ? 's' : ''}. Keep it up!`
    return 'Browse courses and enroll to start learning.'
})

const statCards = computed(() => {
    if (user.value?.role === 'INSTRUCTOR') {
        return [
            { label: 'Courses Teaching', value: String(instructorData.value?.totalCourses ?? '—'), badge: 'Total', icon: BookOpen, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]', badgeBg: 'bg-blue-50', badgeColor: 'text-[#0000ff]' },
            { label: 'Active Students', value: String(instructorData.value?.totalStudents ?? '—'), badge: 'Enrolled', icon: GraduationCap, iconBg: 'bg-green-50', iconColor: 'text-green-600', badgeBg: 'bg-green-50', badgeColor: 'text-green-600' },
            { label: 'Pending Reviews', value: String(instructorData.value?.pendingReviews ?? '—'), badge: 'Due soon', icon: ClipboardList, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badgeBg: 'bg-orange-50', badgeColor: 'text-orange-500' },
            { label: 'Published Courses', value: String(instructorData.value?.publishedCourses ?? '—'), badge: 'Live', icon: Activity, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600' },
        ]
    }
    const enrolled = studentData.value?.enrolledCount ?? 0
    const completed = studentData.value?.totalCompleted ?? 0
    const due = studentData.value?.upcomingAssignments?.length ?? 0
    return [
        { label: 'Enrolled Courses', value: String(enrolled), badge: enrolled > 0 ? 'Active' : 'None yet', icon: BookOpen, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]', badgeBg: 'bg-blue-50', badgeColor: 'text-[#0000ff]' },
        { label: 'Lessons Completed', value: String(completed), badge: 'Total', icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600', badgeBg: 'bg-green-50', badgeColor: 'text-green-600' },
        { label: 'Day Streak', value: String(streak.value), badge: streak.value > 0 ? 'Active' : 'Start today', icon: Flame, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badgeBg: 'bg-orange-50', badgeColor: 'text-orange-500' },
        { label: 'Assignments Due', value: String(due), badge: due > 0 ? 'This week' : 'All clear', icon: ClipboardList, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600' },
    ]
})

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
</script>
