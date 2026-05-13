<template>
    <div class="p-6 space-y-6">

        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Assignments</h1>
                <p class="text-sm text-gray-400 mt-0.5">All assignments across your enrolled courses</p>
            </div>
            <div class="flex gap-2">
                <button v-for="tab in tabs" :key="tab.value" @click="filter = tab.value"
                    :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors', filter === tab.value ? 'bg-[#0000ff] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <div v-if="loading" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <div v-else-if="filtered.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-base font-semibold text-gray-700">{{ filter === 'pending' ? 'No pending assignments' : filter === 'submitted' ? 'No submitted assignments' : 'No assignments yet' }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ filter !== 'all' ? 'Try a different filter.' : 'Enroll in courses to see assignments here.' }}</p>
        </div>

        <div v-else class="space-y-3">
            <NuxtLink
                v-for="a in filtered"
                :key="a.id"
                :to="`/courses/${a.Module.Course.id}/assignments/${a.id}`"
                class="block bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-[#0000ff]/20 hover:shadow-md transition-all duration-200"
            >
                <div class="flex items-start gap-4">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', submissionBg(a.Submission[0]?.status)]">
                        <component :is="submissionIcon(a.Submission[0]?.status)" :class="['w-5 h-5', submissionIconColor(a.Submission[0]?.status)]" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ a.title }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ a.Module.Course.title }} &bull; {{ a.Module.Course.code }}</p>
                            </div>
                            <div class="flex-shrink-0 text-right">
                                <span v-if="a.Submission[0]?.status === 'GRADED'" class="text-sm font-black text-[#0000ff]">
                                    {{ a.Submission[0].grade }}/{{ a.maxPoints }}
                                </span>
                                <span v-else class="text-xs text-gray-400">{{ a.maxPoints }} pts</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 mt-3">
                            <span :class="['flex items-center gap-1.5 text-xs font-medium', isPastDue(a.dueDate) && !a.Submission[0] ? 'text-red-500' : 'text-gray-500']">
                                <Calendar class="w-3.5 h-3.5" />
                                {{ isPastDue(a.dueDate) ? 'Due was' : 'Due' }} {{ formatDate(a.dueDate) }}
                            </span>
                            <span :class="statusBadge(a.Submission[0]?.status, isPastDue(a.dueDate))">
                                {{ statusLabel(a.Submission[0]?.status, isPastDue(a.dueDate)) }}
                            </span>
                        </div>
                    </div>
                </div>
            </NuxtLink>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ClipboardList, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface Assignment {
    id: number; title: string; dueDate: string; maxPoints: number
    Module: { id: number; courseId: number; Course: { id: number; title: string; code: string } }
    Submission: { id: number; status: string; grade: number | null }[]
}

const assignments = ref<Assignment[]>([])
const loading = ref(true)
const filter = ref('all')

const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Graded', value: 'graded' },
]

const filtered = computed(() => {
    if (filter.value === 'pending') return assignments.value.filter(a => !a.Submission[0])
    if (filter.value === 'submitted') return assignments.value.filter(a => a.Submission[0]?.status === 'SUBMITTED')
    if (filter.value === 'graded') return assignments.value.filter(a => a.Submission[0]?.status === 'GRADED')
    return assignments.value
})

onMounted(async () => {
    try { assignments.value = await $fetch<Assignment[]>('/api/student/assignments') } finally { loading.value = false }
})

const isPastDue = (iso: string) => new Date(iso) < new Date()

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const submissionBg = (s?: string) => s === 'GRADED' ? 'bg-green-50' : s === 'SUBMITTED' ? 'bg-blue-50' : 'bg-orange-50'
const submissionIcon = (s?: string) => s === 'GRADED' ? CheckCircle : s === 'SUBMITTED' ? Clock : ClipboardList
const submissionIconColor = (s?: string) => s === 'GRADED' ? 'text-green-500' : s === 'SUBMITTED' ? 'text-[#0000ff]' : 'text-orange-500'

const statusLabel = (s?: string, overdue?: boolean) => s === 'GRADED' ? 'Graded' : s === 'SUBMITTED' ? 'Submitted' : overdue ? 'Overdue' : 'Pending'
const statusBadge = (s?: string, overdue?: boolean) => {
    const base = 'text-xs font-semibold px-2 py-0.5 rounded-full'
    if (s === 'GRADED') return `${base} bg-green-50 text-green-600`
    if (s === 'SUBMITTED') return `${base} bg-blue-50 text-[#0000ff]`
    if (overdue) return `${base} bg-red-50 text-red-600`
    return `${base} bg-orange-50 text-orange-600`
}
</script>
