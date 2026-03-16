<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Courses</h1>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search courses..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          v-model="selectedCategory"
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Course Grid -->
    <div v-if="filteredCourses.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="course in filteredCourses"
        :key="course.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
      >
        <div class="h-40 bg-gray-200">
          <img
            v-if="course.thumbnailUrl"
            :src="course.thumbnailUrl"
            :alt="course.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        </div>
        <div class="p-4">
          <div class="text-xs text-indigo-600 font-medium mb-1">
            {{ course.category?.name || 'Uncategorized' }}
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">
            <NuxtLink :to="`/courses/${course.id}`" class="hover:text-indigo-600">
              {{ course.title }}
            </NuxtLink>
          </h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">
            {{ course.description }}
          </p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>{{ course.code }}</span>
            <NuxtLink
              :to="`/courses/${course.id}`"
              class="text-indigo-600 hover:text-indigo-700"
            >
              View Details
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600">No courses found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const selectedCategory = ref('')
const courses = ref([])
const categories = ref([])

// TODO: Fetch courses from API
// const { data } = await useFetch('/api/courses')
// courses.value = data.value

// Computed
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
