# Lumify — Learning Management System

**Learn Today. Lead Tomorrow.**

A full-stack Learning Management System built as the group capstone project for **UFCF7S-30-2 — Systems Development** (2026). Lumify supports three user roles — Student, Instructor, and Administrator — with course delivery, assignment grading, direct messaging, and a learning streak gamification tracker.

![Tech Stack](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js) ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript) ![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql) ![Tests](https://img.shields.io/badge/tests-129%20passed-brightgreen) ![TypeCheck](https://img.shields.io/badge/types-0%20errors-brightgreen)

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Default Accounts](#default-accounts)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [Team](#team)

---

## Features

### For Students
- Browse published courses by title, description, or code
- Enrol in courses (pending admin approval)
- Navigate modules and lessons with prev/next controls
- Mark lessons complete — progress tracked in real-time
- Submit assignments with text and file attachments (PDF, Word, images — 10MB limit)
- View grades and instructor feedback
- Track your learning streak on a 7-day calendar

### For Instructors
- Create and manage course content: modules, lessons, and assignments
- Publish/unpublish courses to control catalogue visibility
- Review student submissions with full-text viewing and file downloads
- Assign numeric grades with written feedback
- Post course announcements that broadcast notifications to enrolled students
- Direct-message any student in your courses

### For Administrators
- Approve or reject pending user registrations
- Manage users: search, filter by role/status, deactivate accounts
- Oversee all courses, assign instructors, delete courses
- View system-wide statistics and pending approval counts
- Monitor platform activity through a unified activity log
- Post platform-wide announcements

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Nuxt 4 (Vue 3 Composition API) |
| **Language** | TypeScript (strict mode) |
| **CSS** | Tailwind CSS v4 + Nuxt UI 4.5 |
| **Database** | PostgreSQL 14+ |
| **ORM** | Prisma 7 with PostgreSQL adapter |
| **Auth** | JWT (access + refresh tokens), bcryptjs (12 rounds) |
| **State** | Pinia 3 |
| **Validation** | Zod 4 |
| **Icons** | Lucide Vue Next |
| **Runtime** | Bun |
| **Testing** | Vitest 4 (unit + integration), Playwright 1.60 (E2E) |
| **CI/CD** | GitHub Actions, Husky + lint-staged |

---

## Project Structure

```
lms-app/
├── app/                    # Frontend (Vue 3)
│   ├── components/         # Reusable components
│   ├── composables/        # Shared logic (useAppToast)
│   ├── layouts/            # landing, auth, dashboard, default
│   ├── middleware/          # auth.ts, guest.ts
│   ├── pages/              # 26 file-based routes
│   └── stores/             # Pinia auth store
│
├── server/                 # Backend (Nitro)
│   ├── api/                # 74+ REST endpoint handlers
│   │   ├── admin/
│   │   ├── announcements/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── instructor/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── student/
│   │   └── user/
│   └── utils/              # jwt, password, auth, notify, rate-limit, sanitize
│
├── prisma/
│   ├── schema.prisma       # 15 models, 6 enums
│   ├── seed.ts             # Demo data
│   └── migrations/         # Version-controlled migrations
│
├── tests/                  # 10 test files (129 tests)
├── e2e/                    # Playwright browser tests
├── .github/workflows/      # CI pipeline
├── docs/                   # Documentation
└── lib/                    # Prisma client singleton
```

---

## Quick Start

### Prerequisites

- **Bun** v1.x — [install guide](https://bun.sh)
- **PostgreSQL** 14+ — running locally or via Docker
- **Node.js** 22+ (fallback if Bun unavailable)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/ZeroSiks/lms-app.git
cd lms-app

# 2. Install dependencies
bun install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secrets

# 4. Create database and apply migrations
bunx prisma migrate dev

# 5. Seed demo data
bunx tsx prisma/seed.ts

# 6. Start the development server
bun run dev
```

The application will be available at **http://localhost:3000**.

### Production

```bash
bun run build
bunx prisma migrate deploy
node .output/server/index.mjs
```

---

## Default Accounts

After running the seed script, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@lms.com` | `Admin@12345` |
| **Instructor** | `dr.smith@lms.com` | `Instructor@123` |
| **Student** | `alice@lms.com` | `Student@123` |
| **Student** | `bob@lms.com` | `Student@123` |

**Important:** Change these passwords immediately in any non-development deployment.

---

## Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run test         # Run Vitest unit + integration tests
bun run test:watch   # Run tests in watch mode
bun run test:e2e     # Run Playwright E2E tests (requires dev server)
bun run typecheck    # Run TypeScript type checking (strict mode)
```

---

## Documentation

| Document | Description |
|---|---|
| [Specification](docs/specification.md) | Functional and non-functional requirements |
| [System Documentation](docs/system-documentation.md) | Architecture, API reference, database schema, deployment |
| [Methodology](docs/methodology.md) | SCRUM process, sprint breakdown, team roles, tools |
| [Risk Assessment](docs/risk-assessment.md) | 16-item risk register with mitigation statuses |
| [Test Plan](docs/test-plan.md) | 129 test cases, execution summary, bug log |
| [User Guide](docs/user-guide.md) | End-user instructions for all three roles |
| [Design Report](docs/group-design-report.md) | Comprehensive group design report |
| [Developer Guide](docs/dev-guide.md) | Code conventions, component patterns, API development |
| [Diagrams](docs/diagrams/) | Use Case, Class, Sequence, Activity, ER diagrams |

---

## Team

| Name | Role | Responsibilities |
|---|---|---|
| [**Shaamil**](https://github.com/Meedhas) | Backend & Database Architect | Database schema, migrations, user management APIs, authentication |
| [**Vishaal**](https://github.com/DeVSVishal) | Frontend Lead & UI/UX | Layouts, components, dashboards, responsive design, innovation feature |
| [**Hameez**](https://github.com/dhari1412) | Full-Stack (Course & Content) | Course catalogue, module/lesson CRUD, enrollment, UML diagrams |
| [**Lene**](https://github.com/aminathlene) | Full-Stack (Assessment & QA) | Assignments, submissions, grading, messaging, testing, documentation |
| [**Raaish**](https://github.com/ZeroSiks) | Team Lead | Skeleton app, task assignment, PR reviews, CI/CD, methodology, risk assessment |

---

**UFCF7S-30-2 — Systems Development — 2026**
