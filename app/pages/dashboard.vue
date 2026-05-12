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
                    <p class="text-white/70 text-sm mt-2 max-w-sm">
                        {{ roleMessage }}
                    </p>
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
                <div class="hidden md:block text-right">
                    <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <GraduationCap class="w-8 h-8 text-white/80" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', stat.iconBg]">
                        <component :is="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
                    </div>
                    <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', stat.badgeBg, stat.badgeColor]">
                        {{ stat.change }}
                    </span>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                <p class="text-sm text-gray-500 mt-0.5">{{ stat.label }}</p>
            </div>
        </div>

        <!-- Main Grid -->
        <div class="grid lg:grid-cols-3 gap-6">

            <!-- Courses (spans 2 cols) -->
            <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-base font-semibold text-gray-900">
                        {{ user?.role === 'INSTRUCTOR' ? 'Courses I Teach' : 'My Enrolled Courses' }}
                    </h2>
                    <NuxtLink to="/courses" class="text-xs text-[#0000ff] font-medium hover:underline">View all</NuxtLink>
                </div>

                <div class="space-y-3">
                    <div
                        v-for="course in courses"
                        :key="course.id"
                        class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0000ff]/20 transition-all duration-200 cursor-pointer"
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
                                            {{ course.code }} &bull;
                                            {{ user?.role === 'INSTRUCTOR' ? course.students + ' students enrolled' : course.instructor }}
                                        </p>
                                    </div>
                                    <span class="text-xs font-bold text-gray-900 flex-shrink-0">{{ course.progress }}%</span>
                                </div>
                                <!-- Progress bar -->
                                <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        class="h-full rounded-full transition-all duration-700"
                                        :style="{ width: course.progress + '%', background: course.color }"
                                    ></div>
                                </div>
                                <div class="flex items-center justify-between mt-2">
                                    <span class="text-xs text-gray-400">{{ course.completedModules }}/{{ course.totalModules }} modules</span>
                                    <span class="text-xs font-medium text-orange-500 flex items-center gap-1">
                                        <Clock class="w-3 h-3" />
                                        Due {{ course.nextDeadline }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">

                <!-- Learning Streak — Innovative Feature -->
                <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4">
                        <Flame class="w-5 h-5 text-orange-500" />
                        <h3 class="font-semibold text-gray-900 text-sm">Learning Streak</h3>
                    </div>
                    <div class="text-center mb-4">
                        <span class="text-4xl font-black text-[#0000ff]">{{ streak }}</span>
                        <p class="text-xs text-gray-400 mt-0.5">consecutive days</p>
                    </div>
                    <!-- Week grid -->
                    <div class="grid grid-cols-7 gap-1.5">
                        <div v-for="(day, i) in weekDays" :key="day" class="flex flex-col items-center gap-1.5">
                            <div
                                :class="[
                                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                                    i < streak && streak <= 7
                                        ? 'bg-[#0000ff] text-white shadow-md shadow-[#0000ff]/30'
                                        : i === todayIndex
                                        ? 'bg-[#0000ff]/15 text-[#0000ff] ring-2 ring-[#0000ff]/30'
                                        : 'bg-gray-100 text-gray-300'
                                ]"
                            >
                                <Check v-if="i < streak && streak <= 7" class="w-3.5 h-3.5" />
                                <span v-else>{{ day[0] }}</span>
                            </div>
                            <span class="text-[10px] text-gray-400">{{ day }}</span>
                        </div>
                    </div>
                    <p class="text-center text-xs text-gray-500 mt-4 font-medium">
                        {{ streakMessage }}
                    </p>
                </div>

                <!-- Upcoming Deadlines -->
                <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4">
                        <ClipboardList class="w-5 h-5 text-[#0000ff]" />
                        <h3 class="font-semibold text-gray-900 text-sm">Upcoming Deadlines</h3>
                    </div>
                    <div class="space-y-3">
                        <div
                            v-for="item in deadlines"
                            :key="item.id"
                            class="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                        >
                            <div :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', item.urgent ? 'bg-red-500' : 'bg-[#0000ff]']"></div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-800 leading-snug">{{ item.task }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ item.course }} &bull; {{ item.due }}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
                <Activity class="w-5 h-5 text-[#0000ff]" />
                <h3 class="font-semibold text-gray-900 text-sm">Recent Activity</h3>
            </div>
            <div class="space-y-0 divide-y divide-gray-50">
                <div
                    v-for="item in activityFeed"
                    :key="item.id"
                    class="flex items-center gap-4 py-3"
                >
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', item.iconBg]">
                        <component :is="item.icon" class="w-4 h-4 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-800 font-medium">{{ item.text }}</p>
                        <p class="text-xs text-gray-400">{{ item.time }}</p>
                    </div>
                    <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', item.tagBg, item.tagColor]">
                        {{ item.tag }}
                    </span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
    Flame, Calendar, GraduationCap, BookOpen, Clock, ClipboardList,
    Activity, Check, CheckCircle, Send, Play, MessageSquare,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const now = new Date()
const hours = now.getHours()
const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening'
const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const todayIndex = (now.getDay() + 6) % 7 // Mon=0

const roleMessage = computed(() =>
    user.value?.role === 'INSTRUCTOR'
        ? 'You have 2 assignments to review and 1 pending student question.'
        : "You have 2 upcoming deadlines this week. Keep up the great work!"
)

const streak = ref(5)
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const streakMessage = computed(() => {
    if (streak.value >= 7) return '🔥 Perfect week! Amazing dedication!'
    if (streak.value >= 5) return `${7 - streak.value} more days for a perfect week!`
    return `Keep going — you're building momentum!`
})

const stats = computed(() => {
    if (user.value?.role === 'INSTRUCTOR') {
        return [
            { label: 'Courses Teaching', value: '3', change: '+1 new', icon: BookOpen, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]', badgeBg: 'bg-blue-50', badgeColor: 'text-[#0000ff]' },
            { label: 'Total Students', value: '87', change: '+12', icon: GraduationCap, iconBg: 'bg-green-50', iconColor: 'text-green-600', badgeBg: 'bg-green-50', badgeColor: 'text-green-600' },
            { label: 'Pending Reviews', value: '6', change: 'Due soon', icon: ClipboardList, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badgeBg: 'bg-orange-50', badgeColor: 'text-orange-500' },
            { label: 'Avg. Completion', value: '74%', change: '+5%', icon: Activity, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600' },
        ]
    }
    return [
        { label: 'Enrolled Courses', value: '3', change: 'Active', icon: BookOpen, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]', badgeBg: 'bg-blue-50', badgeColor: 'text-[#0000ff]' },
        { label: 'Lessons Completed', value: '19', change: '+3 this week', icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600', badgeBg: 'bg-green-50', badgeColor: 'text-green-600' },
        { label: 'Study Hours', value: '47h', change: 'This month', icon: Clock, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badgeBg: 'bg-orange-50', badgeColor: 'text-orange-500' },
        { label: 'Assignments Due', value: '3', change: 'This week', icon: ClipboardList, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600' },
    ]
})

const courses = computed(() => {
    const base = [
        { id: 1, title: 'Introduction to Computer Science', code: 'CS101', instructor: 'Dr. Ahmed Hassan', students: 34, progress: 72, totalModules: 12, completedModules: 8, nextDeadline: 'May 15', color: '#0000ff' },
        { id: 2, title: 'Data Structures & Algorithms', code: 'CS201', instructor: 'Prof. Sarah Chen', students: 28, progress: 45, totalModules: 10, completedModules: 4, nextDeadline: 'May 18', color: '#0033CC' },
        { id: 3, title: 'Web Development Fundamentals', code: 'WD101', instructor: 'Mr. James Wilson', students: 25, progress: 90, totalModules: 8, completedModules: 7, nextDeadline: 'May 20', color: '#0A2472' },
    ]
    return base
})

const deadlines = [
    { id: 1, course: 'CS101', task: 'Final Project Submission', due: 'May 15, 2026', urgent: true },
    { id: 2, course: 'CS201', task: 'Assignment 4 — Sorting Algorithms', due: 'May 18, 2026', urgent: false },
    { id: 3, course: 'WD101', task: 'Portfolio Website Build', due: 'May 20, 2026', urgent: false },
]

const activityFeed = [
    { id: 1, text: 'Completed Module 8: Binary Trees in CS201', time: '2 hours ago', icon: CheckCircle, iconBg: 'bg-green-500', tag: 'Completed', tagBg: 'bg-green-50', tagColor: 'text-green-600' },
    { id: 2, text: 'Submitted Assignment 3 in CS101', time: '1 day ago', icon: Send, iconBg: 'bg-[#0000ff]', tag: 'Submitted', tagBg: 'bg-blue-50', tagColor: 'text-[#0000ff]' },
    { id: 3, text: 'Started Week 7: Responsive Design in WD101', time: '2 days ago', icon: Play, iconBg: 'bg-purple-500', tag: 'Started', tagBg: 'bg-purple-50', tagColor: 'text-purple-600' },
    { id: 4, text: 'Received feedback on Project 2 from Dr. Hassan', time: '3 days ago', icon: MessageSquare, iconBg: 'bg-orange-500', tag: 'Feedback', tagBg: 'bg-orange-50', tagColor: 'text-orange-500' },
]
</script>
