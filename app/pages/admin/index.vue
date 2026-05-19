<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">System Overview</h1>
                <p class="text-sm text-gray-400 mt-0.5">{{ today }} &bull; Logged in as {{ user?.firstName }} {{ user?.lastName }}</p>
            </div>
            <div class="flex items-center gap-2 bg-[#0000ff]/8 text-[#0000ff] px-3 py-1.5 rounded-full text-xs font-semibold">
                <ShieldCheck class="w-3.5 h-3.5" />
                Administrator
            </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', stat.iconBg]">
                        <component :is="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">
                    <span v-if="loadingStats" class="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse"></span>
                    <span v-else>{{ stat.value }}</span>
                </p>
                <p class="text-sm text-gray-500 mt-0.5">{{ stat.label }}</p>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-3 gap-6">

            <!-- Pending Approvals (2 cols) -->
            <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <h2 class="text-base font-semibold text-gray-900">Pending Account Approvals</h2>
                        <span v-if="pendingCount > 0" class="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {{ pendingCount }}
                        </span>
                    </div>
                    <NuxtLink to="/admin/approvals" class="text-xs text-[#0000ff] font-medium hover:underline">
                        View all
                    </NuxtLink>
                </div>

                <div v-if="loadingApprovals" class="bg-white rounded-xl p-8 border border-gray-100 text-center">
                    <div class="w-6 h-6 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>

                <div v-else-if="pendingUsers.length === 0" class="bg-white rounded-xl p-8 border border-gray-100 text-center">
                    <CheckCircle class="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p class="text-sm font-medium text-gray-700">All caught up!</p>
                    <p class="text-xs text-gray-400 mt-1">No pending approval requests.</p>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="req in pendingUsers.slice(0, 3)"
                        :key="req.id"
                        class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-[#0000ff]/20 transition-colors"
                    >
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {{ req.firstName[0] }}{{ req.lastName[0] }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <p class="font-semibold text-gray-900 text-sm">{{ req.firstName }} {{ req.lastName }}</p>
                                        <p class="text-xs text-gray-400 mt-0.5">{{ req.email }}</p>
                                    </div>
                                    <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0', req.role === 'INSTRUCTOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#0000ff]']">
                                        {{ req.role }}
                                    </span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock class="w-3 h-3" />
                                    Requested {{ formatDate(req.createdAt) }}
                                </p>
                                <div class="flex items-center gap-2 mt-3">
                                    <button @click="approve(req.id)" :disabled="actionLoading === req.id"
                                        class="flex items-center gap-1.5 bg-[#0000ff] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-50">
                                        <Check class="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button @click="reject(req.id)" :disabled="actionLoading === req.id"
                                        class="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                        <X class="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <NuxtLink v-if="pendingCount > 3" to="/admin/approvals"
                        class="block text-center text-sm text-[#0000ff] font-medium py-3 bg-white rounded-xl border border-gray-100 hover:border-[#0000ff]/20 transition-colors">
                        View {{ pendingCount - 3 }} more pending requests →
                    </NuxtLink>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm self-start">
                <h3 class="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h3>
                <div class="space-y-2">
                    <NuxtLink v-for="action in quickActions" :key="action.label" :to="action.to"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', action.iconBg]">
                            <component :is="action.icon" :class="['w-4 h-4', action.iconColor]" />
                        </div>
                        <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ action.label }}</span>
                        <ChevronRight class="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-400" />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Activity Log -->
        <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <FileBarChart class="w-5 h-5 text-[#0000ff]" />
                    <h3 class="font-semibold text-gray-900 text-sm">Recent Activity</h3>
                </div>
                <NuxtLink to="/admin/activity" class="text-xs text-[#0000ff] font-medium hover:underline">View all</NuxtLink>
            </div>

            <div v-if="loadingActivity" class="py-6 text-center">
                <div class="w-6 h-6 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>

            <div v-else-if="activityEvents.length === 0" class="py-6 text-center text-sm text-gray-400">No activity yet.</div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-100">
                            <th class="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Event</th>
                            <th class="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
                            <th class="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                            <th class="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="log in activityEvents.slice(0, 5)" :key="log.id" class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-3">
                                <div class="flex items-center gap-2.5">
                                    <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', iconBg(log.type)]">
                                        <component :is="iconFor(log.type)" class="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span class="text-gray-800 font-medium">{{ log.event }}</span>
                                </div>
                            </td>
                            <td class="py-3 px-3 text-gray-500">{{ log.user }}</td>
                            <td class="py-3 px-3">
                                <span :class="statusCls(log.statusType)">{{ log.status }}</span>
                            </td>
                            <td class="py-3 px-3 text-gray-400 text-xs">{{ formatTime(log.time) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
    ShieldCheck, Users, GraduationCap, BookOpen, UserCheck, Clock,
    Check, X, FileBarChart, ChevronRight, BookMarked,
    PlusCircle, CheckCircle, UserPlus, Activity,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

interface PendingUser {
    id: number
    firstName: string
    lastName: string
    email: string
    role: 'STUDENT' | 'INSTRUCTOR'
    createdAt: string
}

interface Stats {
    totalStudents: number
    totalInstructors: number
    activeCourses: number
    totalPending: number
}

interface ActivityEvent {
    id: string
    type: string
    event: string
    user: string
    detail: string
    status: string
    statusType: string
    time: string
}

const pendingUsers = ref<PendingUser[]>([])
const loadingApprovals = ref(true)
const actionLoading = ref<number | null>(null)
const pendingCount = computed(() => pendingUsers.value.length)

const stats = ref<Stats | null>(null)
const loadingStats = ref(true)

const activityEvents = ref<ActivityEvent[]>([])
const loadingActivity = ref(true)

const statCards = computed(() => [
    { label: 'Total Students', value: stats.value?.totalStudents ?? '—', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]' },
    { label: 'Instructors', value: stats.value?.totalInstructors ?? '—', icon: GraduationCap, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Active Courses', value: stats.value?.activeCourses ?? '—', icon: BookOpen, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Pending Approvals', value: stats.value?.totalPending ?? '—', icon: UserCheck, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
])

const quickActions = [
    { label: 'Manage Courses', to: '/admin/courses', icon: BookMarked, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]' },
    { label: 'View Students', to: '/admin/students', icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'View Instructors', to: '/admin/instructors', icon: GraduationCap, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Review Approvals', to: '/admin/approvals', icon: UserCheck, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
]

const fetchPending = async () => {
    loadingApprovals.value = true
    try {
        pendingUsers.value = await $fetch<PendingUser[]>('/api/admin/pending-users')
    } finally {
        loadingApprovals.value = false
    }
}

const fetchStats = async () => {
    loadingStats.value = true
    try {
        stats.value = await $fetch<Stats>('/api/admin/stats')
    } finally {
        loadingStats.value = false
    }
}

const fetchActivity = async () => {
    loadingActivity.value = true
    try {
        activityEvents.value = await $fetch<ActivityEvent[]>('/api/admin/activity')
    } finally {
        loadingActivity.value = false
    }
}

onMounted(() => {
    fetchPending()
    fetchStats()
    fetchActivity()
})

const approve = async (id: number) => {
    actionLoading.value = id
    try {
        await $fetch(`/api/admin/users/${id}/approve`, { method: 'POST' })
        pendingUsers.value = pendingUsers.value.filter(u => u.id !== id)
    } finally {
        actionLoading.value = null
    }
}

const reject = async (id: number) => {
    actionLoading.value = id
    try {
        await $fetch(`/api/admin/users/${id}/reject`, { method: 'POST' })
        pendingUsers.value = pendingUsers.value.filter(u => u.id !== id)
    } finally {
        actionLoading.value = null
    }
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const iconFor = (type: string) => {
    if (type === 'enrollment') return BookOpen
    if (type === 'course') return PlusCircle
    return UserPlus
}

const iconBg = (type: string) => {
    if (type === 'enrollment') return 'bg-[#0000ff]'
    if (type === 'course') return 'bg-green-500'
    return 'bg-purple-500'
}

const statusCls = (statusType: string) => {
    const base = 'text-xs font-semibold px-2 py-0.5 rounded-full'
    if (statusType === 'success') return `${base} bg-green-50 text-green-600`
    if (statusType === 'error') return `${base} bg-red-50 text-red-600`
    if (statusType === 'warning') return `${base} bg-orange-50 text-orange-600`
    return `${base} bg-blue-50 text-[#0000ff]`
}
</script>
