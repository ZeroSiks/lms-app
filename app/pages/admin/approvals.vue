<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Approvals</h1>
                <p class="text-sm text-gray-400 mt-0.5">Review account and course enrollment requests</p>
            </div>
            <div class="flex items-center gap-2">
                <span v-if="totalPending > 0" class="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {{ totalPending }} pending
                </span>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                    activeTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                ]"
            >
                {{ tab.label }}
                <span
                    v-if="tab.count > 0"
                    :class="['text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center', activeTab === tab.key ? 'bg-orange-500 text-white' : 'bg-orange-200 text-orange-700']"
                >
                    {{ tab.count }}
                </span>
            </button>
        </div>

        <!-- ======= ACCOUNT APPLICATIONS TAB ======= -->
        <template v-if="activeTab === 'accounts'">

            <!-- Search + Filter -->
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        v-model="accountSearch"
                        type="text"
                        placeholder="Search by name or email..."
                        class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                    />
                </div>
                <div class="flex items-center gap-2">
                    <button
                        v-for="f in roleFilters"
                        :key="f.value"
                        @click="activeRoleFilter = f.value"
                        :class="[
                            'px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                            activeRoleFilter === f.value
                                ? 'bg-[#0000ff] text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        ]"
                    >
                        {{ f.label }}
                    </button>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loadingAccounts" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-sm text-gray-400 mt-3">Loading requests...</p>
            </div>

            <!-- Empty -->
            <div v-else-if="filteredAccounts.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p class="text-base font-semibold text-gray-700">
                    {{ accountSearch || activeRoleFilter !== 'ALL' ? 'No results found' : 'No pending account requests' }}
                </p>
                <p class="text-sm text-gray-400 mt-1">All registration requests have been handled.</p>
            </div>

            <!-- Table -->
            <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table class="w-full">
                    <thead class="border-b border-gray-100 bg-gray-50/50">
                        <tr>
                            <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Applicant</th>
                            <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                            <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Requested</th>
                            <th class="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="req in filteredAccounts" :key="req.id" class="hover:bg-gray-50/50 transition-colors">
                            <td class="py-4 px-5">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {{ req.firstName[0] }}{{ req.lastName[0] }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-gray-900">{{ req.firstName }} {{ req.lastName }}</p>
                                        <p class="text-xs text-gray-400">{{ req.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-5">
                                <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', req.role === 'INSTRUCTOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#0000ff]']">
                                    {{ req.role }}
                                </span>
                            </td>
                            <td class="py-4 px-5 text-sm text-gray-500">{{ formatDate(req.createdAt) }}</td>
                            <td class="py-4 px-5">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="approveAccount(req.id)" :disabled="accountActionLoading === req.id"
                                        class="flex items-center gap-1.5 bg-[#0000ff] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-50">
                                        <Check class="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button @click="rejectAccount(req.id)" :disabled="accountActionLoading === req.id"
                                        class="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                        <X class="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                    <p class="text-xs text-gray-400">
                        Showing {{ filteredAccounts.length }} of {{ pendingUsers.length }} request{{ pendingUsers.length !== 1 ? 's' : '' }}
                    </p>
                </div>
            </div>

        </template>

        <!-- ======= COURSE APPLICATIONS TAB ======= -->
        <template v-else>

            <!-- Search -->
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="relative max-w-sm">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        v-model="enrollSearch"
                        type="text"
                        placeholder="Search by student name or course..."
                        class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                    />
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loadingEnrollments" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-sm text-gray-400 mt-3">Loading requests...</p>
            </div>

            <!-- Empty -->
            <div v-else-if="filteredEnrollments.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p class="text-base font-semibold text-gray-700">
                    {{ enrollSearch ? 'No results found' : 'No pending course applications' }}
                </p>
                <p class="text-sm text-gray-400 mt-1">All course enrollment requests have been handled.</p>
            </div>

            <!-- Table -->
            <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table class="w-full">
                    <thead class="border-b border-gray-100 bg-gray-50/50">
                        <tr>
                            <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</th>
                            <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Course</th>
                            <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Applied</th>
                            <th class="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="req in filteredEnrollments" :key="req.id" class="hover:bg-gray-50/50 transition-colors">
                            <td class="py-4 px-5">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {{ req.User.firstName[0] }}{{ req.User.lastName[0] }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-gray-900">{{ req.User.firstName }} {{ req.User.lastName }}</p>
                                        <p class="text-xs text-gray-400">{{ req.User.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-5">
                                <p class="text-sm font-semibold text-gray-900">{{ req.Course.title }}</p>
                                <p class="text-xs font-mono text-gray-400">{{ req.Course.code }}</p>
                            </td>
                            <td class="py-4 px-5 text-sm text-gray-500">{{ formatDate(req.enrolledAt) }}</td>
                            <td class="py-4 px-5">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="approveEnrollment(req.id)" :disabled="enrollActionLoading === req.id"
                                        class="flex items-center gap-1.5 bg-[#0000ff] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-50">
                                        <Check class="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button @click="rejectEnrollment(req.id)" :disabled="enrollActionLoading === req.id"
                                        class="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                        <X class="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                    <p class="text-xs text-gray-400">
                        Showing {{ filteredEnrollments.length }} of {{ pendingEnrollments.length }} request{{ pendingEnrollments.length !== 1 ? 's' : '' }}
                    </p>
                </div>
            </div>

        </template>

    </div>
</template>

<script setup lang="ts">
import { Search, Check, X, CheckCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface PendingUser {
    id: number
    firstName: string
    lastName: string
    email: string
    role: 'STUDENT' | 'INSTRUCTOR'
    createdAt: string
}

interface PendingEnrollment {
    id: number
    enrolledAt: string
    User: { id: number; firstName: string; lastName: string; email: string }
    Course: { id: number; title: string; code: string }
}

const activeTab = ref<'accounts' | 'courses'>('accounts')

const pendingUsers = ref<PendingUser[]>([])
const loadingAccounts = ref(true)
const accountActionLoading = ref<number | null>(null)
const accountSearch = ref('')
const activeRoleFilter = ref<'ALL' | 'STUDENT' | 'INSTRUCTOR'>('ALL')

const pendingEnrollments = ref<PendingEnrollment[]>([])
const loadingEnrollments = ref(true)
const enrollActionLoading = ref<number | null>(null)
const enrollSearch = ref('')

const roleFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Students', value: 'STUDENT' },
    { label: 'Instructors', value: 'INSTRUCTOR' },
] as const

const tabs = computed(() => [
    { key: 'accounts' as const, label: 'Account Applications', count: pendingUsers.value.length },
    { key: 'courses' as const, label: 'Course Applications', count: pendingEnrollments.value.length },
])

const totalPending = computed(() => pendingUsers.value.length + pendingEnrollments.value.length)

const filteredAccounts = computed(() => {
    let list = pendingUsers.value
    if (activeRoleFilter.value !== 'ALL') list = list.filter(u => u.role === activeRoleFilter.value)
    if (accountSearch.value.trim()) {
        const q = accountSearch.value.toLowerCase()
        list = list.filter(u =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
    }
    return list
})

const filteredEnrollments = computed(() => {
    if (!enrollSearch.value.trim()) return pendingEnrollments.value
    const q = enrollSearch.value.toLowerCase()
    return pendingEnrollments.value.filter(e =>
        e.User.firstName.toLowerCase().includes(q) ||
        e.User.lastName.toLowerCase().includes(q) ||
        e.User.email.toLowerCase().includes(q) ||
        e.Course.title.toLowerCase().includes(q) ||
        e.Course.code.toLowerCase().includes(q)
    )
})

const fetchAccounts = async () => {
    loadingAccounts.value = true
    try {
        pendingUsers.value = await $fetch<PendingUser[]>('/api/admin/pending-users')
    } finally {
        loadingAccounts.value = false
    }
}

const fetchEnrollments = async () => {
    loadingEnrollments.value = true
    try {
        pendingEnrollments.value = await $fetch<PendingEnrollment[]>('/api/admin/enrollments')
    } finally {
        loadingEnrollments.value = false
    }
}

onMounted(() => {
    fetchAccounts()
    fetchEnrollments()
})

const approveAccount = async (id: number) => {
    accountActionLoading.value = id
    try {
        await $fetch(`/api/admin/users/${id}/approve`, { method: 'POST' })
        pendingUsers.value = pendingUsers.value.filter(u => u.id !== id)
    } finally {
        accountActionLoading.value = null
    }
}

const rejectAccount = async (id: number) => {
    accountActionLoading.value = id
    try {
        await $fetch(`/api/admin/users/${id}/reject`, { method: 'POST' })
        pendingUsers.value = pendingUsers.value.filter(u => u.id !== id)
    } finally {
        accountActionLoading.value = null
    }
}

const approveEnrollment = async (id: number) => {
    enrollActionLoading.value = id
    try {
        await $fetch(`/api/admin/enrollments/${id}/approve`, { method: 'POST' })
        pendingEnrollments.value = pendingEnrollments.value.filter(e => e.id !== id)
    } finally {
        enrollActionLoading.value = null
    }
}

const rejectEnrollment = async (id: number) => {
    enrollActionLoading.value = id
    try {
        await $fetch(`/api/admin/enrollments/${id}/reject`, { method: 'POST' })
        pendingEnrollments.value = pendingEnrollments.value.filter(e => e.id !== id)
    } finally {
        enrollActionLoading.value = null
    }
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
</script>
