# Development Methodology — Lumify LMS

## Selected Methodology: Agile SCRUM

The Lumify LMS project was developed using the **Agile SCRUM** framework, chosen for its suitability for small team (4 members) software development with evolving requirements.

### Rationale

| Factor | Why SCRUM |
|---|---|
| Team size | 4 members — ideal for a single SCRUM team |
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
| Database schema | 13 models, 5 enums, initial migration |
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
| Student dashboard | Stats, enrolled courses, progress bars |

### Sprint 3: Assignments + Grading + Communication

| Task | Deliverables |
|---|---|
| Assignment system | Instructor creates assignments (due date, max points, publish/draft) |
| Submission workflow | Student submit with text + file upload, multipart handling |
| Grading workflow | Instructor views submissions, assigns grades + feedback |
| Messaging system | Direct messages between users, conversation view, recipient search |
| Notification system | Bell icon, unread badge, notification types, mark-all-read |
| Instructor dashboard | Course management, student counts, pending submissions |

### Sprint 4: Admin Features + Polish

| Task | Deliverables |
|---|---|
| Admin panel | User management, course management, activity log, stats dashboard |
| Rate limiting | In-memory rate limiter on auth endpoints |
| XSS sanitization | HTML stripping on all user inputs |
| Password reset | Forgot/reset password flow with crypto tokens |
| UI polish | Responsive fixes, loading states, empty states, error handling |
| Documentation | README, specification, methodology, risk assessment, test plan |

---

## Version Control Strategy: GitHub Flow

- **Main branch:** `main` — production-ready code
- **Feature branches:** Created for each sprint deliverable (e.g., `User-Login/Auth-w-Dashboards`)
- **Pull requests:** Feature branches merged via PR with review
- **Commits:** Conventional commits format (`feat:`, `fix:`, `chore:`)

---

## Team Roles

| Role | Responsibility |
|---|---|
| **Product Owner** | Defines requirements, prioritizes backlog, reviews deliverables against specification |
| **Scrum Master** | Facilitates sprint planning, daily standups, sprint reviews, removes blockers |
| **Developers (2)** | Implement features, write tests, review pull requests |
| **All members** | Participate in sprint planning, retrospectives, and documentation |

---

## Tools & Practices

| Category | Tool / Practice |
|---|---|
| Version control | Git + GitHub |
| Project management | GitHub Issues / Projects |
| CI/CD | Nuxt build verification on PR |
| Code quality | TypeScript strict mode, consistent formatting (2-space indent, single quotes, no semicolons) |
| Testing | Vitest integration tests (28 test cases across 3 suites) |
| Documentation | Markdown docs in `/docs`, Mermaid/PlantUML diagrams |
