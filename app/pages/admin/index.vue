soft-dev/lms-app/app/pages/admin/index.vue
```

```vue
<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

    <!-- Stats Overview -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-indigo-600">{{ stats.totalUsers }}</div>
        <div class="text-gray-600">Total Users</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-green-600">{{ stats.totalCourses }}</div>
        <div class="text-gray-600">Total Courses</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.totalEnrollments }}</div>
        <div class="text-gray-600">Enrollments</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-2xl font-bold text-purple-600">{{ stats.totalSubmissions }}</div>
        <div class="text-gray-600">Submissions</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <NuxtLink
            to="/admin/users"
            class="block w-full text-left px-4 py-2 bg-gray-50 rounded-md hover:bg-gray-100"
          >
            Manage Users
          </NuxtLink>
          <NuxtLink
            to="/admin/courses"
            class="block w-full text-left px-4 py-2 bg-gray-50 rounded-md hover:bg-gray-100"
          >
            Manage Courses
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Database</span>
            <span class="text-green-600">Connected</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Prisma Client</span>
            <span class="text-green-600">Ready</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
      <div class="space-y-3">
        <div
          v-for="user in recentUsers"
          :key="user.id"
          class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
        >
          <div>
            <div class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="text-sm text-gray-500">{{ user.email }}</div>
          </div>
          <span class="text-xs px-2 py-1 bg-gray-100 rounded">{{ user.role }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// TODO: Fetch stats from API
const stats = ref({
  totalUsers: 0,
  totalCourses: 0,
  totalEnrollments: 0,
  totalSubmissions: 0
})

const recentUsers = ref([])
</script>
