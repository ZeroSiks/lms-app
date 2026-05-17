<template>
    <div class="p-6 max-w-3xl mx-auto space-y-6">

        <!-- Back -->
        <NuxtLink to="/dashboard/assignments" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft class="w-4 h-4" />
            Back to Assignments
        </NuxtLink>

        <!-- Loading -->
        <div v-if="pending" class="space-y-4">
            <div class="bg-white rounded-xl p-6 border border-gray-100 animate-pulse h-40" />
            <div class="bg-white rounded-xl p-6 border border-gray-100 animate-pulse h-60" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm font-medium">
            {{ error.statusCode === 404 ? 'Assignment not found.' : 'Failed to load assignment.' }}
        </div>

        <template v-else-if="assignment">
            <!-- Assignment detail card -->
            <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div class="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <p class="text-xs font-semibold text-[#0000ff] uppercase tracking-wide mb-1">
                            {{ assignment.courseCode }} · {{ assignment.moduleName }}
                        </p>
                        <h1 class="text-xl font-bold text-gray-900">{{ assignment.title }}</h1>
                    </div>
                    <span :class="statusBadge(assignment.status)">{{ assignment.status }}</span>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed mb-4">{{ assignment.description }}</p>
                <div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span class="flex items-center gap-1">
                        <Clock class="w-3.5 h-3.5" />
                        Due {{ formatDate(assignment.dueDate) }}
                        <span v-if="isOverdue(assignment.dueDate)" class="text-red-500 font-semibold">(overdue)</span>
                    </span>
                    <span class="flex items-center gap-1">
                        <Star class="w-3.5 h-3.5" />
                        {{ assignment.maxPoints }} points
                    </span>
                </div>
            </div>

            <!-- Existing submission -->
            <div v-if="assignment.mySubmission" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="font-semibold text-gray-900">Your Submission</h2>
                    <span :class="submissionBadge(assignment.mySubmission.status)">
                        {{ assignment.mySubmission.status }}
                        <template v-if="assignment.mySubmission.grade !== null">
                            · {{ assignment.mySubmission.grade }}/{{ assignment.maxPoints }}
                        </template>
                    </span>
                </div>
                <p v-if="assignment.mySubmission.content" class="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                    {{ assignment.mySubmission.content }}
                </p>
                <a
                    v-if="assignment.mySubmission.fileUrl"
                    :href="assignment.mySubmission.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-sm text-[#0000ff] hover:underline"
                >
                    <Paperclip class="w-3.5 h-3.5" />
                    View attached file
                </a>
                <div v-if="assignment.mySubmission.feedback" class="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p class="text-xs font-semibold text-[#0000ff] mb-1">Instructor Feedback</p>
                    <p class="text-sm text-gray-700">{{ assignment.mySubmission.feedback }}</p>
                </div>
            </div>

            <!-- Submit form (only if not yet submitted / graded) -->
            <div
                v-else-if="assignment.status === 'PUBLISHED'"
                class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
            >
                <h2 class="font-semibold text-gray-900 mb-4">Submit Your Work</h2>

                <div v-if="isOverdue(assignment.dueDate)" class="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4">
                    <AlertTriangle class="w-4 h-4 flex-shrink-0" />
                    The due date has passed. This submission will be marked as <strong class="ml-1">LATE</strong>.
                </div>

                <form @submit.prevent="submitAssignment" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1" for="content">
                            Written Response <span class="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="content"
                            v-model="form.content"
                            rows="6"
                            placeholder="Type your response here..."
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition resize-none"
                            maxlength="10000"
                        />
                        <p class="text-xs text-gray-400 mt-1 text-right">{{ form.content.length }}/10,000</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1" for="fileUrl">
                            File URL <span class="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="fileUrl"
                            v-model="form.fileUrl"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                        />
                    </div>

                    <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>

                    <button
                        type="submit"
                        :disabled="submitting || (!form.content.trim() && !form.fileUrl.trim())"
                        class="inline-flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send class="w-4 h-4" />
                        {{ submitting ? 'Submitting...' : 'Submit Assignment' }}
                    </button>
                </form>
            </div>

            <div v-else class="bg-gray-50 rounded-xl p-5 text-sm text-gray-500 text-center border border-gray-100">
                This assignment is {{ assignment.status.toLowerCase() }} and is not accepting submissions.
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ArrowLeft, Clock, Star, Paperclip, AlertTriangle, Send } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const route = useRoute()

interface Assignment {
    id: number
    title: string
    description: string
    dueDate: string
    maxPoints: number
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
    moduleName: string
    courseCode: string
    mySubmission: {
        id: number
        content: string | null
        fileUrl: string | null
        status: string
        grade: number | null
        feedback: string | null
        submittedAt: string
    } | null
}

const { data: assignment, pending, error, refresh } = await useFetch<Assignment>(
    `/api/assignments/${route.params.id}`,
    {
        headers: computed(() => ({
            Authorization: auth.accessToken ? `Bearer ${auth.accessToken}` : '',
        })),
    }
)

const form = reactive({ content: '', fileUrl: '' })
const submitting = ref(false)
const formError = ref('')

async function submitAssignment() {
    formError.value = ''
    if (!form.content.trim() && !form.fileUrl.trim()) {
        formError.value = 'Please provide a written response or a file URL.'
        return
    }
    submitting.value = true
    try {
        await $fetch('/api/submissions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            body: {
                assignmentId: Number(route.params.id),
                content: form.content.trim() || undefined,
                fileUrl: form.fileUrl.trim() || undefined,
            },
        })
        await refresh()
    } catch (err: unknown) {
        formError.value = (err as { data?: { message?: string } })?.data?.message ?? 'Submission failed. Please try again.'
    } finally {
        submitting.value = false
    }
}

function isOverdue(dateStr: string) {
    return new Date(dateStr) < new Date()
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusBadge(status: string) {
    const map: Record<string, string> = {
        DRAFT: 'bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold px-2 py-0.5 rounded-full',
        PUBLISHED: 'bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2 py-0.5 rounded-full',
        CLOSED: 'bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full',
    }
    return map[status] ?? map.DRAFT
}

function submissionBadge(status: string) {
    const map: Record<string, string> = {
        SUBMITTED: 'bg-blue-50 text-[#0000ff] text-xs font-semibold px-2 py-0.5 rounded-full',
        LATE: 'bg-orange-50 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full',
        GRADED: 'bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full',
        PENDING: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full',
    }
    return map[status] ?? map.PENDING
}
</script>
