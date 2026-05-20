# Development Methodology — Lumify LMS

## Selected Methodology: Agile SCRUM

The Lumify LMS project was developed using the **Agile SCRUM** framework, chosen for its suitability for a small team (5 members) working with evolving requirements over a semester-long project.

### Rationale

| Factor | Why SCRUM |
|---|---|
| Team size | 5 members — ideal for a single SCRUM team |
| Requirement volatility | University project with scope refinement throughout the semester |
| Iterative delivery | Working software increments each sprint for feedback |
| Risk management | Regular sprint reviews identify issues early |
| Stakeholder alignment | Sprint demos ensure the system meets the assessment criteria |

---

## Sprint Breakdown

The project was executed across **4 sprints** of approximately 2 weeks each:

### Sprint 1: Foundation (Auth + Database + Core Shell)

| Task | Deliverables |
|---|---|
| Project setup | Nuxt 4 project initialized, PostgreSQL configured, Prisma schema designed |
| Authentication system | Register, Login, JWT token management, Pinia auth store |
| Database schema | 15 models, 6 enums, initial migration |
| UI shell | Auth layout, default layout, landing page, loading screen |
| Admin approval workflow | PENDING user registration, admin approve/reject |

### Sprint 2: Course + Lesson Delivery

| Task | Deliverables |
|---|---|
| Course catalog | Public course listing, course detail page |
| Enrollment system | Enroll, admin approval, enrollment status management |
| Module/Lesson CRUD | Instructor creates modules, lessons with content and video URLs |
| Lesson viewer | Student lesson page with content, resources, prev/next navigation |
| Lesson completion tracking | Mark complete, LessonProgress upsert |
| Student dashboard | Stats, enrolled courses, progress bars, streak tracker |
| Gamification | Learning streak calendar, milestone messages |

### Sprint 3: Assignments + Grading + Communication

| Task | Deliverables |
|---|---|
| Assignment system | Instructor creates assignments (due date, max points, publish/draft) |
| Submission workflow | Student submit with text + file upload, multipart handling |
| Grading workflow | Instructor views submissions, assigns grades + feedback |
| Messaging system | Direct messages between users, conversation view, recipient search |
| Notification system | Bell icon, unread badge, notification types, mark-all-read |
| Instructor dashboard | Course management, student counts, pending submissions |

### Sprint 4: Admin Features + Testing + Polish

| Task | Deliverables |
|---|---|
| Admin panel | User management, course management, activity log, stats dashboard |
| Course announcements | CRUD API + admin UI, broadcast notifications to enrolled students |
| Rate limiting | In-memory IP-based rate limiter on auth endpoints |
| XSS sanitization | HTML stripping on all user inputs |
| Password reset | Forgot/reset password flow with crypto tokens |
| Full-text search | pg_trgm GIN indexes on Course.title, Course.description, User.email, User.name |
| Seed data | Realistic demo data: 3 courses, 1 instructor, 2 students, 5 modules, 10 lessons, 5 assignments |
| TypeScript strict mode | Enabled `"strict": true`, fixed 12+ pre-existing type errors across 9 server files |
| Integration tests | 42 API tests across 6 suites (auth, enrollment, assignment, lessons, notifications, file upload) |
| Unit tests | 74 logic tests across 4 suites (middleware, JWT, validation, dashboard stats) |
| E2E tests (Playwright) | 13 browser tests covering auth flows, admin navigation, and authorization guards |
| CI/CD pipeline | GitHub Actions workflow with PostgreSQL service, migrations, seed, Vitest, Playwright |
| Pre-commit hooks | Husky + lint-staged running `nuxt typecheck` on staged `.ts`/`.vue` files |
| UI polish | Responsive fixes, loading states, empty states, error handling |
| Documentation | README, specification, methodology, risk assessment, test plan, user guide, system docs |

---

## Version Control Strategy: GitHub Flow

- **Main branch:** `main` — production-ready code
- **Feature branches:** Created for each sprint deliverable (e.g., `User-Login/Auth-w-Dashboards`, `e2e-tests`)
- **Pull requests:** Feature branches merged via PR with review
- **Commits:** Conventional commits format (`feat:`, `fix:`, `test:`, `ci:`, `docs:`, `chore:`)

---

## Team Roles

| Developer | Role | Responsibilities |
|---|---|---|
| **Developer 1** | Backend & Database Architect | Database design, Prisma schema, migrations, core backend logic, user management APIs |
| **Developer 2** | Frontend Lead & UI/UX | Overall look and feel, layouts, components, dashboards, responsive design, loading screen |
| **Developer 3** | Full-Stack (Course & Content) | End-to-end course catalog, module/lesson CRUD, enrollment workflow, lesson viewer |
| **Developer 4** | Full-Stack (Assessment & QA) | Assignment submission/grading, file uploads, messaging, test suites (Vitest + Playwright) |
| **Developer 5** | Team Lead | Task assignment, PR reviews, methodology documentation, CI/CD pipeline, risk assessment |
| **All members** | Collaborative | Sprint planning, daily standups, sprint reviews, retrospectives, code reviews |

---

## Tools & Practices

| Category | Tool / Practice |
|---|---|
| Version control | Git + GitHub |
| Project management | GitHub Issues / Projects |
| CI/CD | GitHub Actions (PostgreSQL service, typecheck, migrations, seed, Vitest, Playwright) |
| Pre-commit hooks | Husky + lint-staged (`nuxt typecheck`) |
| Code quality | TypeScript strict mode (`"strict": true`), 2-space indent, single quotes, no semicolons |
| Unit testing | Vitest v4 — 74 logic tests (middleware, JWT, validation, dashboard stats) |
| Integration testing | Vitest v4 — 42 API tests (auth, enrollment, assignments, lessons, notifications, file upload) |
| E2E testing | Playwright v1.60 — 13 browser tests (Chromium headless) |
| Total test coverage | **129 tests**, 0 failures, 0 type errors |
| Documentation | Markdown docs in `/docs`, Mermaid class/sequence/activity/ER diagrams, PlantUML use-case diagram |
