<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Instructors</h1>
                <p class="text-sm text-gray-400 mt-0.5">Manage all instructor accounts</p>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span class="bg-gray-100 px-2.5 py-1 rounded-full">{{ users.length }} total</span>
                <span class="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full" v-if="pendingCount > 0">{{ pendingCount }} pending</span>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by name or email..."
                    class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                />
            </div>
            <div class="flex gap-2">
                <button
                    v-for="tab in statusTabs"
                    :key="tab.value"
                    @click="statusFilter = tab.value"
                    :class="[
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        statusFilter === tab.value
                            ? 'bg-[#0000ff] text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    ]"
                >{{ tab.label }}</button>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-sm text-gray-400 mt-3">Loading instructors...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <GraduationCap class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-base font-semibold text-gray-700">No instructors found</p>
            <p class="text-sm text-gray-400 mt-1">{{ searchQuery || statusFilter ? 'Try adjusting your filters.' : 'No instructors have registered yet.' }}</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Instructor</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Courses</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                        <th class="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="u in filtered" :key="u.id" class="hover:bg-gray-50/50 transition-colors">
                        <td class="py-4 px-5">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {{ u.firstName[0] }}{{ u.lastName[0] }}
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">{{ u.firstName }} {{ u.lastName }}</p>
                                    <p class="text-xs text-gray-400 mt-0.5">{{ u.email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-5">
                            <span :class="statusBadge(u.status).cls">{{ statusBadge(u.status).label }}</span>
                        </td>
                        <td class="py-4 px-5">
                            <button @click="openCoursesModal(u)" class="text-sm text-[#0000ff] font-medium hover:underline">
                                {{ u._count.Course }} course{{ u._count.Course !== 1 ? 's' : '' }}
                            </button>
                        </td>
                        <td class="py-4 px-5 text-sm text-gray-500">{{ formatDate(u.createdAt) }}</td>
                        <td class="py-4 px-5">
                            <div class="flex items-center justify-end gap-2">
                                <template v-if="(u.status as string) === 'PENDING'">
                                    <button @click="approve(u.id)" :disabled="actionId === u.id" class="flex items-center gap-1 bg-[#0000ff] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-50">
                                        <Check class="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button @click="reject(u.id)" :disabled="actionId === u.id" class="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                        <X class="w-3.5 h-3.5" /> Reject
                                    </button>
                                </template>
                                <template v-else-if="(u.status as string) === 'ACTIVE'">
                                    <button @click="deactivate(u.id)" :disabled="actionId === u.id" class="flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50">
                                        <Ban class="w-3.5 h-3.5" /> Deactivate
                                    </button>
                                </template>
                                <template v-else>
                                    <span class="text-xs text-gray-400">—</span>
                                </template>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                <p class="text-xs text-gray-400">Showing {{ filtered.length }} of {{ users.length }} instructor{{ users.length !== 1 ? 's' : '' }}</p>
            </div>
        </div>

        <!-- Assigned Courses Modal -->
        <Teleport to="body">
            <div v-if="coursesModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="coursesModal = null">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-base font-bold text-gray-900">Assigned Courses</h2>
                            <p class="text-xs text-gray-400 mt-0.5">{{ coursesModal.firstName }} {{ coursesModal.lastName }}</p>
                        </div>
                        <button @click="coursesModal = null" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                    <div v-if="loadingCourses" class="py-8 text-center">
                        <div class="w-6 h-6 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                    <div v-else-if="instructorCourses.length === 0" class="py-8 text-center text-sm text-gray-400">No courses assigned yet.</div>
                    <div v-else class="space-y-2 max-h-72 overflow-y-auto">
                        <div v-for="c in instructorCourses" :key="c.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ c.title }}</p>
                                <p class="text-xs text-gray-400 font-mono">{{ c.code }}</p>
                            </div>
                            <span class="text-xs text-gray-500">{{ c._count.Enrollment }} students</span>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
import { Search, GraduationCap, Check, X, Ban } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    status: string
    createdAt: string
    _count: { Enrollment: number; Course: number }
}

interface Course {
    id: number
    title: string
    code: string
    duration: string | null
    isPublished: boolean
    _count: { Enrollment: number }
}

const users = ref<User[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const actionId = ref<number | null>(null)

const coursesModal = ref<User | null>(null)
const instructorCourses = ref<Course[]>([])
const loadingCourses = ref(false)

const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Rejected', value: 'REJECTED' },
]

const pendingCount = computed(() => users.value.filter(u => (u.status as string) === 'PENDING').length)

const filtered = computed(() => {
    let result = users.value
    if (statusFilter.value) result = result.filter(u => (u.status as string) === statusFilter.value)
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(u =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
    }
    return result
})

const fetchUsers = async () => {
    loading.value = true
    try {
        users.value = await $fetch<User[]>('/api/admin/users', { query: { role: 'INSTRUCTOR' } })
    } finally {
        loading.value = false
    }
}

onMounted(fetchUsers)

const approve = async (id: number) => {
    actionId.value = id
    try {
        await $fetch(`/api/admin/users/${id}/approve`, { method: 'POST' })
        const u = users.value.find(x => x.id === id)
        if (u) u.status = 'ACTIVE'
    } finally {
        actionId.value = null
    }
}

const reject = async (id: number) => {
    actionId.value = id
    try {
        await $fetch(`/api/admin/users/${id}/reject`, { method: 'POST' })
        const u = users.value.find(x => x.id === id)
        if (u) u.status = 'REJECTED'
    } finally {
        actionId.value = null
    }
}

const deactivate = async (id: number) => {
    if (!confirm('Deactivate this instructor account? They will no longer be able to log in.')) return
    actionId.value = id
    try {
        await $fetch(`/api/admin/users/${id}/deactivate`, { method: 'POST' })
        const u = users.value.find(x => x.id === id)
        if (u) u.status = 'REJECTED'
    } finally {
        actionId.value = null
    }
}

const openCoursesModal = async (u: User) => {
    coursesModal.value = u
    loadingCourses.value = true
    instructorCourses.value = []
    try {
        instructorCourses.value = await $fetch<Course[]>(`/api/admin/users/${u.id}/courses`)
    } finally {
        loadingCourses.value = false
    }
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const statusBadge = (status: string) => {
    const s = status as string
    if (s === 'ACTIVE') return { label: 'Active', cls: 'text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600' }
    if (s === 'PENDING') return { label: 'Pending', cls: 'text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600' }
    return { label: 'Rejected', cls: 'text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600' }
}
</script>
