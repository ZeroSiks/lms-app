<template>
  <div>
    <!-- Back Link -->
    <NuxtLink
      to="/courses"
      class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
    >
      ← Back to Courses
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <p class="text-gray-600">Loading course...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">Course not found</p>
      <NuxtLink to="/courses" class="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
        Browse Courses
      </NuxtLink>
    </div>

    <!-- Course Content -->
    <div v-else>
      <!-- Course Header -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm text-indigo-600 font-medium mb-1">
              {{ course.category?.name }}
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ course.title }}
            </h1>
            <p class="text-gray-600">{{ course.code }}</p>
          </div>

          <!-- Enroll Button -->
          <div v-if="!isEnrolled && user?.id !== course.instructorId">
            <button
              @click="handleEnroll"
              class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Enroll Now
            </button>
          </div>
          <div v-else-if="isEnrolled" class="text-green-600 font-medium">
            ✓ Enrolled
          </div>
        </div>

        <p class="mt-4 text-gray-700">{{ course.description }}</p>

        <div class="mt-4 flex gap-4 text-sm text-gray-500">
          <span>Start: {{ formatDate(course.startDate) }}</span>
          <span>End: {{ formatDate(course.endDate) }}</span>
        </div>
      </div>

      <!-- Course Content (Modules & Lessons) -->
      <div v-if="isEnrolled || user?.id === course.instructorId" class="space-y-6">
        <h2 class="text-xl font-bold text-gray-900">Course Content</h2>

        <div
          v-for="module in course.modules"
          :key="module.id"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <!-- Module Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">{{ module.title }}</h3>
            <p v-if="module.description" class="text-sm text-gray-600 mt-1">
              {{ module.description }}
            </p>
          </div>

          <!-- Lessons List -->
          <div class="divide-y divide-gray-200">
            <div
              v-for="lesson in module.lessons"
              :key="lesson.id"
              class="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <NuxtLink
                  :to="`/courses/${course.id}/lessons/${lesson.id}`"
                  class="text-gray-900 hover:text-indigo-600"
                >
                  {{ lesson.title }}
                </NuxtLink>
                <div class="text-sm text-gray-500">
                  {{ lesson.duration || 0 }} min
                </div>
              </div>
              <div v-if="lesson.progress?.[0]?.completed" class="text-green-600">
                ✓ Completed
              </div>
            </div>
          </div>

          <!-- Assignments -->
          <div v-if="module.assignments.length > 0" class="px-6 py-4 bg-gray-50">
            <h4 class="font-medium text-gray-900 mb-2">Assignments</h4>
            <div
              v-for="assignment in module.assignments"
              :key="assignment.id"
              class="flex justify-between items-center py-2"
            >
              <NuxtLink
                :to="`/courses/${course.id}/assignments/${assignment.id}`"
                class="text-indigo-600 hover:text-indigo-700"
              >
                {{ assignment.title }}
              </NuxtLink>
              <span class="text-sm text-gray-500">
                Due: {{ formatDate(assignment.dueDate) }} | {{ assignment.maxPoints }} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Enrolled Message -->
      <div v-else class="bg-gray-50 rounded-lg p-6 text-center">
        <p class="text-gray-600">Enroll in this course to access the content.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const courseId = route.params.id

// TODO: Fetch course from API
// const { data: course, pending, error } = await useFetch(`/api/courses/${courseId}`)

const course = ref({
  id: courseId,
  title: 'Sample Course',
  code: 'CS101',
  description: 'Course description here',
  startDate: new Date(),
  endDate: new Date(),
  category: { name: 'Computer Science' },
  instructorId: 1,
  modules: []
})

const pending = ref(false)
const error = ref(null)
const user = ref(null)
const isEnrolled = ref(false)

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const handleEnroll = () => {
  // TODO: Implement enrollment
  console.log('Enroll in course:', courseId)
}
</script>
