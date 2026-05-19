<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Activity Log</h1>
                <p class="text-sm text-gray-400 mt-0.5">Real-time system events and user activity</p>
            </div>
            <button
                @click="fetchActivity"
                :disabled="loading"
                class="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                <RefreshCw :class="['w-4 h-4', loading && 'animate-spin']" />
                Refresh
            </button>
        </div>

        <!-- Filter -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-2 flex-wrap">
            <button
                v-for="tab in typeTabs"
                :key="tab.value"
                @click="typeFilter = tab.value"
                :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    typeFilter === tab.value
                        ? 'bg-[#0000ff] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                ]"
            >{{ tab.label }}</button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-sm text-gray-400 mt-3">Loading activity...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <Activity class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-base font-semibold text-gray-700">No activity found</p>
            <p class="text-sm text-gray-400 mt-1">No events match the current filter.</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Event</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">User / Target</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Detail</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="log in filtered" :key="log.id" class="hover:bg-gray-50/50 transition-colors">
                        <td class="py-3.5 px-5">
                            <div class="flex items-center gap-2.5">
                                <div :class="['w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', iconBg(log.type)]">
                                    <component :is="iconFor(log.type)" class="w-3.5 h-3.5 text-white" />
                                </div>
                                <span class="text-sm font-medium text-gray-800">{{ log.event }}</span>
                            </div>
                        </td>
                        <td class="py-3.5 px-5 text-sm text-gray-700 font-medium">{{ log.user }}</td>
                        <td class="py-3.5 px-5 text-sm text-gray-400">{{ log.detail }}</td>
                        <td class="py-3.5 px-5">
                            <span :class="statusCls(log.statusType)">{{ log.status }}</span>
                        </td>
                        <td class="py-3.5 px-5 text-xs text-gray-400">{{ formatTime(log.time) }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                <p class="text-xs text-gray-400">Showing {{ filtered.length }} events</p>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { Activity, RefreshCw, UserPlus, BookOpen, GraduationCap } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

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

const events = ref<ActivityEvent[]>([])
const loading = ref(true)
const typeFilter = ref('')

const typeTabs = [
    { label: 'All Events', value: '' },
    { label: 'Registrations', value: 'registration' },
    { label: 'Enrollments', value: 'enrollment' },
    { label: 'Courses', value: 'course' },
]

const filtered = computed(() => {
    if (!typeFilter.value) return events.value
    return events.value.filter(e => e.type === typeFilter.value)
})

const fetchActivity = async () => {
    loading.value = true
    try {
        events.value = await $fetch<ActivityEvent[]>('/api/admin/activity')
    } finally {
        loading.value = false
    }
}

onMounted(fetchActivity)

const iconFor = (type: string) => {
    if (type === 'enrollment') return BookOpen
    if (type === 'course') return GraduationCap
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

const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
