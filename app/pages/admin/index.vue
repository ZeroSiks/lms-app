<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">System Overview</h1>
                <p class="text-sm text-gray-400 mt-0.5">{{ today }} &bull; Logged in as Super Admin</p>
            </div>
            <div class="flex items-center gap-2 bg-[#0000ff]/8 text-[#0000ff] px-3 py-1.5 rounded-full text-xs font-semibold">
                <ShieldCheck class="w-3.5 h-3.5" />
                Administrator
            </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="stat in adminStats" :key="stat.label" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
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

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-3 gap-6">

            <!-- Pending Approvals — Primary Action Area (2 cols) -->
            <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <h2 class="text-base font-semibold text-gray-900">Pending Account Approvals</h2>
                        <span class="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {{ pendingApprovals.length }}
                        </span>
                    </div>
                    <span class="text-xs text-gray-400">Requires your action</span>
                </div>

                <div class="space-y-3">
                    <div
                        v-for="req in pendingApprovals"
                        :key="req.id"
                        class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-[#0000ff]/20 transition-colors"
                    >
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {{ req.name.split(' ').map((n: string) => n[0]).join('') }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <p class="font-semibold text-gray-900 text-sm">{{ req.name }}</p>
                                        <p class="text-xs text-gray-400 mt-0.5">{{ req.email }}</p>
                                    </div>
                                    <div class="flex items-center gap-1.5 flex-shrink-0">
                                        <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', req.role === 'INSTRUCTOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#0000ff]']">
                                            {{ req.role }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 mt-3">
                                    <span class="text-xs text-gray-400 flex items-center gap-1">
                                        <BookOpen class="w-3 h-3" />
                                        {{ req.program }}
                                    </span>
                                    <span class="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock class="w-3 h-3" />
                                        {{ req.requestedAt }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 mt-4">
                                    <button class="flex items-center gap-1.5 bg-[#0000ff] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#0000cc] transition-colors">
                                        <Check class="w-3.5 h-3.5" />
                                        Approve
                                    </button>
                                    <button class="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                        <X class="w-3.5 h-3.5" />
                                        Reject
                                    </button>
                                    <button class="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">

                <!-- Quick Actions -->
                <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 class="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h3>
                    <div class="space-y-2">
                        <button
                            v-for="action in quickActions"
                            :key="action.label"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', action.iconBg]">
                                <component :is="action.icon" :class="['w-4 h-4', action.iconColor]" />
                            </div>
                            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ action.label }}</span>
                            <ChevronRight class="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-400" />
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Recent Activity Log -->
        <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <FileBarChart class="w-5 h-5 text-[#0000ff]" />
                    <h3 class="font-semibold text-gray-900 text-sm">Recent Activity Log</h3>
                </div>
                <span class="text-xs text-[#0000ff] font-medium cursor-pointer hover:underline">View full log</span>
            </div>
            <div class="overflow-x-auto">
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
                        <tr v-for="log in activityLog" :key="log.id" class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-3">
                                <div class="flex items-center gap-2.5">
                                    <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', log.iconBg]">
                                        <component :is="log.icon" class="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span class="text-gray-800 font-medium">{{ log.event }}</span>
                                </div>
                            </td>
                            <td class="py-3 px-3 text-gray-500">{{ log.user }}</td>
                            <td class="py-3 px-3">
                                <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', log.statusBg, log.statusColor]">
                                    {{ log.status }}
                                </span>
                            </td>
                            <td class="py-3 px-3 text-gray-400 text-xs">{{ log.time }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import {
    ShieldCheck, Users, GraduationCap, BookOpen, UserCheck, Clock,
    Check, X, FileBarChart, ChevronRight, BookMarked,
    LogIn, Trash2, Plus, PlusCircle,
} from 'lucide-vue-next'

// layout type updates in .nuxt after next nuxt prepare / dev server start
definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const adminStats = [
    { label: 'Total Students', value: '247', change: '+12 this month', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]', badgeBg: 'bg-blue-50', badgeColor: 'text-[#0000ff]' },
    { label: 'Instructors', value: '32', change: '+2 this month', icon: GraduationCap, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600' },
    { label: 'Active Courses', value: '18', change: '3 new', icon: BookOpen, iconBg: 'bg-green-50', iconColor: 'text-green-600', badgeBg: 'bg-green-50', badgeColor: 'text-green-600' },
    { label: 'Pending Approvals', value: '5', change: 'Action needed', icon: UserCheck, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badgeBg: 'bg-orange-50', badgeColor: 'text-orange-500' },
]

const pendingApprovals = [
    { id: 1, name: 'Ahmed Al-Rashid', email: 'ahmed.rashid@email.com', role: 'STUDENT', program: 'Computer Science', requestedAt: 'May 12, 2026' },
    { id: 2, name: 'Fathimath Sana', email: 'fathimath.s@email.com', role: 'STUDENT', program: 'Information Technology', requestedAt: 'May 12, 2026' },
    { id: 3, name: 'Ibrahim Zuhair', email: 'ibrahim.z@email.com', role: 'INSTRUCTOR', program: 'Mathematics', requestedAt: 'May 11, 2026' },
    { id: 4, name: 'Mariyam Nadhiya', email: 'mariyam.n@email.com', role: 'STUDENT', program: 'Business Administration', requestedAt: 'May 11, 2026' },
]

const quickActions = [
    { label: 'Create New Course', icon: PlusCircle, iconBg: 'bg-blue-50', iconColor: 'text-[#0000ff]' },
    { label: 'Add Instructor Account', icon: Plus, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'View All Students', icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Manage Courses', icon: BookMarked, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
]

const activityLog = [
    { id: 1, event: 'Account Approved', user: 'Ali Hassan (Student)', status: 'Approved', statusBg: 'bg-green-50', statusColor: 'text-green-600', icon: Check, iconBg: 'bg-green-500', time: '1 hour ago' },
    { id: 2, event: 'Course Created', user: 'Prof. Sarah Chen', status: 'Success', statusBg: 'bg-blue-50', statusColor: 'text-[#0000ff]', icon: BookOpen, iconBg: 'bg-[#0000ff]', time: '3 hours ago' },
    { id: 3, event: 'Student Login', user: 'Aminath Rifa', status: 'Active', statusBg: 'bg-green-50', statusColor: 'text-green-600', icon: LogIn, iconBg: 'bg-green-500', time: '4 hours ago' },
    { id: 4, event: 'Account Rejected', user: 'Unknown Applicant', status: 'Rejected', statusBg: 'bg-red-50', statusColor: 'text-red-600', icon: X, iconBg: 'bg-red-500', time: '5 hours ago' },
    { id: 5, event: 'Course Deleted', user: 'Admin (Super)', status: 'Removed', statusBg: 'bg-gray-100', statusColor: 'text-gray-500', icon: Trash2, iconBg: 'bg-gray-400', time: 'Yesterday' },
    { id: 6, event: 'Instructor Login', user: 'Dr. Ahmed Hassan', status: 'Active', statusBg: 'bg-green-50', statusColor: 'text-green-600', icon: LogIn, iconBg: 'bg-green-500', time: 'Yesterday' },
]
</script>
