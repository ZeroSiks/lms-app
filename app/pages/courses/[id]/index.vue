<template>
    <div class="p-6 space-y-6">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-24">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <p class="text-base font-semibold text-gray-700">{{ error }}</p>
            <NuxtLink to="/courses" class="text-sm text-[#0000ff] hover:underline mt-2 inline-block">← Back to courses</NuxtLink>
        </div>

        <template v-else-if="course">

            <!-- Header -->
            <div class="bg-gradient-to-r from-[#020B2D] via-[#0A2472] to-[#0033CC] rounded-2xl p-7 text-white relative overflow-hidden">
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
                </div>
                <div class="relative">
                    <NuxtLink to="/courses" class="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium mb-4 transition-colors">
                        <ChevronLeft class="w-3.5 h-3.5" /> All Courses
                    </NuxtLink>
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="bg-white/15 text-white text-xs font-mono px-2.5 py-1 rounded-full">{{ course.code }}</span>
                                <span v-if="course.duration" class="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Clock class="w-3 h-3" />{{ course.duration }}
                                </span>
                                <span :class="['text-xs px-2.5 py-1 rounded-full font-semibold', course.isPublished ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300']">
                                    {{ course.isPublished ? 'Published' : 'Draft' }}
                                </span>
                            </div>
                            <h1 class="text-2xl font-bold leading-snug">{{ course.title }}</h1>
                            <p v-if="course.User" class="text-white/60 text-sm mt-1.5 flex items-center gap-1.5">
                                <GraduationCap class="w-3.5 h-3.5" />
                                {{ course.User.firstName }} {{ course.User.lastName }}
                            </p>
                        </div>
                        <!-- Progress badge (if enrolled) -->
                        <div v-if="course.hasAccess && isStudent" class="hidden md:flex flex-col items-center bg-white/10 rounded-2xl px-5 py-4 flex-shrink-0">
                            <span class="text-3xl font-black">{{ overallProgress }}%</span>
                            <span class="text-xs text-white/60 mt-0.5">completed</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main grid -->
            <div class="grid lg:grid-cols-3 gap-6">

                <!-- Modules (2/3) -->
                <div class="lg:col-span-2 space-y-4">

                    <!-- Description -->
                    <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <h2 class="text-sm font-semibold text-gray-900 mb-2">About this course</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">{{ course.description }}</p>
                    </div>

                    <!-- Empty modules -->
                    <div v-if="course.Module.length === 0" class="bg-white rounded-xl p-10 border border-gray-100 text-center">
                        <BookOpen class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p class="text-sm font-medium text-gray-500">No content yet</p>
                        <p class="text-xs text-gray-400 mt-1">The instructor hasn't added modules yet.</p>
                    </div>

                    <!-- Module list -->
                    <div v-for="mod in course.Module" :key="mod.id" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <!-- Module header -->
                        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                            <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-lg bg-[#0000ff]/8 flex items-center justify-center text-xs font-bold text-[#0000ff]">
                                    {{ mod.order }}
                                </div>
                                <div>
                                    <h3 class="text-sm font-semibold text-gray-900">{{ mod.title }}</h3>
                                    <p v-if="mod.description" class="text-xs text-gray-400 mt-0.5">{{ mod.description }}</p>
                                </div>
                            </div>
                            <span class="text-xs text-gray-400">
                                {{ moduleProgress(mod).completed }}/{{ moduleProgress(mod).total }} lessons
                            </span>
                        </div>

                        <!-- Lessons -->
                        <div v-if="mod.Lesson.length > 0" class="divide-y divide-gray-50">
                            <div v-for="lesson in mod.Lesson" :key="lesson.id">
                                <NuxtLink
                                    v-if="course.hasAccess"
                                    :to="`/courses/${course.id}/lessons/${lesson.id}`"
                                    class="flex items-center gap-3 px-5 py-3 hover:bg-blue-50/30 transition-colors group"
                                >
                                    <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors', lesson.LessonProgress[0]?.completed ? 'bg-green-500' : 'bg-gray-100 group-hover:bg-[#0000ff]/10']">
                                        <Check v-if="lesson.LessonProgress[0]?.completed" class="w-3.5 h-3.5 text-white" />
                                        <Play v-else class="w-3 h-3 text-gray-400 group-hover:text-[#0000ff]" />
                                    </div>
                                    <span class="text-sm text-gray-700 group-hover:text-[#0000ff] flex-1">{{ lesson.title }}</span>
                                    <span v-if="lesson.duration" class="text-xs text-gray-400">{{ lesson.duration }} min</span>
                                </NuxtLink>
                                <div v-else class="flex items-center gap-3 px-5 py-3">
                                    <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Lock class="w-3 h-3 text-gray-300" />
                                    </div>
                                    <span class="text-sm text-gray-400">{{ lesson.title }}</span>
                                    <span v-if="lesson.duration" class="text-xs text-gray-300 ml-auto">{{ lesson.duration }} min</span>
                                </div>
                            </div>
                        </div>

                        <!-- Assignments -->
                        <div v-if="mod.Assignment.length > 0" class="border-t border-gray-50 divide-y divide-gray-50">
                            <div v-for="assignment in mod.Assignment" :key="assignment.id"
                                class="flex items-center gap-3 px-5 py-3">
                                <div class="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                    <ClipboardList class="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-700">{{ assignment.title }}</p>
                                    <p class="text-xs text-gray-400 mt-0.5">
                                        Due {{ formatDate(assignment.dueDate) }} &bull; {{ assignment.maxPoints }} pts
                                    </p>
                                </div>
                                <div class="flex-shrink-0">
                                    <NuxtLink v-if="assignment.Submission[0]?.status === 'GRADED' && course.hasAccess"
                                        :to="`/courses/${course.id}/assignments/${assignment.id}`"
                                        class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                        {{ assignment.Submission[0].grade }}/{{ assignment.maxPoints }} — View
                                    </NuxtLink>
                                    <NuxtLink v-else-if="assignment.Submission[0]?.status === 'SUBMITTED' && course.hasAccess"
                                        :to="`/courses/${course.id}/assignments/${assignment.id}`"
                                        class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0000ff] hover:bg-blue-100 transition-colors">
                                        Submitted
                                    </NuxtLink>
                                    <NuxtLink
                                        v-else-if="course.hasAccess"
                                        :to="`/courses/${course.id}/assignments/${assignment.id}`"
                                        :class="['text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors', isPastDue(assignment.dueDate) ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#0000ff] text-white hover:bg-[#0000cc]']"
                                    >
                                        {{ isPastDue(assignment.dueDate) ? 'Overdue' : 'Submit' }}
                                    </NuxtLink>
                                    <span v-else class="text-xs text-gray-300">Enroll to submit</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="mod.Lesson.length === 0 && mod.Assignment.length === 0" class="px-5 py-4 text-xs text-gray-400 italic">
                            No content added yet.
                        </div>
                    </div>
                </div>

                <!-- Right sidebar (1/3) -->
                <div class="space-y-4">

                    <!-- Progress card (if enrolled) -->
                    <div v-if="course.hasAccess && isStudent" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div class="flex items-center gap-2 mb-4">
                            <BarChart2 class="w-4 h-4 text-[#0000ff]" />
                            <h3 class="text-sm font-semibold text-gray-900">Your Progress</h3>
                        </div>
                        <div class="flex items-end justify-between mb-2">
                            <span class="text-3xl font-black text-[#0000ff]">{{ overallProgress }}%</span>
                            <span class="text-xs text-gray-400">{{ completedLessonsCount }}/{{ totalLessonsCount }} lessons</span>
                        </div>
                        <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-[#0000ff] rounded-full transition-all duration-700" :style="{ width: overallProgress + '%' }"></div>
                        </div>
                        <p v-if="overallProgress === 100" class="text-xs text-green-600 font-medium mt-3 text-center">
                            Course completed!
                        </p>
                    </div>

                    <!-- Enrollment CTA (students, not enrolled) -->
                    <div v-if="isStudent && !course.hasAccess" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <h3 class="text-sm font-semibold text-gray-900 mb-1">Get started</h3>
                        <p class="text-xs text-gray-500 mb-4">Enroll to access all lessons and assignments.</p>
                        <div v-if="course.enrollment?.status === 'PENDING'" class="flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-2.5 rounded-lg">
                            <Clock class="w-3.5 h-3.5" /> Awaiting admin approval
                        </div>
                        <div v-else-if="course.enrollment?.status === 'REJECTED'" class="space-y-2">
                            <p class="text-xs text-red-500 font-medium">Your previous request was rejected.</p>
                            <button @click="submitEnroll" :disabled="enrolling" class="w-full bg-[#0000ff] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-60">
                                {{ enrolling ? 'Submitting...' : 'Apply Again' }}
                            </button>
                        </div>
                        <button v-else @click="submitEnroll" :disabled="enrolling" class="w-full bg-[#0000ff] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-60">
                            {{ enrolling ? 'Submitting...' : 'Enroll Now' }}
                        </button>
                        <p v-if="enrollError" class="text-xs text-red-500 mt-2">{{ enrollError }}</p>
                    </div>

                    <!-- Course info card -->
                    <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-3">
                        <h3 class="text-sm font-semibold text-gray-900">Course info</h3>
                        <div class="space-y-2.5 text-sm">
                            <div v-if="course.User" class="flex items-center gap-2.5">
                                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {{ course.User.firstName[0] }}{{ course.User.lastName[0] }}
                                </div>
                                <div>
                                    <p class="text-xs text-gray-400">Instructor</p>
                                    <p class="text-sm font-medium text-gray-700">{{ course.User.firstName }} {{ course.User.lastName }}</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-gray-400">Total lessons</span>
                                <span class="font-semibold text-gray-700">{{ totalLessonsCount }}</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-gray-400">Modules</span>
                                <span class="font-semibold text-gray-700">{{ course.Module.length }}</span>
                            </div>
                            <div v-if="course.duration" class="flex items-center justify-between text-xs">
                                <span class="text-gray-400">Duration</span>
                                <span class="font-semibold text-gray-700">{{ course.duration }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Enroll success toast -->
            <Teleport to="body">
                <div v-if="successMsg" class="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5">
                    <CheckCircle class="w-4 h-4 text-green-400 flex-shrink-0" />
                    {{ successMsg }}
                </div>
            </Teleport>

        </template>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ChevronLeft, Clock, GraduationCap, BookOpen, Check, Play, Lock, ClipboardList, BarChart2, CheckCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const route = useRoute()
const auth = useAuthStore()
const { user } = storeToRefs(auth)
const isStudent = computed(() => user.value?.role === 'STUDENT')

interface LessonProgress { completed: boolean; completedAt: string | null }
interface Lesson { id: number; title: string; duration: number | null; order: number; LessonProgress: LessonProgress[] }
interface Submission { id: number; status: string; grade: number | null; submittedAt: string }
interface Assignment { id: number; title: string; description: string; dueDate: string; maxPoints: number; status: string; Submission: Submission[] }
interface Module { id: number; title: string; description: string | null; order: number; Lesson: Lesson[]; Assignment: Assignment[] }
interface Course {
    id: number; title: string; description: string; code: string; duration: string | null
    isPublished: boolean; instructorId: number | null
    User: { id: number; firstName: string; lastName: string } | null
    enrollment: { id: number; status: string } | null
    hasAccess: boolean
    Module: Module[]
}

const course = ref<Course | null>(null)
const loading = ref(true)
const error = ref('')

const enrolling = ref(false)
const enrollError = ref('')
const successMsg = ref('')

onMounted(async () => {
    try {
        course.value = await $fetch<Course>(`/api/courses/${route.params.id}`)
    } catch (e: any) {
        error.value = e.data?.message ?? 'Course not found.'
    } finally {
        loading.value = false
    }
})

const totalLessonsCount = computed(() =>
    course.value?.Module.reduce((sum, m) => sum + m.Lesson.length, 0) ?? 0
)
const completedLessonsCount = computed(() =>
    course.value?.Module.reduce((sum, m) =>
        sum + m.Lesson.filter(l => l.LessonProgress[0]?.completed).length, 0) ?? 0
)
const overallProgress = computed(() =>
    totalLessonsCount.value > 0
        ? Math.round((completedLessonsCount.value / totalLessonsCount.value) * 100)
        : 0
)

const moduleProgress = (mod: Module) => ({
    completed: mod.Lesson.filter(l => l.LessonProgress[0]?.completed).length,
    total: mod.Lesson.length,
})

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const isPastDue = (iso: string) => new Date(iso) < new Date()

const submitEnroll = async () => {
    if (!course.value) return
    enrolling.value = true
    enrollError.value = ''
    try {
        await $fetch(`/api/courses/${course.value.id}/enroll`, { method: 'POST' })
        course.value.enrollment = { id: Date.now(), status: 'PENDING' }
        successMsg.value = 'Enrollment request submitted! Waiting for admin approval.'
        setTimeout(() => { successMsg.value = '' }, 4000)
    } catch (e: any) {
        enrollError.value = e.data?.message ?? 'Something went wrong.'
    } finally {
        enrolling.value = false
    }
}
</script>
