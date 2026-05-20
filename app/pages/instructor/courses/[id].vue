<template>
    <div class="p-6 space-y-6">

        <div v-if="loading" class="flex items-center justify-center py-24">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="course">

            <!-- Header -->
            <div class="flex items-start justify-between gap-4">
                <div>
                    <NuxtLink to="/instructor/courses" class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-2 transition-colors">
                        <ChevronLeft class="w-3.5 h-3.5" /> My Courses
                    </NuxtLink>
                    <h1 class="text-xl font-bold text-gray-900">{{ course.title }}</h1>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-gray-400 font-mono">{{ course.code }}</span>
                        <span class="text-gray-200">·</span>
                        <span class="text-xs text-gray-500">{{ course._count.Enrollment }} students enrolled</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button
                        @click="togglePublish"
                        :disabled="publishing"
                        :class="['flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60', course.isPublished ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100']"
                    >
                        <component :is="course.isPublished ? EyeOff : Eye" class="w-4 h-4" />
                        {{ publishing ? '...' : course.isPublished ? 'Unpublish' : 'Publish' }}
                    </button>
                    <button
                        @click="showAddModule = true"
                        class="flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0000cc] transition-colors"
                    >
                        <Plus class="w-4 h-4" /> Add Module
                    </button>
                </div>
            </div>

            <!-- Empty -->
            <div v-if="course.Module.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-base font-semibold text-gray-700">No modules yet</p>
                <p class="text-sm text-gray-400 mt-1">Click "Add Module" to start building your course content.</p>
            </div>

            <!-- Module list -->
            <div v-for="mod in course.Module" :key="mod.id" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                <!-- Module header -->
                <div class="flex items-center justify-between px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                    <div class="flex items-center gap-3">
                        <div class="w-7 h-7 rounded-lg bg-[#0000ff]/8 flex items-center justify-center text-xs font-bold text-[#0000ff]">{{ mod.order }}</div>
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ mod.title }}</h3>
                            <p v-if="mod.description" class="text-xs text-gray-400 mt-0.5">{{ mod.description }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="openEditModule(mod)" class="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
                        <button @click="openAddLesson(mod)" class="flex items-center gap-1 text-xs text-[#0000ff] font-medium px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                            <Plus class="w-3 h-3" /> Lesson
                        </button>
                        <button @click="openAddAssignment(mod)" class="flex items-center gap-1 text-xs text-orange-500 font-medium px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors">
                            <Plus class="w-3 h-3" /> Assignment
                        </button>
                        <button @click="deleteModule(mod.id)" class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <!-- Lessons -->
                <div v-if="mod.Lesson.length > 0" class="divide-y divide-gray-50">
                    <div v-for="lesson in mod.Lesson" :key="lesson.id" class="flex items-center gap-3 px-5 py-3 group">
                        <div class="w-6 h-6 rounded-full bg-[#0000ff]/8 flex items-center justify-center flex-shrink-0">
                            <Play class="w-3 h-3 text-[#0000ff]" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-800">{{ lesson.title }}</p>
                            <p class="text-xs text-gray-400 mt-0.5">{{ lesson.duration ? lesson.duration + ' min' : 'No duration set' }}</p>
                        </div>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click="openEditLesson(mod, lesson)" class="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
                            <button @click="deleteLesson(mod, lesson.id)" class="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Assignments -->
                <div v-if="mod.Assignment.length > 0" class="border-t border-gray-50 divide-y divide-gray-50">
                    <div v-for="assignment in mod.Assignment" :key="assignment.id" class="flex items-center gap-3 px-5 py-3 group">
                        <div class="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <ClipboardList class="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <p class="text-sm font-medium text-gray-800">{{ assignment.title }}</p>
                                <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-full', (assignment.status as string) === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400']">
                                    {{ assignment.status }}
                                </span>
                            </div>
                            <p class="text-xs text-gray-400 mt-0.5">
                                Due {{ formatDate(assignment.dueDate) }} · {{ assignment.maxPoints }} pts · {{ assignment._count.Submission }} submissions
                            </p>
                        </div>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click="viewSubmissions(assignment)" class="text-xs text-[#0000ff] font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                                View ({{ assignment._count.Submission }})
                            </button>
                            <button @click="openEditAssignment(mod, assignment)" class="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
                            <button @click="deleteAssignment(mod, assignment.id)" class="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="mod.Lesson.length === 0 && mod.Assignment.length === 0" class="px-5 py-4 text-xs text-gray-400 italic">
                    No content yet. Add a lesson or assignment above.
                </div>
            </div>

        </template>

        <!-- ======= MODALS ======= -->

        <!-- Add / Edit Module Modal -->
        <Teleport to="body">
            <div v-if="showAddModule || editingModule" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModuleModal">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="text-base font-bold text-gray-900">{{ editingModule ? 'Edit Module' : 'Add Module' }}</h2>
                        <button @click="closeModuleModal" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X class="w-4 h-4" /></button>
                    </div>
                    <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{{ modalError }}</div>
                    <form class="space-y-4" @submit.prevent="saveModule">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
                            <input v-model="moduleForm.title" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-gray-400 font-normal">(optional)</span></label>
                            <input v-model="moduleForm.description" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" @click="closeModuleModal" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" :disabled="modalSaving" class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] disabled:opacity-60">{{ modalSaving ? 'Saving...' : 'Save' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Add / Edit Lesson Modal -->
        <Teleport to="body">
            <div v-if="lessonModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="lessonModal = null">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="text-base font-bold text-gray-900">{{ lessonModal.mode === 'edit' ? 'Edit Lesson' : 'Add Lesson' }}</h2>
                        <button @click="lessonModal = null" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X class="w-4 h-4" /></button>
                    </div>
                    <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{{ modalError }}</div>
                    <form class="space-y-4" @submit.prevent="saveLesson">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
                            <input v-model="lessonForm.title" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Content <span class="text-red-500">*</span></label>
                            <textarea v-model="lessonForm.content" rows="6" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                <input v-model="lessonForm.duration" type="number" min="1" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                                <input v-model="lessonForm.videoUrl" type="url" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                            </div>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" @click="lessonModal = null" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" :disabled="modalSaving" class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] disabled:opacity-60">{{ modalSaving ? 'Saving...' : 'Save Lesson' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Add / Edit Assignment Modal -->
        <Teleport to="body">
            <div v-if="assignmentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="assignmentModal = null">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="text-base font-bold text-gray-900">{{ assignmentModal.mode === 'edit' ? 'Edit Assignment' : 'Add Assignment' }}</h2>
                        <button @click="assignmentModal = null" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X class="w-4 h-4" /></button>
                    </div>
                    <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{{ modalError }}</div>
                    <form class="space-y-4" @submit.prevent="saveAssignment">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
                            <input v-model="assignmentForm.title" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
                            <textarea v-model="assignmentForm.description" rows="4" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date <span class="text-red-500">*</span></label>
                                <input v-model="assignmentForm.dueDate" type="datetime-local" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Max Points <span class="text-red-500">*</span></label>
                                <input v-model="assignmentForm.maxPoints" type="number" min="1" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <input id="publish-toggle" v-model="assignmentForm.publish" type="checkbox" class="w-4 h-4 rounded text-[#0000ff]" />
                            <label for="publish-toggle" class="text-sm text-gray-700">Publish immediately (visible to students)</label>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" @click="assignmentModal = null" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" :disabled="modalSaving" class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] disabled:opacity-60">{{ modalSaving ? 'Saving...' : 'Save Assignment' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Submissions Modal -->
        <Teleport to="body">
            <div v-if="submissionsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="submissionsModal = null">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                    <div class="flex items-center justify-between mb-5">
                        <div>
                            <h2 class="text-base font-bold text-gray-900">Submissions</h2>
                            <p class="text-xs text-gray-400 mt-0.5">{{ submissionsModal.title }}</p>
                        </div>
                        <button @click="submissionsModal = null; submissions = []; gradingId = null" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X class="w-4 h-4" /></button>
                    </div>

                    <div v-if="loadingSubmissions" class="py-8 text-center">
                        <div class="w-6 h-6 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                    <div v-else-if="submissions.length === 0" class="py-8 text-center text-sm text-gray-400">No submissions yet.</div>
                    <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto">
                        <div v-for="sub in submissions" :key="sub.id" class="border border-gray-100 rounded-xl p-4 space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-xs font-bold">
                                        {{ sub.User.firstName[0] }}{{ sub.User.lastName[0] }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-gray-900">{{ sub.User.firstName }} {{ sub.User.lastName }}</p>
                                        <p class="text-xs text-gray-400">{{ sub.User.email }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span v-if="(sub.status as string) === 'GRADED'" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                                        {{ sub.grade }}/{{ submissionsModal.maxPoints }}
                                    </span>
                                    <span v-else class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0000ff]">Submitted</span>
                                    <button v-if="(sub.status as string) !== 'GRADED'" @click="gradingId = gradingId === sub.id ? null : sub.id" class="text-xs font-semibold text-[#0000ff] hover:underline">Grade</button>
                                </div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                                <p v-if="sub.content" class="text-sm text-gray-700 whitespace-pre-line max-h-32 overflow-y-auto">{{ sub.content }}</p>
                                <p v-if="!sub.content && !sub.fileUrl" class="text-sm text-gray-400 italic">No text content.</p>
                                <a v-if="sub.fileUrl" :href="sub.fileUrl" target="_blank"
                                    class="inline-flex items-center gap-1.5 text-sm text-[#0000ff] hover:underline font-medium">
                                    <Paperclip class="w-3.5 h-3.5" /> Download submitted file
                                </a>
                            </div>
                            <!-- Grade form -->
                            <div v-if="gradingId === sub.id" class="space-y-2 pt-2 border-t border-gray-100">
                                <div class="flex gap-3">
                                    <input v-model="gradeForm.grade" type="number" :min="0" :max="submissionsModal.maxPoints" placeholder="Score" class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                                    <input v-model="gradeForm.feedback" type="text" placeholder="Feedback (optional)" class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                                    <button @click="submitGrade(sub.id)" :disabled="gradeSaving" class="bg-[#0000ff] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#0000cc] disabled:opacity-60">
                                        {{ gradeSaving ? '...' : 'Save' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
import { ChevronLeft, Plus, BookOpen, Play, ClipboardList, Trash2, X, Eye, EyeOff, Paperclip } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const route = useRoute()
const toast = useAppToast()
const courseId = Number(route.params.id)

interface Lesson { id: number; title: string; content: string; videoUrl: string | null; duration: number | null; order: number }
interface AssignmentSub { id: number; status: string; _count: { Submission: number }; title: string; description: string; dueDate: string; maxPoints: number }
interface Module { id: number; title: string; description: string | null; order: number; Lesson: Lesson[]; Assignment: AssignmentSub[] }
interface Course { id: number; title: string; code: string; isPublished: boolean; _count: { Enrollment: number }; Module: Module[] }

const course = ref<Course | null>(null)
const loading = ref(true)
const publishing = ref(false)

const showAddModule = ref(false)
const editingModule = ref<Module | null>(null)
const moduleForm = reactive({ title: '', description: '' })
const modalSaving = ref(false)
const modalError = ref('')

interface LessonModalState { mode: 'add' | 'edit'; module: Module; lesson?: Lesson }
const lessonModal = ref<LessonModalState | null>(null)
const lessonForm = reactive({ title: '', content: '', duration: '', videoUrl: '' })

interface AssignmentModalState { mode: 'add' | 'edit'; module: Module; assignment?: AssignmentSub }
const assignmentModal = ref<AssignmentModalState | null>(null)
const assignmentForm = reactive({ title: '', description: '', dueDate: '', maxPoints: '', publish: false })

interface Submission { id: number; status: string; grade: number | null; content: string | null; fileUrl: string | null; feedback: string | null; submittedAt: string; User: { firstName: string; lastName: string; email: string } }
interface AssignmentForSubmissions { id: number; title: string; maxPoints: number }
const submissionsModal = ref<AssignmentForSubmissions | null>(null)
const submissions = ref<Submission[]>([])
const loadingSubmissions = ref(false)
const gradingId = ref<number | null>(null)
const gradeForm = reactive({ grade: '', feedback: '' })
const gradeSaving = ref(false)

onMounted(fetchCourse)

async function fetchCourse() {
    loading.value = true
    try {
        course.value = await $fetch<Course>(`/api/instructor/courses/${courseId}`)
    } finally {
        loading.value = false
    }
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const togglePublish = async () => {
    if (!course.value) return
    publishing.value = true
    try {
        const r = await $fetch<{ isPublished: boolean }>(`/api/instructor/courses/${courseId}/publish`, { method: 'POST' })
        course.value.isPublished = r.isPublished
    } finally {
        publishing.value = false
    }
}

function closeModuleModal() { showAddModule.value = false; editingModule.value = null; moduleForm.title = ''; moduleForm.description = ''; modalError.value = '' }
function openEditModule(mod: Module) { editingModule.value = mod; moduleForm.title = mod.title; moduleForm.description = mod.description ?? ''; modalError.value = '' }

const saveModule = async () => {
    modalSaving.value = true; modalError.value = ''
    try {
        if (editingModule.value) {
            const updated = await $fetch<Module>(`/api/instructor/modules/${editingModule.value.id}`, { method: 'PUT', body: { title: moduleForm.title, description: moduleForm.description } })
            const idx = course.value!.Module.findIndex(m => m.id === editingModule.value!.id)
            if (idx !== -1) { const mod = course.value!.Module[idx]; if (mod) { mod.title = updated.title; mod.description = updated.description } }
        } else {
            const created = await $fetch<Module>(`/api/instructor/courses/${courseId}/modules`, { method: 'POST', body: { title: moduleForm.title, description: moduleForm.description } })
            course.value!.Module.push(created)
        }
        const wasEdit = !!editingModule.value
        closeModuleModal()
        toast.success(wasEdit ? 'Module updated.' : 'Module created.')
    } catch (e: any) {
        modalError.value = e.data?.message ?? 'Failed to save module.'
    } finally {
        modalSaving.value = false
    }
}

const deleteModule = async (id: number) => {
    if (!confirm('Delete this module? All lessons and assignments inside will also be deleted.')) return
    await $fetch(`/api/instructor/modules/${id}`, { method: 'DELETE' })
    course.value!.Module = course.value!.Module.filter(m => m.id !== id)
}

function openAddLesson(mod: Module) { lessonModal.value = { mode: 'add', module: mod }; Object.assign(lessonForm, { title: '', content: '', duration: '', videoUrl: '' }); modalError.value = '' }
function openEditLesson(mod: Module, lesson: Lesson) { lessonModal.value = { mode: 'edit', module: mod, lesson }; Object.assign(lessonForm, { title: lesson.title, content: lesson.content, duration: lesson.duration ?? '', videoUrl: lesson.videoUrl ?? '' }); modalError.value = '' }

const saveLesson = async () => {
    if (!lessonModal.value) return
    modalSaving.value = true; modalError.value = ''
    try {
        const body = { title: lessonForm.title, content: lessonForm.content, duration: lessonForm.duration || null, videoUrl: lessonForm.videoUrl || null }
        if (lessonModal.value.mode === 'edit' && lessonModal.value.lesson) {
            const updated = await $fetch<Lesson>(`/api/instructor/lessons/${lessonModal.value.lesson.id}`, { method: 'PUT', body })
            const mod = course.value!.Module.find(m => m.id === lessonModal.value!.module.id)!
            const idx = mod.Lesson.findIndex(l => l.id === updated.id)
            if (idx !== -1) mod.Lesson[idx] = updated
        } else {
            const created = await $fetch<Lesson>(`/api/instructor/modules/${lessonModal.value.module.id}/lessons`, { method: 'POST', body })
            const mod = course.value!.Module.find(m => m.id === lessonModal.value!.module.id)!
            mod.Lesson.push(created)
        }
        const wasEdit = lessonModal.value.mode === 'edit'
        lessonModal.value = null
        toast.success(wasEdit ? 'Lesson updated.' : 'Lesson created.')
    } catch (e: any) {
        modalError.value = e.data?.message ?? 'Failed to save lesson.'
    } finally {
        modalSaving.value = false
    }
}

const deleteLesson = async (mod: Module, id: number) => {
    if (!confirm('Delete this lesson?')) return
    await $fetch(`/api/instructor/lessons/${id}`, { method: 'DELETE' })
    mod.Lesson = mod.Lesson.filter(l => l.id !== id)
}

function openAddAssignment(mod: Module) { assignmentModal.value = { mode: 'add', module: mod }; Object.assign(assignmentForm, { title: '', description: '', dueDate: '', maxPoints: '', publish: false }); modalError.value = '' }
function openEditAssignment(mod: Module, a: AssignmentSub) {
    assignmentModal.value = { mode: 'edit', module: mod, assignment: a }
    const d = new Date(a.dueDate)
    const pad = (n: number) => String(n).padStart(2, '0')
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    Object.assign(assignmentForm, { title: a.title, description: a.description, dueDate: local, maxPoints: String(a.maxPoints), publish: (a.status as string) === 'PUBLISHED' })
    modalError.value = ''
}

const saveAssignment = async () => {
    if (!assignmentModal.value) return
    modalSaving.value = true; modalError.value = ''
    try {
        const body = { title: assignmentForm.title, description: assignmentForm.description, dueDate: assignmentForm.dueDate, maxPoints: assignmentForm.maxPoints, publish: assignmentForm.publish, status: assignmentForm.publish ? 'PUBLISHED' : 'DRAFT' }
        const mod = course.value!.Module.find(m => m.id === assignmentModal.value!.module.id)!
        if (assignmentModal.value.mode === 'edit' && assignmentModal.value.assignment) {
            const updated = await $fetch<AssignmentSub>(`/api/instructor/assignments/${assignmentModal.value.assignment.id}`, { method: 'PUT', body })
            const idx = mod.Assignment.findIndex(a => a.id === updated.id)
            if (idx !== -1) mod.Assignment[idx] = updated
        } else {
            const created = await $fetch<AssignmentSub>(`/api/instructor/modules/${assignmentModal.value.module.id}/assignments`, { method: 'POST', body })
            mod.Assignment.push(created)
        }
        const wasEdit = assignmentModal.value.mode === 'edit'
        assignmentModal.value = null
        toast.success(wasEdit ? 'Assignment updated.' : 'Assignment created.')
    } catch (e: any) {
        modalError.value = e.data?.message ?? 'Failed to save assignment.'
    } finally {
        modalSaving.value = false
    }
}

const deleteAssignment = async (mod: Module, id: number) => {
    if (!confirm('Delete this assignment? All student submissions will also be deleted.')) return
    await $fetch(`/api/instructor/assignments/${id}`, { method: 'DELETE' })
    mod.Assignment = mod.Assignment.filter(a => a.id !== id)
}

const viewSubmissions = async (a: AssignmentSub) => {
    submissionsModal.value = { id: a.id, title: a.title, maxPoints: a.maxPoints }
    submissions.value = []
    loadingSubmissions.value = true
    try {
        submissions.value = await $fetch<Submission[]>(`/api/instructor/assignments/${a.id}/submissions`)
    } finally {
        loadingSubmissions.value = false
    }
}

const submitGrade = async (submissionId: number) => {
    gradeSaving.value = true
    try {
        const updated = await $fetch<Submission>(`/api/instructor/submissions/${submissionId}/grade`, { method: 'POST', body: { grade: gradeForm.grade, feedback: gradeForm.feedback } })
        const idx = submissions.value.findIndex(s => s.id === submissionId)
        if (idx !== -1) submissions.value[idx] = updated
        gradingId.value = null
        gradeForm.grade = ''; gradeForm.feedback = ''
        toast.success('Grade saved and student notified.')
    } catch (e: unknown) {
        const err = e as { data?: { message?: string } }
        toast.error(err.data?.message ?? 'Failed to save grade.')
    } finally {
        gradeSaving.value = false
    }
}
</script>
