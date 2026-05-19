<template>
    <div class="flex h-full overflow-hidden">

        <!-- Course structure sidebar -->
        <aside class="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex-shrink-0">
                <NuxtLink :to="`/courses/${route.params.id}`" class="flex items-center gap-1.5 text-xs text-[#0000ff] font-medium hover:underline mb-2">
                    <ChevronLeft class="w-3.5 h-3.5" /> Back to course
                </NuxtLink>
                <p class="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">{{ courseTitle }}</p>
            </div>
            <div class="flex-1 overflow-y-auto py-2">
                <div v-if="loadingStructure" class="flex items-center justify-center py-8">
                    <div class="w-5 h-5 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div v-else v-for="mod in structure" :key="mod.id" class="mb-1">
                    <div class="px-4 py-2 flex items-center gap-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-1 truncate">{{ mod.title }}</span>
                        <span class="text-[10px] text-gray-300">{{ mod.completed }}/{{ mod.total }}</span>
                    </div>
                    <NuxtLink
                        v-for="lesson in mod.lessons"
                        :key="lesson.id"
                        :to="`/courses/${route.params.id}/lessons/${lesson.id}`"
                        :class="[
                            'flex items-center gap-2.5 px-4 py-2 text-xs transition-colors',
                            lesson.id === currentLessonId
                                ? 'bg-[#0000ff]/8 text-[#0000ff] font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        ]"
                    >
                        <div :class="['w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0', lesson.completed ? 'bg-green-500' : lesson.id === currentLessonId ? 'bg-[#0000ff]' : 'bg-gray-200']">
                            <Check v-if="lesson.completed" class="w-2.5 h-2.5 text-white" />
                            <div v-else-if="lesson.id === currentLessonId" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                        <span class="flex-1 leading-snug">{{ lesson.title }}</span>
                        <span v-if="lesson.duration" class="text-gray-300 text-[10px] flex-shrink-0">{{ lesson.duration }}m</span>
                    </NuxtLink>
                </div>
            </div>
        </aside>

        <!-- Lesson content -->
        <main class="flex-1 overflow-y-auto">
            <div v-if="loadingLesson" class="flex items-center justify-center h-64">
                <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else-if="lessonError" class="p-8 text-center">
                <p class="text-sm text-gray-500">{{ lessonError }}</p>
            </div>

            <div v-else-if="lesson" class="max-w-3xl mx-auto px-8 py-8 space-y-6">

                <!-- Lesson header -->
                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-xs text-gray-400 font-medium">{{ lesson.Module.title }}</span>
                        <span class="text-gray-200">·</span>
                        <span v-if="lesson.duration" class="flex items-center gap-1 text-xs text-gray-400">
                            <Clock class="w-3 h-3" /> {{ lesson.duration }} min
                        </span>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900">{{ lesson.title }}</h1>
                </div>

                <!-- Completion badge -->
                <div v-if="isCompleted" class="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <CheckCircle class="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span class="text-sm font-medium text-green-700">Lesson completed</span>
                </div>

                <!-- Video (if present) -->
                <div v-if="lesson.videoUrl" class="rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                    <a :href="lesson.videoUrl" target="_blank" class="flex flex-col items-center gap-3 text-white/70 hover:text-white transition-colors">
                        <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                            <Play class="w-7 h-7 ml-1" />
                        </div>
                        <span class="text-sm font-medium">Watch video</span>
                    </a>
                </div>

                <!-- Content -->
                <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{{ lesson.content }}</div>
                </div>

                <!-- Resources -->
                <div v-if="lesson.Resource.length > 0" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText class="w-4 h-4 text-[#0000ff]" /> Resources
                    </h3>
                    <div class="space-y-2">
                        <a
                            v-for="res in lesson.Resource"
                            :key="res.id"
                            :href="res.url"
                            target="_blank"
                            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                        >
                            <div class="w-8 h-8 bg-[#0000ff]/8 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Link2 class="w-4 h-4 text-[#0000ff]" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-700 group-hover:text-[#0000ff] truncate">{{ res.title }}</p>
                                <p class="text-xs text-gray-400">{{ res.type }}</p>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Mark complete + navigation -->
                <div class="flex items-center justify-between pt-2 pb-8">
                    <NuxtLink
                        v-if="lesson.prev"
                        :to="`/courses/${route.params.id}/lessons/${lesson.prev.id}`"
                        class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft class="w-4 h-4" /> {{ lesson.prev.title }}
                    </NuxtLink>
                    <div v-else></div>

                    <button
                        v-if="!isCompleted"
                        @click="markComplete"
                        :disabled="completing"
                        class="flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-60"
                    >
                        <Check class="w-4 h-4" />
                        {{ completing ? 'Saving...' : 'Mark complete' }}
                    </button>

                    <NuxtLink
                        v-if="lesson.next"
                        :to="`/courses/${route.params.id}/lessons/${lesson.next.id}`"
                        class="flex items-center gap-2 text-sm font-medium text-[#0000ff] hover:text-[#0000cc] transition-colors"
                    >
                        {{ lesson.next.title }} <ChevronRight class="w-4 h-4" />
                    </NuxtLink>
                    <div v-else></div>
                </div>

            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Clock, Check, CheckCircle, Play, FileText, Link2 } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const route = useRoute()
const courseId = Number(route.params.id)
const currentLessonId = computed(() => Number(route.params.lessonId))

interface Resource { id: number; title: string; type: string; url: string }
interface NavLesson { id: number; title: string; order?: number }
interface Lesson {
    id: number; title: string; content: string; videoUrl: string | null; duration: number | null
    Module: { id: number; title: string; courseId: number; order: number }
    LessonProgress: { completed: boolean; completedAt: string | null }[]
    Resource: Resource[]
    prev: NavLesson | null
    next: NavLesson | null
    courseId: number
}
interface StructureLesson { id: number; title: string; duration: number | null; completed: boolean }
interface StructureModule { id: number; title: string; order: number; lessons: StructureLesson[]; completed: number; total: number }

const lesson = ref<Lesson | null>(null)
const loadingLesson = ref(true)
const lessonError = ref('')
const completing = ref(false)

const structure = ref<StructureModule[]>([])
const loadingStructure = ref(true)
const courseTitle = ref('')

const isCompleted = computed(() => lesson.value?.LessonProgress[0]?.completed ?? false)

const fetchLesson = async () => {
    loadingLesson.value = true
    lessonError.value = ''
    try {
        lesson.value = await $fetch<Lesson>(`/api/courses/${courseId}/lessons/${currentLessonId.value}`)
    } catch (e: any) {
        lessonError.value = e.data?.message ?? 'Lesson not found.'
    } finally {
        loadingLesson.value = false
    }
}

const fetchStructure = async () => {
    loadingStructure.value = true
    try {
        const course = await $fetch<any>(`/api/courses/${courseId}`)
        courseTitle.value = course.title
        structure.value = course.Module.map((m: any) => ({
            id: m.id,
            title: m.title,
            order: m.order,
            lessons: m.Lesson.map((l: any) => ({
                id: l.id,
                title: l.title,
                duration: l.duration,
                completed: l.LessonProgress[0]?.completed ?? false,
            })),
            completed: m.Lesson.filter((l: any) => l.LessonProgress[0]?.completed).length,
            total: m.Lesson.length,
        }))
    } finally {
        loadingStructure.value = false
    }
}

onMounted(() => {
    fetchLesson()
    fetchStructure()
})

watch(currentLessonId, () => fetchLesson())

const markComplete = async () => {
    if (!lesson.value) return
    completing.value = true
    try {
        await $fetch(`/api/courses/${courseId}/lessons/${lesson.value.id}/complete`, { method: 'POST' })
        lesson.value.LessonProgress = [{ completed: true, completedAt: new Date().toISOString() }]
        // Update structure sidebar
        for (const mod of structure.value) {
            const sl = mod.lessons.find(l => l.id === lesson.value!.id)
            if (sl) { sl.completed = true; mod.completed++ }
        }
    } finally {
        completing.value = false
    }
}
</script>
