<template>
    <div class="p-6 space-y-6">

        <!-- Page header -->
        <div>
            <h1 class="text-xl font-bold text-gray-900">Explore Courses</h1>
            <p class="text-sm text-gray-400 mt-0.5">Browse available courses and apply to enroll.</p>
        </div>

        <!-- Join with code + Search row -->
        <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search -->
            <div class="relative flex-1 max-w-sm">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search courses..."
                    class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                />
            </div>

            <!-- Join with code -->
            <div v-if="isStudent" class="flex gap-2">
                <div class="relative">
                    <input
                        v-model="codeInput"
                        @keydown.enter="joinWithCode"
                        type="text"
                        placeholder="Enter course code…"
                        :class="['px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition w-52', codeError ? 'border-red-300' : 'border-gray-200']"
                    />
                </div>
                <button
                    @click="joinWithCode"
                    class="px-4 py-2.5 bg-[#0000ff] text-white text-sm font-semibold rounded-lg hover:bg-[#0000cc] transition-colors flex-shrink-0"
                >
                    Join
                </button>
            </div>
        </div>

        <!-- Code error -->
        <p v-if="codeError" class="text-xs text-red-500 -mt-3">{{ codeError }}</p>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm text-gray-400">Loading courses...</p>
        </div>

        <!-- Course grid -->
        <div v-else-if="filteredCourses.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                v-for="course in filteredCourses"
                :key="course.id"
                class="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
                <!-- Thumbnail placeholder -->
                <div class="h-40 bg-gradient-to-br from-[#f0f4ff] to-[#dbeafe] flex items-center justify-center">
                    <svg class="w-10 h-10 text-[#0000ff] opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                </div>

                <!-- Content -->
                <div class="p-5 flex flex-col flex-1">
                    <span class="text-xs font-mono text-gray-400">{{ course.code }}</span>
                    <h3 class="font-semibold text-gray-900 mt-1 mb-1.5 group-hover:text-[#0000ff] transition-colors text-sm leading-snug">
                        {{ course.title }}
                    </h3>
                    <p class="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{{ course.description }}</p>

                    <div class="flex items-center gap-2 mb-4 text-xs text-gray-400">
                        <span v-if="course.duration" class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                            {{ course.duration }}
                        </span>
                        <span v-if="course.User" class="flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            {{ course.User.firstName }} {{ course.User.lastName }}
                        </span>
                    </div>

                    <!-- Enroll button / status -->
                    <div v-if="isStudent">
                        <div v-if="enrollmentStatus(course.id) === 'ACTIVE'" class="flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 px-3 py-2 rounded-lg">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                            Enrolled
                        </div>
                        <div v-else-if="enrollmentStatus(course.id) === 'PENDING'" class="flex items-center gap-1.5 text-orange-600 text-xs font-semibold bg-orange-50 px-3 py-2 rounded-lg">
                            <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            Awaiting Approval
                        </div>
                        <button
                            v-else
                            @click="confirmCourse = course"
                            class="w-full bg-[#0000ff] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#0000cc] transition-colors"
                        >
                            {{ enrollmentStatus(course.id) === 'REJECTED' ? 'Apply Again' : 'Enroll Now' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-16 h-16 rounded-2xl bg-[#f0f4ff] flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-[#0000ff] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <p class="text-gray-900 font-semibold mb-1">No courses found</p>
            <p class="text-gray-400 text-sm">{{ searchQuery ? 'Try a different search term.' : 'No courses are available yet.' }}</p>
        </div>

        <!-- Enroll Confirmation Modal -->
        <Teleport to="body">
            <div
                v-if="confirmCourse"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="confirmCourse = null"
            >
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                    <div class="w-14 h-14 bg-[#0000ff]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-7 h-7 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 class="text-base font-bold text-gray-900 mb-1">Enroll in this course?</h2>
                    <p class="text-sm font-semibold text-[#0000ff] mb-1">{{ confirmCourse.title }}</p>
                    <p class="text-xs font-mono text-gray-400 mb-3">{{ confirmCourse.code }}</p>
                    <p class="text-sm text-gray-500 mb-5">Your request will be sent to the administrator for approval. You'll be notified once approved.</p>
                    <div v-if="enrollError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 text-left">
                        {{ enrollError }}
                    </div>
                    <div class="flex gap-3">
                        <button @click="confirmCourse = null; enrollError = ''" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            @click="submitEnroll"
                            :disabled="enrolling"
                            class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] transition-colors disabled:opacity-60"
                        >
                            {{ enrolling ? 'Submitting...' : 'Yes, Enroll' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' as any })

const auth = useAuthStore()
const toast = useAppToast()
const isStudent = computed(() => auth.isLoggedIn && auth.user?.role === 'STUDENT')

interface Course {
    id: number; title: string; description: string; code: string
    duration: string | null; createdAt: string
    User: { firstName: string; lastName: string } | null
}
interface Enrollment { id: number; courseId: number; status: string }

const courses = ref<Course[]>([])
const enrollments = ref<Enrollment[]>([])
const loading = ref(true)
const searchQuery = ref('')
const codeInput = ref('')
const codeError = ref('')

const confirmCourse = ref<Course | null>(null)
const enrolling = ref(false)
const enrollError = ref('')

const filteredCourses = computed(() => {
    if (!searchQuery.value.trim()) return courses.value
    const q = searchQuery.value.toLowerCase()
    return courses.value.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q)
    )
})

const enrollmentStatus = (courseId: number): string | null =>
    enrollments.value.find(e => e.courseId === courseId)?.status ?? null

onMounted(async () => {
    loading.value = true
    try {
        const [c, e] = await Promise.all([
            $fetch<Course[]>('/api/courses'),
            isStudent.value ? $fetch<Enrollment[]>('/api/student/enrollments') : Promise.resolve([]),
        ])
        courses.value = c
        enrollments.value = e as Enrollment[]
    } finally {
        loading.value = false
    }
})

const joinWithCode = () => {
    codeError.value = ''
    const code = codeInput.value.trim().toUpperCase()
    if (!code) { codeError.value = 'Enter a course code.'; return }
    const found = courses.value.find(c => c.code.toUpperCase() === code)
    if (!found) { codeError.value = `No course found with code "${code}".`; return }
    const status = enrollmentStatus(found.id)
    if (status === 'ACTIVE') { codeError.value = 'You are already enrolled in this course.'; return }
    if (status === 'PENDING') { codeError.value = 'Your enrollment request is pending approval.'; return }
    codeInput.value = ''
    confirmCourse.value = found
}

const submitEnroll = async () => {
    if (!confirmCourse.value) return
    enrolling.value = true
    enrollError.value = ''
    try {
        await $fetch(`/api/courses/${confirmCourse.value.id}/enroll`, { method: 'POST' })
        enrollments.value.push({ id: Date.now(), courseId: confirmCourse.value.id, status: 'PENDING' })
        const title = confirmCourse.value.title
        confirmCourse.value = null
        toast.success(`Enrollment request submitted for "${title}". Awaiting admin approval.`)
    } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        enrollError.value = e.data?.message ?? 'Something went wrong. Please try again.'
    } finally {
        enrolling.value = false
    }
}
</script>
