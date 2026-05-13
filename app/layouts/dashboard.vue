<template>
    <div class="flex h-screen bg-[#f0f4ff] overflow-hidden">

        <!-- ====================
                  Sidebar
             ==================== -->
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
                            ($route.path === item.to || (item.to !== '/dashboard' && $route.path.startsWith(item.to)))
                                ? 'bg-[#0000ff] text-white shadow-lg shadow-[#0000ff]/20'
                                : 'text-white/55 hover:text-white hover:bg-white/8'
                        ]"
                    >
                        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                        {{ item.label }}
                    </NuxtLink>
                </template>
            </nav>

            <!-- User chip + Logout -->
            <div class="p-3 border-t border-white/10 flex-shrink-0">
                <NuxtLink to="/dashboard/settings" class="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg hover:bg-white/8 transition-colors group">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {{ initials }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-white text-sm font-medium truncate">{{ user?.firstName }} {{ user?.lastName }}</p>
                        <p class="text-white/35 text-xs truncate">{{ user?.email }}</p>
                    </div>
                    <Settings class="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 flex-shrink-0" />
                </NuxtLink>
                <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors text-sm font-medium"
                >
                    <LogOut class="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>

        <!-- ====================
               Main Content
             ==================== -->
        <div class="flex-1 flex flex-col min-w-0">

            <!-- ====================
                     Top Bar
                 ==================== -->
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

                    <!-- ====================
                           Notification Bell
                         ==================== -->
                    <div class="relative">
                        <button
                            @click.stop="toggleNotifs"
                            class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Bell class="w-5 h-5 text-gray-600" />
                            <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0000ff] rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                {{ unreadCount > 9 ? '9+' : unreadCount }}
                            </span>
                        </button>

                        <div
                            v-if="showNotifs"
                            @click.stop
                            class="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                        >
                            <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 class="font-semibold text-gray-900 text-sm">Notifications</h3>
                                <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-[#0000ff] font-medium hover:underline">Mark all read</button>
                            </div>
                            <div class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                <div v-if="loadingNotifs" class="flex items-center justify-center py-6">
                                    <div class="w-4 h-4 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <div v-else-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-gray-400">
                                    All caught up — no new notifications
                                </div>
                                <NuxtLink
                                    v-else
                                    v-for="notif in notifications"
                                    :key="notif.id"
                                    :to="notif.link ?? '#'"
                                    @click="showNotifs = false"
                                    :class="['block px-4 py-3 hover:bg-gray-50 transition-colors', !notif.read ? 'bg-blue-50/40' : '']"
                                >
                                    <div class="flex gap-3 items-start">
                                        <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', notifIconBg(notif.type)]">
                                            <component :is="notifIcon(notif.type)" class="w-4 h-4 text-white" />
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="text-sm text-gray-800 font-medium leading-snug">{{ notif.title }}</p>
                                            <p class="text-xs text-gray-500 mt-0.5 leading-snug">{{ notif.message }}</p>
                                            <p class="text-xs text-gray-400 mt-1">{{ relTime(notif.createdAt) }}</p>
                                        </div>
                                        <div v-if="!notif.read" class="w-2 h-2 rounded-full bg-[#0000ff] flex-shrink-0 mt-1.5"></div>
                                    </div>
                                </NuxtLink>
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
    Bell, Search, LogOut, Settings,
    LayoutDashboard, BookOpen, Calendar, ClipboardList, MessageCircle, BarChart2,
    UserCheck, Users, BookMarked, Activity, GraduationCap, BookCopy,
    Star, Mail,
} from 'lucide-vue-next'

// ====================
//       State
// ====================

const auth = useAuthStore()
const router = useRouter()
const { user, isAdmin } = storeToRefs(auth)

const initials = computed(() => {
    const u = user.value
    if (!u) return 'U'
    return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
})

// ====================
//    Notifications
// ====================

const showNotifs = ref(false)
const loadingNotifs = ref(false)

interface Notif {
    id: number; title: string; message: string; type: string
    read: boolean; link: string | null; createdAt: string
}
const notifications = ref<Notif[]>([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

interface AdminStats {
    totalStudents: number
    totalInstructors: number
    activeCourses: number
    pendingUsers: number
    pendingEnrollments: number
    totalPending: number
    latestUser: { firstName: string; lastName: string; role: string; createdAt: string } | null
}
const adminStats = ref<AdminStats | null>(null)

const fetchAdminStats = async () => {
    try { adminStats.value = await $fetch<AdminStats>('/api/admin/stats') } catch { /* non-fatal */ }
}

const adminNotifications = computed(() => {
    const stats = adminStats.value
    if (!stats) return []
    const notifs: Notif[] = []
    if (stats.pendingUsers > 0) {
        notifs.push({ id: 1, title: `${stats.pendingUsers} account approval${stats.pendingUsers > 1 ? 's' : ''} waiting`, message: 'Pending admin review', type: 'enrollment', read: false, link: '/admin/approvals', createdAt: new Date().toISOString() })
    }
    if (stats.pendingEnrollments > 0) {
        notifs.push({ id: 2, title: `${stats.pendingEnrollments} course enrollment${stats.pendingEnrollments > 1 ? 's' : ''} pending`, message: 'Pending admin review', type: 'enrollment', read: false, link: '/admin/approvals', createdAt: new Date().toISOString() })
    }
    if (stats.latestUser) {
        notifs.push({ id: 3, title: `New registration: ${stats.latestUser.firstName} ${stats.latestUser.lastName}`, message: 'Awaiting account approval', type: 'enrollment', read: true, link: '/admin/approvals', createdAt: stats.latestUser.createdAt })
    }
    return notifs
})

const fetchUserNotifications = async () => {
    if (isAdmin.value) return
    loadingNotifs.value = true
    try {
        const data = await $fetch<{ notifications: Notif[]; unreadCount: number }>('/api/notifications')
        notifications.value = data.notifications
    } catch { /* non-fatal */ } finally {
        loadingNotifs.value = false
    }
}

const toggleNotifs = async () => {
    showNotifs.value = !showNotifs.value
    if (showNotifs.value && !isAdmin.value) await fetchUserNotifications()
}

const markAllRead = async () => {
    if (isAdmin.value) return
    await $fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {})
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))
}

const notifIcon = (type: string) => {
    if (type === 'message') return Mail
    if (type === 'grade') return Star
    if (type === 'assignment') return ClipboardList
    return UserCheck
}
const notifIconBg = (type: string) => {
    if (type === 'message') return 'bg-[#0000ff]'
    if (type === 'grade') return 'bg-green-500'
    if (type === 'assignment') return 'bg-orange-500'
    return 'bg-purple-500'
}

const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ====================
//   Navigation Config
// ====================

const studentNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
    { to: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
    { to: '/dashboard/progress', label: 'My Progress', icon: BarChart2 },
]

const instructorNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/instructor/courses', label: 'My Courses', icon: BookCopy },
    { to: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
]

const userNav = computed(() =>
    user.value?.role === 'INSTRUCTOR' ? instructorNav : studentNav
)

const adminNav = computed(() => [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, badge: null },
    { to: '/admin/approvals', label: 'Approvals', icon: UserCheck, badge: adminStats.value?.totalPending || null },
    { to: '/admin/students', label: 'Students', icon: Users, badge: null },
    { to: '/admin/instructors', label: 'Instructors', icon: GraduationCap, badge: null },
    { to: '/admin/courses', label: 'Courses', icon: BookMarked, badge: null },
    { to: '/admin/activity', label: 'Activity Log', icon: Activity, badge: null },
])

// ====================
//      Lifecycle
// ====================

onMounted(() => {
    if (isAdmin.value) fetchAdminStats()
    else fetchUserNotifications()
    document.addEventListener('click', closeNotifs)
})
onUnmounted(() => document.removeEventListener('click', closeNotifs))
const closeNotifs = () => { showNotifs.value = false }

watchEffect(() => {
    if (isAdmin.value && adminNotifications.value.length) {
        notifications.value = adminNotifications.value
    }
})

// ====================
//      Handlers
// ====================

const handleLogout = async () => {
    await auth.logout()
    router.push('/login')
}
</script>
