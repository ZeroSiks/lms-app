<template>
    <div class="p-6 max-w-5xl mx-auto space-y-6">

        <!-- Back -->
        <NuxtLink to="/dashboard/assignments" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft class="w-4 h-4" />
            Back to Assignments
        </NuxtLink>

        <!-- Loading -->
        <div v-if="pending" class="space-y-4">
            <div class="bg-white rounded-xl p-6 border border-gray-100 animate-pulse h-28" />
            <div class="bg-white rounded-xl p-6 border border-gray-100 animate-pulse h-60" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 text-red-700 rounded-xl p-4 text-sm font-medium">
            Failed to load submissions.
        </div>

        <template v-else-if="data">
            <!-- Assignment header -->
            <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <p class="text-xs font-semibold text-[#0000ff] uppercase tracking-wide mb-1">
                    {{ data.assignment.courseCode }} · {{ data.assignment.moduleName }}
                </p>
                <h1 class="text-xl font-bold text-gray-900 mb-1">{{ data.assignment.title }}</h1>
                <div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap mt-2">
                    <span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" /> Due {{ formatDate(data.assignment.dueDate) }}</span>
                    <span class="flex items-center gap-1"><Star class="w-3.5 h-3.5" /> {{ data.assignment.maxPoints }} points</span>
                    <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" /> {{ data.submissions.length }} submissions</span>
                </div>
            </div>

            <!-- Grading panel (shown when a submission is selected) -->
            <div v-if="selected" class="bg-white rounded-xl p-6 border border-[#0000ff]/20 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-semibold text-gray-900">
                            {{ selected.student.firstName }} {{ selected.student.lastName }}
                        </h2>
                        <p class="text-xs text-gray-400 mt-0.5">{{ selected.student.email }}</p>
                    </div>
                    <button @click="selected = null" class="text-gray-400 hover:text-gray-700 text-xs">Close</button>
                </div>

                <div class="flex items-center gap-2">
                    <span :class="submissionBadge(selected.status)">{{ selected.status }}</span>
                    <span class="text-xs text-gray-400">Submitted {{ formatDate(selected.submittedAt) }}</span>
                </div>

                <div v-if="selected.content" class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {{ selected.content }}
                </div>
                <a
                    v-if="selected.fileUrl"
                    :href="selected.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-sm text-[#0000ff] hover:underline"
                >
                    <Paperclip class="w-3.5 h-3.5" />
                    View attached file
                </a>

                <!-- Grade form -->
                <div v-if="selected.status !== 'GRADED'" class="border-t border-gray-100 pt-4 space-y-3">
                    <div class="flex items-center gap-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1" for="grade-input">
                                Grade (0 – {{ data.assignment.maxPoints }})
                            </label>
                            <input
                                id="grade-input"
                                v-model.number="gradeForm.grade"
                                type="number"
                                :min="0"
                                :max="data.assignment.maxPoints"
                                class="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1" for="feedback-input">
                            Feedback <span class="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="feedback-input"
                            v-model="gradeForm.feedback"
                            rows="3"
                            placeholder="Leave feedback for the student..."
                            maxlength="2000"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"
                        />
                    </div>
                    <p v-if="gradeError" class="text-sm text-red-600">{{ gradeError }}</p>
                    <button
                        @click="saveGrade"
                        :disabled="grading || gradeForm.grade == null"
                        class="inline-flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle class="w-4 h-4" />
                        {{ grading ? 'Saving...' : 'Save Grade' }}
                    </button>
                </div>
                <div v-else class="border-t border-gray-100 pt-4">
                    <p class="text-sm font-semibold text-green-700">
                        Graded: {{ selected.grade }}/{{ data.assignment.maxPoints }}
                    </p>
                    <p v-if="selected.feedback" class="text-sm text-gray-600 mt-1">{{ selected.feedback }}</p>
                </div>
            </div>

            <!-- Submissions table -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div v-if="data.submissions.length === 0" class="p-8 text-center text-sm text-gray-400">
                    No submissions yet.
                </div>
                <table v-else class="w-full text-sm">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr
                            v-for="sub in data.submissions"
                            :key="sub.id"
                            :class="['hover:bg-gray-50 transition-colors', selected?.id === sub.id ? 'bg-blue-50' : '']"
                        >
                            <td class="px-4 py-3 font-medium text-gray-900">
                                {{ sub.student.firstName }} {{ sub.student.lastName }}
                            </td>
                            <td class="px-4 py-3 text-gray-500">{{ formatDate(sub.submittedAt) }}</td>
                            <td class="px-4 py-3"><span :class="submissionBadge(sub.status)">{{ sub.status }}</span></td>
                            <td class="px-4 py-3 text-gray-700">
                                {{ sub.grade != null ? `${sub.grade}/${data.assignment.maxPoints}` : '—' }}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button
                                    @click="openGrade(sub)"
                                    class="text-xs font-semibold text-[#0000ff] hover:text-[#0000cc] transition-colors"
                                >
                                    {{ sub.status === 'GRADED' ? 'View' : 'Grade' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

    </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Clock, Star, Users, Paperclip, CheckCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const route = useRoute()

interface Submission {
    id: number
    submittedAt: string
    status: string
    grade: number | null
    feedback: string | null
    content: string | null
    fileUrl: string | null
    student: { id: number; firstName: string; lastName: string; email: string }
}

interface PageData {
    assignment: {
        id: number
        title: string
        dueDate: string
        maxPoints: number
        moduleName: string
        courseCode: string
    }
    submissions: Submission[]
}

const headers = computed(() => ({
    Authorization: auth.accessToken ? `Bearer ${auth.accessToken}` : '',
}))

// Load assignment details and submissions in parallel
const [assignmentResp, submissionsResp] = await Promise.all([
    useFetch(`/api/assignments/${route.params.id}`, { headers }),
    useFetch(`/api/assignments/${route.params.id}/submissions`, { headers }),
])

const pending = computed(() => assignmentResp.pending.value || submissionsResp.pending.value)
const error = computed(() => assignmentResp.error.value || submissionsResp.error.value)

const data = computed(() => {
    if (!assignmentResp.data.value || !submissionsResp.data.value) return null
    return {
        assignment: assignmentResp.data.value as PageData['assignment'],
        submissions: submissionsResp.data.value as Submission[],
    }
})

const selected = ref<Submission | null>(null)
const gradeForm = reactive<{ grade: number | null; feedback: string }>({ grade: null, feedback: '' })
const grading = ref(false)
const gradeError = ref('')

function openGrade(sub: Submission) {
    selected.value = sub
    gradeForm.grade = sub.grade
    gradeForm.feedback = sub.feedback ?? ''
    gradeError.value = ''
}

async function saveGrade() {
    if (gradeForm.grade == null || !selected.value) return
    grading.value = true
    gradeError.value = ''
    try {
        await $fetch(`/api/submissions/${selected.value.id}/grade`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            body: { grade: gradeForm.grade, feedback: gradeForm.feedback.trim() || undefined },
        })
        await submissionsResp.refresh()
        selected.value = null
    } catch (err: unknown) {
        gradeError.value = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to save grade.'
    } finally {
        grading.value = false
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
