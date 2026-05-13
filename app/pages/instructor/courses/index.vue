<template>
    <div class="p-6 space-y-6">

        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-bold text-gray-900">My Courses</h1>
                <p class="text-sm text-gray-400 mt-0.5">Manage content for your assigned courses</p>
            </div>
        </div>

        <div v-if="loading" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <div class="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-sm text-gray-400 mt-3">Loading courses...</p>
        </div>

        <div v-else-if="courses.length === 0" class="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-base font-semibold text-gray-700">No courses assigned</p>
            <p class="text-sm text-gray-400 mt-1">An administrator will assign courses to you.</p>
        </div>

        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
                v-for="course in courses"
                :key="course.id"
                :to="`/instructor/courses/${course.id}`"
                class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0000ff]/20 transition-all duration-200 group"
            >
                <div class="flex items-start justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-[#0000ff]/8 flex items-center justify-center">
                        <BookOpen class="w-5 h-5 text-[#0000ff]" />
                    </div>
                    <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', course.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500']">
                        {{ course.isPublished ? 'Published' : 'Draft' }}
                    </span>
                </div>
                <h3 class="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#0000ff] transition-colors">{{ course.title }}</h3>
                <p class="text-xs text-gray-400 font-mono mt-1">{{ course.code }}</p>
                <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
                    <span class="flex items-center gap-1"><Users class="w-3.5 h-3.5" /> {{ course._count.Enrollment }} students</span>
                    <span class="flex items-center gap-1"><BookMarked class="w-3.5 h-3.5" /> {{ course._count.Module }} modules</span>
                </div>
            </NuxtLink>
        </div>

    </div>
</template>

<script setup lang="ts">
import { BookOpen, Users, BookMarked } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

interface Course {
    id: number; title: string; code: string; isPublished: boolean
    _count: { Enrollment: number; Module: number }
}

const courses = ref<Course[]>([])
const loading = ref(true)

onMounted(async () => {
    try {
        courses.value = await $fetch<Course[]>('/api/instructor/courses')
    } finally {
        loading.value = false
    }
})
</script>
