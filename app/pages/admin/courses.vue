<template>
    <div class="p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Courses</h1>
                <p class="text-sm text-gray-400 mt-0.5">Create and manage all courses</p>
            </div>
            <button
                @click="showCreateModal = true"
                class="flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0000cc] transition-colors"
            >
                <Plus class="w-4 h-4" />
                Add Course
            </button>
        </div>

        <!-- Search Bar -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div class="relative max-w-sm">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by title or code..."
                    class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-sm text-gray-400 mt-3">Loading courses...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filtered.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-base font-semibold text-gray-700">
                {{ searchQuery ? 'No courses match your search' : 'No courses yet' }}
            </p>
            <p class="text-sm text-gray-400 mt-1">
                {{ searchQuery ? 'Try a different search term.' : 'Click "Add Course" to create the first one.' }}
            </p>
        </div>

        <!-- Courses Table -->
        <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Course</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Duration</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Instructor</th>
                        <th class="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Enrolled</th>
                        <th class="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr
                        v-for="course in filtered"
                        :key="course.id"
                        class="hover:bg-gray-50/50 transition-colors"
                    >
                        <!-- Course -->
                        <td class="py-4 px-5">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-[#0000ff]/8 flex items-center justify-center flex-shrink-0">
                                    <BookOpen class="w-4.5 h-4.5 text-[#0000ff]" />
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-gray-900 leading-snug">{{ course.title }}</p>
                                    <p class="text-xs text-gray-400 font-mono mt-0.5">{{ course.code }}</p>
                                </div>
                            </div>
                        </td>

                        <!-- Duration -->
                        <td class="py-4 px-5 text-sm text-gray-500">
                            {{ course.duration || '—' }}
                        </td>

                        <!-- Instructor -->
                        <td class="py-4 px-5">
                            <div v-if="course.User" class="flex items-center gap-2">
                                <span class="text-sm text-gray-700">{{ course.User.firstName }} {{ course.User.lastName }}</span>
                                <button
                                    @click="openAssignModal(course)"
                                    class="text-xs text-[#0000ff] hover:underline"
                                >Change</button>
                            </div>
                            <button
                                v-else
                                @click="openAssignModal(course)"
                                class="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
                            >
                                <UserPlus class="w-3.5 h-3.5" />
                                Assign
                            </button>
                        </td>

                        <!-- Enrolled count -->
                        <td class="py-4 px-5">
                            <span class="text-sm text-gray-700 font-medium">{{ course._count.Enrollment }}</span>
                            <span class="text-xs text-gray-400 ml-1">students</span>
                        </td>

                        <!-- Actions -->
                        <td class="py-4 px-5">
                            <div class="flex items-center justify-end">
                                <button
                                    @click="deleteCourse(course.id)"
                                    :disabled="deletingId === course.id"
                                    class="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 class="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                <p class="text-xs text-gray-400">
                    Showing {{ filtered.length }} of {{ courses.length }} course{{ courses.length !== 1 ? 's' : '' }}
                </p>
            </div>
        </div>

        <!-- Create Course Modal -->
        <Teleport to="body">
            <div
                v-if="showCreateModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="showCreateModal = false"
            >
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="text-base font-bold text-gray-900">Create New Course</h2>
                        <button @click="showCreateModal = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <X class="w-4 h-4" />
                        </button>
                    </div>

                    <div v-if="createError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                        {{ createError }}
                    </div>

                    <form class="space-y-4" @submit.prevent="submitCreate">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
                            <input
                                v-model="createForm.title"
                                type="text"
                                required
                                placeholder="e.g. Introduction to Computer Science"
                                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
                            <textarea
                                v-model="createForm.description"
                                required
                                rows="3"
                                placeholder="Brief course overview..."
                                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Duration <span class="text-gray-400 font-normal">(optional)</span></label>
                            <input
                                v-model="createForm.duration"
                                type="text"
                                placeholder="e.g. 12 weeks"
                                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                            />
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" @click="showCreateModal = false" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" :disabled="creating" class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] transition-colors disabled:opacity-60">
                                {{ creating ? 'Creating...' : 'Create Course' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Assign Instructor Modal -->
        <Teleport to="body">
            <div
                v-if="assignModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="assignModal = null"
            >
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                    <div class="flex items-center justify-between mb-5">
                        <div>
                            <h2 class="text-base font-bold text-gray-900">Assign Instructor</h2>
                            <p class="text-xs text-gray-400 mt-0.5">{{ assignModal.title }}</p>
                        </div>
                        <button @click="assignModal = null" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <X class="w-4 h-4" />
                        </button>
                    </div>

                    <div v-if="instructors.length === 0" class="py-4 text-center">
                        <p class="text-sm text-gray-500">No approved instructors found.</p>
                        <p class="text-xs text-gray-400 mt-1">Approve instructor accounts first.</p>
                    </div>
                    <div v-else class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Select Instructor</label>
                        <select
                            v-model="selectedInstructorId"
                            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] bg-white"
                        >
                            <option :value="null">— Remove instructor —</option>
                            <option v-for="ins in instructors" :key="ins.id" :value="ins.id">
                                {{ ins.firstName }} {{ ins.lastName }} ({{ ins.email }})
                            </option>
                        </select>
                        <div class="flex gap-3 pt-2">
                            <button @click="assignModal = null" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                @click="submitAssign"
                                :disabled="assigning"
                                class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] transition-colors disabled:opacity-60"
                            >
                                {{ assigning ? 'Saving...' : 'Save' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
import { Search, Plus, BookOpen, UserPlus, Trash2, X } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface Instructor {
    id: number
    firstName: string
    lastName: string
    email: string
}

interface Course {
    id: number
    title: string
    code: string
    duration: string | null
    isPublished: boolean
    createdAt: string
    User: { id: number; firstName: string; lastName: string } | null
    _count: { Enrollment: number }
}

const courses = ref<Course[]>([])
const instructors = ref<Instructor[]>([])
const loading = ref(true)
const searchQuery = ref('')

const showCreateModal = ref(false)
const createForm = reactive({ title: '', description: '', duration: '' })
const creating = ref(false)
const createError = ref('')

const assignModal = ref<Course | null>(null)
const selectedInstructorId = ref<number | null>(null)
const assigning = ref(false)

const deletingId = ref<number | null>(null)

const filtered = computed(() => {
    if (!searchQuery.value.trim()) return courses.value
    const q = searchQuery.value.toLowerCase()
    return courses.value.filter(c =>
        c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    )
})

const fetchCourses = async () => {
    loading.value = true
    try {
        courses.value = await $fetch<Course[]>('/api/admin/courses')
    } finally {
        loading.value = false
    }
}

const fetchInstructors = async () => {
    instructors.value = await $fetch<Instructor[]>('/api/admin/instructors')
}

onMounted(() => {
    fetchCourses()
    fetchInstructors()
})

const submitCreate = async () => {
    creating.value = true
    createError.value = ''
    try {
        const created = await $fetch<Course>('/api/admin/courses', {
            method: 'POST',
            body: { title: createForm.title, description: createForm.description, duration: createForm.duration },
        })
        courses.value.unshift(created)
        showCreateModal.value = false
        createForm.title = ''
        createForm.description = ''
        createForm.duration = ''
    } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        createError.value = e.data?.message ?? 'Failed to create course.'
    } finally {
        creating.value = false
    }
}

const openAssignModal = (course: Course) => {
    assignModal.value = course
    selectedInstructorId.value = course.User?.id ?? null
}

const submitAssign = async () => {
    if (!assignModal.value) return
    assigning.value = true
    try {
        const updated = await $fetch<Course>(`/api/admin/courses/${assignModal.value.id}/assign-instructor`, {
            method: 'POST',
            body: { instructorId: selectedInstructorId.value },
        })
        const idx = courses.value.findIndex(c => c.id === updated.id)
        if (idx !== -1) courses.value[idx] = updated
        assignModal.value = null
    } finally {
        assigning.value = false
    }
}

const deleteCourse = async (id: number) => {
    if (!confirm('Delete this course? This will also remove all enrollment records.')) return
    deletingId.value = id
    try {
        await $fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
        courses.value = courses.value.filter(c => c.id !== id)
    } finally {
        deletingId.value = null
    }
}
</script>
