<template>
    <div class="p-6 max-w-3xl mx-auto space-y-6">

        <div v-if="loading" class="flex items-center justify-center py-24">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="assignment">

            <!-- Back -->
            <NuxtLink :to="`/courses/${route.params.id}`" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ChevronLeft class="w-4 h-4" /> Back to course
            </NuxtLink>

            <!-- Assignment header -->
            <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <ClipboardList class="w-4 h-4 text-orange-500" />
                            </div>
                            <span class="text-xs text-gray-400 font-medium">Assignment</span>
                        </div>
                        <h1 class="text-xl font-bold text-gray-900">{{ assignment.title }}</h1>
                        <p class="text-sm text-gray-600 mt-2 leading-relaxed">{{ assignment.description }}</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                        <p class="text-2xl font-black text-gray-900">{{ assignment.maxPoints }}</p>
                        <p class="text-xs text-gray-400">points</p>
                    </div>
                </div>

                <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                    <div class="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar class="w-3.5 h-3.5" />
                        Due {{ formatDate(assignment.dueDate) }}
                    </div>
                    <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', isPastDue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600']">
                        {{ isPastDue ? 'Overdue' : daysUntilDue + ' days left' }}
                    </span>
                </div>
            </div>

            <!-- Graded result -->
            <div v-if="submission?.status === 'GRADED'" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <CheckCircle class="w-5 h-5 text-green-500" />
                        <h2 class="text-sm font-semibold text-gray-900">Graded</h2>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-black text-[#0000ff]">{{ submission.grade }}</span>
                        <span class="text-sm text-gray-400">/{{ assignment.maxPoints }}</span>
                    </div>
                </div>
                <div v-if="submission.feedback" class="bg-blue-50 rounded-lg p-4">
                    <p class="text-xs font-semibold text-[#0000ff] mb-1">Instructor feedback</p>
                    <p class="text-sm text-gray-700 whitespace-pre-line">{{ submission.feedback }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p class="text-xs font-semibold text-gray-500">Your submission</p>
                    <p v-if="submission.content" class="text-sm text-gray-700 whitespace-pre-line">{{ submission.content }}</p>
                    <a v-if="submission.fileUrl" :href="submission.fileUrl" target="_blank"
                        class="inline-flex items-center gap-2 text-sm text-[#0000ff] hover:underline font-medium">
                        <Paperclip class="w-4 h-4" /> View submitted file
                    </a>
                </div>
            </div>

            <!-- Submitted (pending grading) -->
            <div v-else-if="submission?.status === 'SUBMITTED'" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <h2 class="text-sm font-semibold text-gray-900">Submitted — awaiting grade</h2>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p class="text-xs font-semibold text-gray-500">Your submission</p>
                    <p v-if="submission.content" class="text-sm text-gray-700 whitespace-pre-line">{{ submission.content }}</p>
                    <a v-if="submission.fileUrl" :href="submission.fileUrl" target="_blank"
                        class="inline-flex items-center gap-2 text-sm text-[#0000ff] hover:underline font-medium">
                        <Paperclip class="w-4 h-4" /> View submitted file
                    </a>
                </div>
                <p class="text-xs text-gray-400">Submitted {{ formatDateTime(submission.submittedAt) }}</p>
            </div>

            <!-- Submission form -->
            <div v-else class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h2 class="text-sm font-semibold text-gray-900">Your submission</h2>

                <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                    {{ submitError }}
                </div>

                <textarea
                    v-model="content"
                    rows="8"
                    placeholder="Write your answer here... (optional if uploading a file)"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"
                ></textarea>

                <!-- File upload -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-2">Attach a file <span class="text-gray-400 font-normal">(PDF, Word, PPT, image — max 10MB)</span></label>
                    <div
                        @dragover.prevent="dragOver = true"
                        @dragleave="dragOver = false"
                        @drop.prevent="onDrop"
                        :class="['border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer', dragOver ? 'border-[#0000ff] bg-blue-50' : 'border-gray-200 hover:border-[#0000ff]/40 hover:bg-gray-50']"
                        @click="fileInput?.click()"
                    >
                        <input ref="fileInput" type="file" class="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" @change="onFileChange" />
                        <div v-if="!selectedFile">
                            <Paperclip class="w-6 h-6 text-gray-300 mx-auto mb-2" />
                            <p class="text-sm text-gray-500">Drop a file here or <span class="text-[#0000ff] font-medium">browse</span></p>
                        </div>
                        <div v-else class="flex items-center gap-3 justify-center">
                            <div class="w-8 h-8 bg-[#0000ff]/10 rounded-lg flex items-center justify-center">
                                <Paperclip class="w-4 h-4 text-[#0000ff]" />
                            </div>
                            <div class="text-left">
                                <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                                <p class="text-xs text-gray-400">{{ formatBytes(selectedFile.size) }}</p>
                            </div>
                            <button @click.stop="selectedFile = null" class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-400">{{ content.length }} characters{{ selectedFile ? ` + 1 file` : '' }}</p>
                    <button
                        @click="submitAssignment"
                        :disabled="submitting || (!content.trim() && !selectedFile)"
                        class="flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-60"
                    >
                        <Send class="w-4 h-4" />
                        {{ submitting ? 'Submitting...' : 'Submit Assignment' }}
                    </button>
                </div>
            </div>

        </template>

        <div v-else class="text-center py-24 text-gray-400 text-sm">Assignment not found.</div>
    </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ClipboardList, Calendar, CheckCircle, Send, Paperclip } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const route = useRoute()
const toast = useAppToast()
const courseId = route.params.id
const assignmentId = route.params.assignmentId

interface SubmissionData {
    id: number; status: string; grade: number | null
    feedback: string | null; content: string | null
    fileUrl: string | null; submittedAt: string
}
interface AssignmentData {
    id: number; title: string; description: string; dueDate: string; maxPoints: number
    Submission: SubmissionData[]
}

const assignment = ref<AssignmentData | null>(null)
const loading = ref(true)
const content = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const dragOver = ref(false)
const submitting = ref(false)
const submitError = ref('')

const submission = computed(() => assignment.value?.Submission[0] ?? null)
const isPastDue = computed(() => assignment.value ? new Date(assignment.value.dueDate) < new Date() : false)
const daysUntilDue = computed(() => {
    if (!assignment.value) return 0
    return Math.ceil((new Date(assignment.value.dueDate).getTime() - Date.now()) / 86400000)
})

onMounted(async () => {
    try {
        const course = await $fetch<any>(`/api/courses/${courseId}`)
        for (const mod of course.Module) {
            const found = mod.Assignment.find((a: any) => a.id === Number(assignmentId))
            if (found) { assignment.value = found; break }
        }
    } catch { /* handled below */ } finally {
        loading.value = false
    }
})

const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement
    selectedFile.value = input.files?.[0] ?? null
}
const onDrop = (e: DragEvent) => {
    dragOver.value = false
    selectedFile.value = e.dataTransfer?.files?.[0] ?? null
}
const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const submitAssignment = async () => {
    submitting.value = true
    submitError.value = ''
    try {
        let result: SubmissionData
        if (selectedFile.value) {
            const form = new FormData()
            form.append('content', content.value)
            form.append('file', selectedFile.value)
            result = await $fetch<SubmissionData>(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
                method: 'POST',
                body: form,
            })
        } else {
            result = await $fetch<SubmissionData>(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
                method: 'POST',
                body: { content: content.value },
            })
        }
        if (assignment.value) assignment.value.Submission = [result]
        toast.success('Assignment submitted successfully.')
    } catch (e: unknown) {
        const err = e as { data?: { message?: string } }
        submitError.value = err.data?.message ?? 'Submission failed. Please try again.'
    } finally {
        submitting.value = false
    }
}
</script>
