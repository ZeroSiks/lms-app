<template>
    <div>
        <CommonLoadingScreen />

        <!-- Page header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-1">Explore Courses</h1>
            <p class="text-gray-500 text-sm">Browse our full catalogue and find what you want to learn.</p>
        </div>

        <!-- Search & filter bar -->
        <div class="flex flex-col sm:flex-row gap-3 mb-8">
            <div class="relative flex-1">
                <svg
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search courses..."
                    class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition"
                />
            </div>
            <select
                v-model="selectedCategory"
                class="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] transition bg-white"
            >
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <!-- Course grid -->
        <div v-if="filteredCourses.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                v-for="course in filteredCourses"
                :key="course.id"
                class="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
                <!-- Thumbnail -->
                <div class="h-40 bg-gradient-to-br from-[#f0f4ff] to-[#dbeafe] flex items-center justify-center overflow-hidden">
                    <img
                        v-if="course.thumbnailUrl"
                        :src="course.thumbnailUrl"
                        :alt="course.title"
                        class="w-full h-full object-cover"
                    />
                    <svg
                        v-else
                        class="w-10 h-10 text-[#0000ff] opacity-30"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                </div>

                <!-- Content -->
                <div class="p-5">
                    <span class="text-xs font-semibold text-[#0000ff] uppercase tracking-wide">
                        {{ course.category?.name || 'General' }}
                    </span>
                    <h3 class="font-semibold text-gray-900 mt-1 mb-2 group-hover:text-[#0000ff] transition-colors">
                        <NuxtLink :to="`/courses/${course.id}`">
                            {{ course.title }}
                        </NuxtLink>
                    </h3>
                    <p class="text-sm text-gray-500 line-clamp-2 mb-4">
                        {{ course.description }}
                    </p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-400 font-mono">{{ course.code }}</span>
                        <NuxtLink
                            :to="`/courses/${course.id}`"
                            class="text-xs font-semibold text-[#0000ff] hover:text-[#0000cc] transition-colors"
                        >
                            View Details →
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-16 h-16 rounded-2xl bg-[#f0f4ff] flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-[#0000ff] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <p class="text-gray-900 font-semibold mb-1">No courses found</p>
            <p class="text-gray-400 text-sm">Try adjusting your search or filter.</p>
        </div>

    </div>
</template>

<script setup lang="ts">
interface Category {
    id: number
    name: string
}

interface Course {
    id: number
    title: string
    description?: string
    code?: string
    thumbnailUrl?: string
    categoryId?: number
    category?: Category
}

const searchQuery = ref('')
const selectedCategory = ref('')
const courses = ref<Course[]>([])
const categories = ref<Category[]>([])

// TODO: Fetch courses from API
// const { data } = await useFetch('/api/courses')
// courses.value = data.value

const filteredCourses = computed(() => {
    let result = courses.value

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
            c =>
                c.title.toLowerCase().includes(query) ||
                c.description?.toLowerCase().includes(query) ||
                c.code?.toLowerCase().includes(query)
        )
    }

    if (selectedCategory.value) {
        result = result.filter(c => c.categoryId === parseInt(selectedCategory.value))
    }

    return result
})
</script>
