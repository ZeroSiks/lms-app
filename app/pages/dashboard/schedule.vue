<template>
    <div class="p-6 space-y-6">

        <div>
            <h1 class="text-xl font-bold text-gray-900">Schedule</h1>
            <p class="text-sm text-gray-400 mt-0.5">Upcoming assignments and deadlines</p>
        </div>

        <div v-if="loading" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <template v-else>
            <!-- No upcoming -->
            <div v-if="upcoming.length === 0 && overdue.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <Calendar class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-base font-semibold text-gray-700">All clear!</p>
                <p class="text-sm text-gray-400 mt-1">No upcoming deadlines at the moment.</p>
            </div>

            <!-- Overdue -->
            <div v-if="overdue.length > 0">
                <h2 class="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                    <AlertCircle class="w-4 h-4" /> Overdue ({{ overdue.length }})
                </h2>
                <div class="space-y-3">
                    <NuxtLink v-for="a in overdue" :key="a.id" :to="`/courses/${a.Module.Course.id}/assignments/${a.id}`"
                        class="flex items-center gap-4 bg-red-50 border border-red-100 rounded-xl p-4 hover:border-red-200 transition-colors">
                        <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ClipboardList class="w-5 h-5 text-red-500" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900">{{ a.title }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ a.Module.Course.code }} &bull; Was due {{ formatDate(a.dueDate) }}</p>
                        </div>
                        <span class="text-xs font-semibold text-red-600">Overdue</span>
                    </NuxtLink>
                </div>
            </div>

            <!-- Upcoming grouped by week -->
            <div v-if="upcoming.length > 0">
                <h2 class="text-sm font-semibold text-gray-700 mb-3">Upcoming</h2>
                <div class="space-y-3">
                    <NuxtLink v-for="a in upcoming" :key="a.id" :to="`/courses/${a.Module.Course.id}/assignments/${a.id}`"
                        class="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-[#0000ff]/20 hover:shadow-md transition-all duration-200">
                        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', daysLeft(a.dueDate) <= 2 ? 'bg-orange-50' : 'bg-[#0000ff]/8']">
                            <ClipboardList :class="['w-5 h-5', daysLeft(a.dueDate) <= 2 ? 'text-orange-500' : 'text-[#0000ff]']" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900">{{ a.title }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ a.Module.Course.code }} &bull; {{ a.maxPoints }} pts</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p :class="['text-xs font-semibold', daysLeft(a.dueDate) <= 2 ? 'text-orange-500' : 'text-gray-600']">{{ formatDate(a.dueDate) }}</p>
                            <p class="text-xs text-gray-400 mt-0.5">{{ daysLeft(a.dueDate) }}d left</p>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import { Calendar, ClipboardList, AlertCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface Assignment {
    id: number; title: string; dueDate: string; maxPoints: number
    Module: { id: number; Course: { id: number; title: string; code: string } }
    Submission: { status: string }[]
}

const assignments = ref<Assignment[]>([])
const loading = ref(true)

onMounted(async () => {
    try { assignments.value = await $fetch<Assignment[]>('/api/student/assignments') } finally { loading.value = false }
})

const upcoming = computed(() => assignments.value.filter(a => new Date(a.dueDate) >= new Date() && !a.Submission[0]))
const overdue = computed(() => assignments.value.filter(a => new Date(a.dueDate) < new Date() && !a.Submission[0]))

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
</script>
