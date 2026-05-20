# System Documentation — Lumify LMS

## 1. Architecture Overview

Lumify is a **full-stack monolithic web application** built on **Nuxt 4** (a Vue 3 meta-framework). The server and client share a single codebase with clear separation:

```
Browser (Vue 3 + Tailwind CSS)
        │
        │ HTTP / REST API
        ▼
Nitro Server (Node.js / Bun)
        │
        │ Prisma ORM
        ▼
PostgreSQL Database
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Nuxt 4 (full-stack) | Single codebase for frontend + backend; file-based routing; auto-imports; server utilities |
| PostgreSQL + Prisma | Relational integrity for LMS data; type-safe queries; migration system |
| JWT (access + refresh) | Stateless auth enables horizontal scaling; refresh tokens for persistent sessions |
| Tailwind CSS v4 | Utility-first CSS for rapid UI development; consistent design tokens |
| Pinia | Lightweight state management for auth cookies and user state |
| Zod | Runtime input validation with TypeScript type inference |

---

## 2. Directory Structure

```
lms-app/
├── app/                    # Frontend (Vue 3)
│   ├── app.vue             # Root component
│   ├── assets/css/         # Global styles
│   ├── components/common/  # Reusable components
│   ├── composables/        # Shared logic (useAppToast)
│   ├── layouts/            # Page layouts (auth, dashboard, default, landing)
│   ├── middleware/         # Route guards (auth, guest)
│   ├── pages/              # File-based routes
│   └── stores/             # Pinia stores (auth)
│
├── server/                 # Backend (Nitro)
│   ├── api/                # API routes (REST)
│   │   ├── admin/          # Admin endpoints
│   │   ├── announcements/  # Announcement endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── courses/        # Course endpoints
│   │   ├── instructor/     # Instructor endpoints
│   │   ├── messages/       # Messaging endpoints
│   │   ├── notifications/  # Notification endpoints
│   │   ├── student/        # Student dashboard endpoints
│   │   └── user/           # User profile endpoints
│   └── utils/              # Server utilities (jwt, password, auth, notify, rate-limit, sanitize)
│
├── prisma/                 # Database
│   ├── schema.prisma       # Data model (15 models, 6 enums)
│   ├── seed.ts             # Seed data (admin + instructor + students + courses)
│   └── migrations/         # Version-controlled schema migrations
│
├── lib/                    # Shared library code
│   └── prisma.ts           # Prisma client singleton
│
├── tests/                  # Tests (Vitest)
│   ├── auth.test.ts        # Authentication + password reset (6 tests)
│   ├── enrollment.test.ts  # Enrollment + admin auth (12 tests)
│   ├── assignment.test.ts  # Assignment submission + grading (4 tests)
│   ├── lessons.test.ts     # Lesson completion (5 tests)
│   ├── notifications.test.ts # Notification delivery (5 tests)
│   ├── file-upload.test.ts # File upload + validation (4 tests)
│   ├── auth.middleware.test.ts # Middleware logic (14 assertions)
│   ├── requireAuth.test.ts # JWT verification (8 assertions)
│   ├── assignments.validation.test.ts # Assignment validation (33 assertions)
│   └── dashboard.stats.test.ts # Dashboard stats computation (12 assertions)
│
├── e2e/                    # End-to-End tests (Playwright)
│   └── auth.spec.ts        # Auth flows + admin navigation (13 tests)
│
├── .github/workflows/      # CI/CD pipeline
│   └── ci.yml              # GitHub Actions (typecheck, migrate, seed, test, e2e)
│
├── docs/                   # Documentation
│   ├── specification.md    # Draft specification
│   ├── methodology.md      # Development methodology
│   ├── risk-assessment.md  # Risk register
│   ├── system-documentation.md  # This file
│   ├── user-guide.md       # End-user guide
│   ├── test-plan.md        # Test plan
│   └── diagrams/           # UML and ER diagrams
│
└── nuxt.config.ts          # Nuxt configuration
```

---

## 3. API Reference

### Authentication (`/api/auth/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new account (status: PENDING) |
| POST | `/auth/login` | No | Login, returns JWT access token + user |
| POST | `/auth/refresh` | Cookie | Refresh expired access token |
| POST | `/auth/logout` | Cookie | Clear refresh token + cookies |
| POST | `/auth/forgot-password` | No | Request password reset token |
| POST | `/auth/reset-password` | No | Reset password with valid token |

### User Profile (`/api/user/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/user/profile` | Yes | Get current user profile |
| PUT | `/user/profile` | Yes | Update first name, last name, bio |
| PUT | `/user/password` | Yes | Change password (requires current) |

### Courses — Public & Student (`/api/courses/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/courses` | No | List published courses |
| GET | `/courses/:id` | Yes | Course detail with modules, lessons, progress |
| POST | `/courses/:id/enroll` | Student | Enroll in course (status: PENDING) |
| GET | `/courses/:id/lessons/:lid` | Yes | Lesson detail with navigation |
| POST | `/courses/:id/lessons/:lid/complete` | Student | Mark lesson complete |
| POST | `/courses/:id/assignments/:aid/submit` | Student | Submit assignment (text + file) |

### Student (`/api/student/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/student/dashboard` | Student | Dashboard stats, courses, streak, deadlines |
| GET | `/student/enrollments` | Student | All enrollments with course info |
| GET | `/student/assignments` | Student | Published assignments from enrolled courses |

### Instructor (`/api/instructor/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/instructor/dashboard` | Instructor | Instructor stats and course list |
| GET | `/instructor/courses` | Instructor | Instructor's courses |
| GET | `/instructor/courses/:id` | Instructor | Course management detail |
| POST | `/instructor/courses/:id/modules` | Instructor | Create module |
| POST | `/instructor/courses/:id/publish` | Instructor | Toggle course publish |
| PUT | `/instructor/modules/:id` | Instructor | Update module |
| DELETE | `/instructor/modules/:id` | Instructor | Delete module (cascades) |
| POST | `/instructor/modules/:id/lessons` | Instructor | Create lesson |
| PUT | `/instructor/lessons/:id` | Instructor | Update lesson |
| DELETE | `/instructor/lessons/:id` | Instructor | Delete lesson |
| POST | `/instructor/modules/:id/assignments` | Instructor | Create assignment |
| PUT | `/instructor/assignments/:id` | Instructor | Update assignment |
| DELETE | `/instructor/assignments/:id` | Instructor | Delete assignment |
| GET | `/instructor/assignments/:id/submissions` | Instructor | View assignment submissions |
| POST | `/instructor/submissions/:id/grade` | Instructor | Grade a submission |

### Admin (`/api/admin/`) — All require Admin JWT

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | System-wide aggregate statistics |
| GET | `/admin/pending-users` | Pending user registrations (with search) |
| GET | `/admin/activity` | Unified activity feed (25 events) |
| GET | `/admin/users` | User directory (filters: role, status, search) |
| POST | `/admin/users/:id/approve` | Approve pending user |
| POST | `/admin/users/:id/reject` | Reject pending user |
| POST | `/admin/users/:id/deactivate` | Deactivate active user |
| GET | `/admin/users/:id/courses` | User's instructor courses |
| GET | `/admin/users/:id/enrollments` | User's enrollments |
| GET | `/admin/courses` | All courses (with instructor + enrollment count) |
| POST | `/admin/courses` | Create course (optional instructorId) |
| DELETE | `/admin/courses/:id` | Delete course + dependent data |
| POST | `/admin/courses/:id/assign-instructor` | Assign/change course instructor |
| GET | `/admin/enrollments` | Pending enrollments (with user + course info) |
| POST | `/admin/enrollments/:id/approve` | Approve pending enrollment |
| POST | `/admin/enrollments/:id/reject` | Reject pending enrollment |

### Messages (`/api/messages/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/messages/conversations` | Yes | Conversation list with last message |
| GET | `/messages/recipients` | Yes | Possible message recipients |
| GET | `/messages/:userId` | Yes | Conversation with specific user |
| POST | `/messages` | Yes | Send a message |

### Announcements (`/api/announcements/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/announcements` | Yes | List all announcements (or filter by `?courseId=`) |
| POST | `/announcements` | Admin/Instructor | Post a new announcement to a course |
| PUT | `/announcements/:id` | Author/Admin | Edit an announcement |
| DELETE | `/announcements/:id` | Author/Admin | Delete an announcement |

### Notifications (`/api/notifications/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | Latest 20 notifications + unread count |
| POST | `/notifications/read-all` | Yes | Mark all notifications read |

---

## 4. Database Schema

See the [ER Diagram](diagrams/ER/er-diagram.md) and `prisma/schema.prisma` for the complete data model.

**Key entities (15):** User, Course, Module, Lesson, LessonProgress, Assignment, Submission, Enrollment, Message, Notification, Announcement, Resource, CourseCategory, ActivityLog, UserStreak

**Enums (6):** Role, UserStatus, EnrollmentStatus, AssignmentStatus, SubmissionStatus, ActivityLogType

---

## 5. Deployment Guide

### Prerequisites

- **Bun** (JavaScript runtime) — recommended v1.x
- **PostgreSQL** — v14+ recommended
- **Node.js** — v22+ (for fallback)

### Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASS@localhost:5432/lms_db"
JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
```

### Setup (Development)

```bash
# 1. Clone repository
git clone git@github.com:ZeroSiks/lms-app.git
cd lms-app

# 2. Install dependencies
bun install

# 3. Create .env from template
cp .env.example .env
# Edit .env with your values

# 4. Set up database
bunx prisma migrate dev
bunx tsx prisma/seed.ts

# 5. Start development server
bun run dev
```

### Setup (Production)

```bash
# 1. Build
bun run build

# 2. Set NODE_ENV=production
export NODE_ENV=production

# 3. Run database migrations
bunx prisma migrate deploy

# 4. Start server
node .output/server/index.mjs
```

### Default Admin Account

- Email: `admin@lms.com`
- Password: `Admin@12345`

**Important:** Change this password immediately in production.
