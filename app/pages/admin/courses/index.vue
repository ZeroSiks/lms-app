<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Course Management</h1>
                <p class="text-sm text-gray-400 mt-0.5">Create, edit and delete courses</p>
            </div>
            <button
                @click="showCreateModal = true"
                class="flex items-center gap-2 bg-[#0000ff] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0000cc] transition"
            >
                + New Course
            </button>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="flex justify-center py-24">
            <div class="w-8 h-8 border-4 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Course Table -->
        <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100">
                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Title</th>
                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Code</th>
                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Instructor</th>
                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="course in courses" :key="course.id" class="hover:bg-gray-50">
                        <td class="py-3 px-4 font-medium text-gray-900">{{ course.title }}</td>
                        <td class="py-3 px-4 text-gray-500 font-mono text-xs">{{ course.code }}</td>
                        <td class="py-3 px-4 text-gray-500">
                            {{ course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : '—' }}
                        </td>
                        <td class="py-3 px-4">
                            <div class="flex items-center gap-2">
                                <button
                                    @click="openEdit(course)"
                                    class="text-xs font-semibold text-[#0000ff] hover:underline"
                                >Edit</button>
                                <button
                                    @click="deleteCourse(course.id)"
                                    class="text-xs font-semibold text-red-500 hover:underline"
                                >Delete</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="courses.length === 0" class="text-center py-16 text-gray-400 text-sm">
                No courses yet. Create one!
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 class="text-lg font-bold text-gray-900 mb-4">{{ showEditModal ? 'Edit Course' : 'Create Course' }}</h2>
                <div class="space-y-3">
                    <input
                        v-model="form.title"
                        placeholder="Course Title"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                    />
                    <input
                        v-model="form.code"
                        placeholder="Course Code (e.g. CS101)"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                    />
                    <textarea
                        v-model="form.description"
                        placeholder="Description"
                        rows="3"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                    />
                    <input
                        v-if="!showEditModal"
                        v-model.number="form.instructorId"
                        placeholder="Instructor ID"
                        type="number"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
                    />
                </div>
                <p v-if="formError" class="text-red-500 text-xs mt-2">{{ formError }}</p>
                <div class="flex gap-2 mt-4">
                    <button
                        @click="showEditModal ? submitEdit() : submitCreate()"
                        class="flex-1 bg-[#0000ff] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0000cc] transition"
                    >
                        {{ showEditModal ? 'Save Changes' : 'Create' }}
                    </button>
                    <button
                        @click="closeModal"
                        class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface Course {
    id: number
    title: string
    description?: string
    code?: string
    instructor?: { id: number, firstName: string, lastName: string }
}

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingId = ref<number | null>(null)
const formError = ref('')

const form = ref({
    title: '',
    code: '',
    description: '',
    instructorId: 0,
})

const { data: coursesData, pending, refresh } = await useFetch<Course[]>('/api/courses')
const courses = computed(() => coursesData.value ?? [])

function openEdit(course: Course) {
    form.value = {
        title: course.title,
        code: course.code ?? '',
        description: course.description ?? '',
        instructorId: course.instructor?.id ?? 0,
    }
    editingId.value = course.id
    showEditModal.value = true
}

function closeModal() {
    showCreateModal.value = false
    showEditModal.value = false
    editingId.value = null
    formError.value = ''
    form.value = { title: '', code: '', description: '', instructorId: 0 }
}

async function submitCreate() {
    formError.value = ''
    if (!form.value.title || !form.value.code) {
        formError.value = 'Title and code are required'
        return
    }
    await $fetch('/api/courses', {
        method: 'POST',
        body: form.value,
    })
    await refresh()
    closeModal()
}

async function submitEdit() {
    formError.value = ''
    if (!form.value.title || !form.value.code) {
        formError.value = 'Title and code are required'
        return
    }
    await $fetch(`/api/courses/${editingId.value}`, {
        method: 'PUT',
        body: { title: form.value.title, code: form.value.code, description: form.value.description },
    })
    await refresh()
    closeModal()
}

async function deleteCourse(id: number) {
    if (!confirm('Delete this course?')) return
    await $fetch(`/api/courses/${id}`, { method: 'DELETE' })
    await refresh()
}
</script>