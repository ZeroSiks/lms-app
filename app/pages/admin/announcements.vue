<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Announcements</h1>
        <p class="text-sm text-gray-400 mt-0.5">Manage course announcements across the platform</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 bg-[#0000ff] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0000cc] transition-colors"
      >
        <Megaphone class="w-4 h-4" />
        Post Announcement
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-24">
      <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="announcements.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
      <Megaphone class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-base font-semibold text-gray-700">No announcements yet</p>
      <p class="text-sm text-gray-400 mt-1">Post your first course announcement above.</p>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="a in announcements"
        :key="a.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <div class="flex items-start justify-between gap-4 mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold text-[#0000ff] uppercase tracking-wide">
                {{ a.Course.code }}
              </span>
              <span class="text-xs text-gray-400">&middot;</span>
              <span class="text-xs text-gray-500">{{ a.Course.title }}</span>
            </div>
            <h2 class="text-base font-semibold text-gray-900">{{ a.title }}</h2>
          </div>
          <button
            @click="confirmDelete(a.id)"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{{ a.content }}</p>
        <div class="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          <p class="text-xs text-gray-400">
            Posted by <span class="font-medium text-gray-600">{{ a.User.firstName }} {{ a.User.lastName }}</span>
            &middot; {{ relTime(a.createdAt) }}
          </p>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="showModal = false"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-bold text-gray-900">Post Announcement</h2>
            <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <p v-if="error" class="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{{ error }}</p>

          <form class="space-y-4" @submit.prevent="submit">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Course <span class="text-red-500">*</span></label>
              <select
                v-model="form.courseId"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] bg-white"
              >
                <option :value="null" disabled>Select a course...</option>
                <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }} ({{ c.code }})</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Midterm Exam Schedule"
                maxlength="200"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Content <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.content"
                rows="4"
                placeholder="Write your announcement..."
                maxlength="5000"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"
              ></textarea>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showModal = false" class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="posting" class="flex-1 py-2.5 rounded-lg bg-[#0000ff] text-white text-sm font-semibold hover:bg-[#0000cc] transition-colors disabled:opacity-60">
                {{ posting ? 'Posting...' : 'Post Announcement' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Megaphone, Trash2, X } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface Announcement {
  id: number
  title: string
  content: string
  createdAt: string
  User: { id: number; firstName: string; lastName: string; role: string }
  Course: { id: number; title: string; code: string }
}

interface CourseOption {
  id: number
  title: string
  code: string
}

const announcements = ref<Announcement[]>([])
const courses = ref<CourseOption[]>([])
const loading = ref(true)
const showModal = ref(false)
const posting = ref(false)
const error = ref('')
const form = reactive({ courseId: null as number | null, title: '', content: '' })

const fetchAll = async () => {
  loading.value = true
  try {
    const [anns, crs] = await Promise.all([
      $fetch<Announcement[]>('/api/announcements'),
      $fetch<CourseOption[]>('/api/courses'),
    ])
    announcements.value = anns
    courses.value = crs
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

const openCreate = () => {
  form.courseId = null
  form.title = ''
  form.content = ''
  error.value = ''
  showModal.value = true
}

const submit = async () => {
  error.value = ''
  if (!form.courseId || !form.title.trim() || !form.content.trim()) {
    error.value = 'All fields are required.'
    return
  }
  posting.value = true
  try {
    const created = await $fetch<Announcement>('/api/announcements', {
      method: 'POST',
      body: { courseId: form.courseId, title: form.title.trim(), content: form.content.trim() },
    })
    announcements.value.unshift(created)
    showModal.value = false
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    error.value = e.data?.message ?? 'Failed to post announcement.'
  } finally {
    posting.value = false
  }
}

const confirmDelete = async (id: number) => {
  if (!confirm('Delete this announcement?')) return
  await $fetch(`/api/announcements/${id}`, { method: 'DELETE' })
  announcements.value = announcements.value.filter(a => a.id !== id)
}

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
