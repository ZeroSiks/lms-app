<template>
    <div class="flex h-screen bg-[#f0f4ff] overflow-hidden">

        <!-- Sidebar -->
        <aside class="w-64 bg-[#020B2D] flex flex-col flex-shrink-0">
            <!-- Logo -->
            <div class="h-16 flex items-center px-5 border-b border-white/10 flex-shrink-0">
                <NuxtLink to="/" class="flex items-center gap-2.5">
                    <div class="w-8 h-8 bg-[#0000ff] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-black text-sm">L</span>
                    </div>
                    <span class="text-white font-extrabold text-lg tracking-tight">Lumify<span class="text-[#0000ff]">.</span></span>
                </NuxtLink>
            </div>

            <!-- Panel label -->
            <div class="px-5 pt-4 pb-2">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    {{ isAdmin ? 'Administration' : user?.role === 'INSTRUCTOR' ? 'Instructor Panel' : 'Student Panel' }}
                </p>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                <template v-if="isAdmin">
                    <NuxtLink
                        v-for="item in adminNav"
                        :key="item.to"
                        :to="item.to"
                        :class="[
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                            $route.path === item.to
                                ? 'bg-[#0000ff] text-white shadow-lg shadow-[#0000ff]/20'
                                : 'text-white/55 hover:text-white hover:bg-white/8'
                        ]"
                    >
                        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                        <span class="flex-1">{{ item.label }}</span>
                        <span
                            v-if="item.badge"
                            class="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        >{{ item.badge }}</span>
                    </NuxtLink>
                </template>
                <template v-else>
                    <NuxtLink
                        v-for="item in userNav"
                        :key="item.to"
                        :to="item.to"
                        :class="[
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                            $route.path === item.to
                                ? 'bg-[#0000ff] text-white shadow-lg shadow-[#0000ff]/20'
                                : 'text-white/55 hover:text-white hover:bg-white/8'
                        ]"
                    >
                        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                        {{ item.label }}
                    </NuxtLink>
                </template>
            </nav>

            <!-- User + Logout -->
            <div class="p-3 border-t border-white/10 flex-shrink-0">
                <div class="flex items-center gap-3 px-2 py-2 mb-1">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {{ initials }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-white text-sm font-medium truncate">{{ user?.firstName }} {{ user?.lastName }}</p>
                        <p class="text-white/35 text-xs truncate">{{ user?.email }}</p>
                    </div>
                </div>
                <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors text-sm font-medium"
                >
                    <LogOut class="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>

        <!-- Main Area -->
        <div class="flex-1 flex flex-col min-w-0">

            <!-- Top Bar -->
            <header class="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0 z-20">
                <div class="flex-1 max-w-xs">
                    <div class="relative">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                        />
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <!-- Notification Bell -->
                    <div class="relative">
                        <button
                            @click.stop="showNotifs = !showNotifs"
                            class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Bell class="w-5 h-5 text-gray-600" />
                            <span class="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0000ff] rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                {{ notifications.length }}
                            </span>
                        </button>

                        <div
                            v-if="showNotifs"
                            @click.stop
                            class="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                        >
                            <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 class="font-semibold text-gray-900 text-sm">Notifications</h3>
                                <span class="text-xs text-[#0000ff] font-medium cursor-pointer hover:underline">Mark all read</span>
                            </div>
                            <div class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                <div
                                    v-for="notif in notifications"
                                    :key="notif.id"
                                    class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div class="flex gap-3 items-start">
                                        <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', notif.iconBg]">
                                            <component :is="notif.icon" class="w-4 h-4 text-white" />
                                        </div>
                                        <div class="min-w-0">
                                            <p class="text-sm text-gray-800 font-medium leading-snug">{{ notif.title }}</p>
                                            <p class="text-xs text-gray-400 mt-0.5">{{ notif.time }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- User chip -->
                    <div class="flex items-center gap-2.5 pl-2 border-l border-gray-100">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold">
                            {{ initials }}
                        </div>
                        <div class="hidden sm:block">
                            <p class="text-sm font-semibold text-gray-900 leading-tight">{{ user?.firstName }} {{ user?.lastName }}</p>
                            <p class="text-xs text-gray-400 leading-tight capitalize">{{ user?.role?.toLowerCase() }}</p>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 overflow-y-auto">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
    Bell, Search, LogOut,
    LayoutDashboard, BookOpen, Calendar, ClipboardList, MessageCircle, BarChart2,
    UserCheck, Users, BookMarked, Activity, FileBarChart, GraduationCap,
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { user, isAdmin } = storeToRefs(auth)

const initials = computed(() => {
    const u = user.value
    if (!u) return 'U'
    return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
})

const showNotifs = ref(false)

const userNotifications = [
    { id: 1, title: "Assignment 'Final Project' due in 2 days", time: '2 hours ago', icon: ClipboardList, iconBg: 'bg-orange-500' },
    { id: 2, title: 'New feedback from Dr. Smith on your submission', time: '5 hours ago', icon: MessageCircle, iconBg: 'bg-[#0000ff]' },
    { id: 3, title: 'Week 7 lecture materials have been uploaded', time: 'Yesterday', icon: BookOpen, iconBg: 'bg-green-500' },
]

const adminNotifications = [
    { id: 1, title: '3 new student account approval requests', time: '1 hour ago', icon: UserCheck, iconBg: 'bg-orange-500' },
    { id: 2, title: 'New instructor registration: Jane Doe', time: '3 hours ago', icon: Users, iconBg: 'bg-[#0000ff]' },
    { id: 3, title: "Course 'Advanced Algorithms' content updated", time: 'Yesterday', icon: BookMarked, iconBg: 'bg-green-500' },
]

const notifications = computed(() => isAdmin.value ? adminNotifications : userNotifications)

const userNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
    { to: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
    { to: '/dashboard/progress', label: 'My Progress', icon: BarChart2 },
]

const adminNav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, badge: null },
    { to: '/admin/approvals', label: 'Approvals', icon: UserCheck, badge: 3 },
    { to: '/admin/students', label: 'Students', icon: Users, badge: null },
    { to: '/admin/instructors', label: 'Instructors', icon: GraduationCap, badge: null },
    { to: '/admin/courses', label: 'Courses', icon: BookMarked, badge: null },
    { to: '/admin/activity', label: 'Activity Log', icon: Activity, badge: null },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart, badge: null },
]

const handleLogout = async () => {
    await auth.logout()
    router.push('/login')
}

const closeNotifs = () => { showNotifs.value = false }
onMounted(() => document.addEventListener('click', closeNotifs))
onUnmounted(() => document.removeEventListener('click', closeNotifs))
</script>
