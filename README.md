# LMS Project Developer Guide

Welcome to the LMS (Learning Management System) project! This guide will help you set up your development environment and understand the project conventions.

---

## Table of Contents

1. [Development Environment Setup](#1-development-environment-setup)
2. [Code Style Guidelines](#2-code-style-guidelines)
3. [Project Structure](#3-project-structure)
4. [Coding Practices](#4-coding-practices)
5. [Common Workflows](#5-common-workflows)
6. [Database Guidelines](#6-database-guidelines)
7. [API Development](#7-api-development)

---

## 1. Development Environment Setup

### 1.1 Install Bun

Bun is a fast JavaScript runtime. We'll use it instead of npm/yarn.

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
iwr https://bun.sh/install.ps1 | iex
```

Verify installation:

```bash
bun --version
```

### 1.2 Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd lms-app

# Install dependencies
bun install
```

### 1.3 Database Setup

> **Note:** If you don't have PostgreSQL installed locally, you can use this Docker setup for a quick start: [docker-compose-postgres-pgadmin](https://github.com/matschik/docker-compose-postgres-pgadmin).

1. **Make sure PostgreSQL is running**

   ```bash
   # macOS
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql
   ```

2. **Create your .env file**

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lms_db?schema=public"
   ```

   Replace `username` and `password` with your PostgreSQL credentials.

3. **Run database migrations**

```bash
bunx prisma migrate dev
```

### 1.4 Start Development Server

```bash
# Start the dev server
bun run dev
```

The app will be available at `http://localhost:3000`

---

## 2. Code Style Guidelines

This project uses Zed's default code style settings. When using other IDEs, ensure your editor is configured to match:

- **Indentation**: 2 spaces (no tabs)
- **Trailing commas**: Yes
- **Semicolons**: No
- **Quotes**: Single quotes
- **Format on save**: Enabled

If your IDE supports Prettier or ESLint, the project should auto-format automatically. Otherwise, manually ensure:
- Use 2 spaces for indentation
- Add trailing commas where appropriate
- No semicolons at end of statements
- Use single quotes for strings

---

## 3. Project Structure

```
lms-app/
├── app/
│   ├── components/      # Vue components
│   │   ├── admin/        # Admin-specific components
│   │   ├── common/      # Shared/reusable components
│   │   ├── course/      # Course-related components
│   │   └── lesson/       # Lesson-related components
│   │
│   ├── composables/      # Vue composables (reusable logic)
│   │   └── useAuth.ts   # Authentication logic
│   │
│   ├── layouts/          # Page layouts
│   │   ├── auth.vue     # Login/Register layout
│   │   └── default.vue  # Main layout with navigation
│   │
│   ├── middleware/       # Route middleware
│   │   └── auth.ts      # Authentication guard
│   │
│   ├── pages/            # File-based routing
│   │   ├── index.vue    # Home page
│   │   ├── login.vue    # Login page
│   │   ├── register.vue # Register page
│   │   ├── dashboard.vue
│   │   ├── courses/
│   │   │   ├── index.vue      # Course listing
│   │   │   └── [id].vue       # Course detail
│   │   └── admin/
│   │       └── index.vue      # Admin dashboard
│   │
│   └── stores/          # Pinia state management
│
├── server/               # Backend API routes (Nitro)
│   ├── api/
│   │   ├── admin/       # Admin endpoints
│   │   ├── auth/        # Auth endpoints
│   │   ├── courses/     # Course endpoints
│   │   └── ...           # (instructor, messages, notifications, etc.)
│   └── utils/           # Shared utilities (jwt, auth, notify, etc.)
│
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/     # Database migrations
│
├── lib/
│   └── prisma.ts        # Prisma client singleton
│
├── .env                 # Environment variables (DO NOT COMMIT)
├── .github/workflows/    # CI/CD pipeline
├── e2e/                  # End-to-End tests (Playwright)
├── nuxt.config.ts        # Nuxt configuration
└── package.json
```

### 3.1 Key Directories Explained

| Directory | Purpose |
|-----------|---------|
| `app/components` | Reusable Vue components |
| `app/composables` | Shared logic using Vue 3 Composition API |
| `app/layouts` | Page layouts (nav, footer, etc.) |
| `app/pages` | File-based routing - each `.vue` file is a route |
| `server/api` | REST API endpoints (Nitro backend) |
| `app/stores` | Pinia stores for global state |
| `prisma` | Database schema and migrations |
| `e2e/` | Playwright end-to-end browser tests |

---

## 4. Coding Practices

### 4.1 Vue 3 Composition API

We use Vue 3's Composition API with `<script setup>`:

```vue
<script setup lang="ts">
// Define props
defineProps<{
  title: string
  count?: number
}>()

// Define emits
const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

// Reactive state
const message = ref('Hello')

// Computed
const reversed = computed(() => message.value.split('').reverse().join(''))

// Methods
const handleClick = () => {
  emit('update', message.value)
}
</script>

<template>
  <div>{{ message }} - {{ reversed }}</div>
</template>
```

### 4.2 TypeScript

Always use TypeScript. Define types for:

- **API responses**
- **Form data**
- **Component props**

```typescript
// Example: Type for user
interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
}
```

### 4.3 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CourseCard.vue`, `UserAvatar.vue` |
| Composable functions | camelCase with `use` prefix | `useAuth.ts`, `useCourse.ts` |
| API routes | kebab-case | `login.post.ts`, `courses.get.ts` |
| Database models | PascalCase | `User`, `Course`, `Enrollment` |
| Variables/functions | camelCase | `userName`, `getCourses()` |

### 4.4 File Organization

Each component file should be self-contained:

```vue
<!-- Good: All in one file -->
<script setup lang="ts">
// Props, emits, imports, logic here
</script>

<template>
<!-- Template here -->
</template>

<style scoped>
/* Scoped styles here */
</style>
```

### 4.5 Database Access

**Always use Prisma** - never write raw SQL:

```typescript
// ✅ Good - using Prisma
const user = await prisma.user.findUnique({
  where: { id: userId }
})

// ❌ Bad - raw SQL
const user = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`
```

### 4.6 API Routes

Place API files in `server/api/`:

```
server/api/
├── auth/
│   ├── register.post.ts
│   └── login.post.ts
├── courses/
│   ├── index.get.ts
│   ├── index.post.ts
│   └── [id].get.ts
└── users/
    └── [id].get.ts
```

Use appropriate HTTP methods in filenames:
- `login.post.ts` → POST /api/auth/login
- `courses.get.ts` → GET /api/courses
- `[id].delete.ts` → DELETE /api/users/:id

---

## 5. Common Workflows

### 5.1 Creating a New Page

1. Create a new `.vue` file in `app/pages/`:

```vue
<!-- app/pages/about.vue -->
<script setup lang="ts">
definePageMeta({
  title: 'About Us'
})
</script>

<template>
  <div>
    <h1>About Us</h1>
  </div>
</template>
```

2. The page is automatically accessible at `/about`

### 5.2 Creating a New Component

1. Create file in appropriate folder:

```vue
<!-- app/components/course/CourseCard.vue -->
<script setup lang="ts">
defineProps<{
  course: {
    id: number
    title: string
    description: string
  }
}>()
</script>

<template>
  <div class="course-card">
    <h3>{{ course.title }}</h3>
    <p>{{ course.description }}</p>
  </div>
</template>
```

2. Use it in another component:

```vue
<script setup lang="ts">
import CourseCard from '~/components/course/CourseCard.vue'
</script>

<template>
  <CourseCard :course="myCourse" />
</template>
```

### 5.3 Creating a New API Endpoint

1. Create file in `app/server/api/`:

```typescript
// app/server/api/hello.get.ts
export default defineEventHandler(async (event) => {
  return {
    message: 'Hello, World!'
  }
})
```

2. Access at `GET /api/hello`

### 5.4 Database Schema Changes

1. Update `prisma/schema.prisma`:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String // Added new field
}
```

2. Run migration:

```bash
bunx prisma migrate dev --name add_name_to_user
```

The Prisma Client will be automatically updated. No manual generation is needed.

---

## 6. Database Guidelines

### 6.1 Prisma Schema Rules

- Always use `@id` for primary keys
- Use `@default()` for default values
- Use `@unique` for unique fields
- Use relations (`@relation`) for foreign keys
- Use `Cascade` delete for dependent records

```prisma
model Course {
  id          Int      @id @default(autoincrement())
  title       String
  instructor  User     @relation("InstructorCourses", fields: [instructorId], references: [id])
  instructorId Int
  
  @@index([instructorId])
}
```

### 6.2 Common Prisma Operations

```typescript
import { prisma } from '@@/lib/prisma'

// Create
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe'
  }
})

// Read
const users = await prisma.user.findMany()
const course = await prisma.course.findUnique({
  where: { id: 1 },
  include: { modules: true }
})

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { firstName: 'Jane' }
})

// Delete
await prisma.user.delete({
  where: { id: 1 }
})
```

---

## 7. API Development

### 7.1 Creating an API Route

```typescript
// server/api/courses/index.post.ts
import { prisma } from '@@/lib/prisma'
import { z } from 'zod'

// Validation schema
const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  code: z.string().min(1),
  instructorId: z.number()
})

export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event)
  
  // Validate
  const validated = createCourseSchema.parse(body)
  
  // Create in database
  const course = await prisma.course.create({
    data: validated
  })
  
  return course
})
```

### 7.2 Error Handling

```typescript
export default defineEventHandler(async (event) => {
  try {
    // Your logic here
    return { success: true, data: result }
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Something went wrong'
    })
  }
})
```

---

## Quick Reference

### Essential Commands

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck

# Run unit + integration tests
bun run test

# Run E2E tests (requires dev server)
bun run test:e2e

# Run Prisma Studio (database GUI)
bunx prisma studio

# Create new migration
bunx prisma migrate dev --name migration_name
```

### Useful Links

- [Nuxt 4 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org/guide/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## Getting Help

1. Check the code in `app/` for examples
2. Look at existing API routes in `app/server/api/`
3. Ask ~~senior developers in your team~~ ChatGPT, Claude, Gemini or Mistral.
4. Refer to official documentation links above

Happy coding! 🚀
