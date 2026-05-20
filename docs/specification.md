# Specification — Lumify LMS

## System Overview

**Lumify** is a web-based Learning Management System (LMS) designed to improve upon standard Moodle-style platforms in usability, performance, and user experience. It provides role-based access for three user types — **Students**, **Instructors**, and **Administrators** — with a modern dark-themed interface, real-time notifications, in-app messaging, and a learning streak gamification system.

**Technology Stack:**
- **Frontend:** Nuxt 4 (Vue 3 Composition API), Tailwind CSS v4, Nuxt UI
- **Backend:** Nitro (Nuxt server engine), TypeScript
- **Database:** PostgreSQL with Prisma ORM v7
- **Authentication:** JWT (access + refresh tokens), bcrypt password hashing
- **State Management:** Pinia v3
- **Testing:** Vitest v4 (unit + integration), Playwright v1.60 (E2E)
- **Validation:** Zod v4
- **CI/CD:** GitHub Actions, Husky + lint-staged pre-commit hooks

**Brand:** "Lumify — Learn Today. Lead Tomorrow."

---

## Functional Requirements

### FR-01: User Registration & Account Management
- Users register with first name, last name, email, password, and role (Student / Instructor)
- New accounts default to **PENDING** status requiring admin approval
- Admins can **approve** or **reject** pending user registrations
- Admins can **deactivate** active user accounts
- Rejected users may re-apply (existing record is updated to PENDING)
- Users can update their profile (name, bio) and change password

### FR-02: Authentication & Authorization
- JWT-based authentication with **access tokens** (15-minute TTL) and **refresh tokens** (7-day TTL)
- Refresh tokens stored as bcrypt hashes in the database
- Automatic token refresh on 401 responses via Pinia store
- Role-based access control: Admin, Instructor, Student roles enforced at API level
- Password reset via email-based token flow (forgot password → reset token → new password)

### FR-03: Course Management
- Admins create courses with title, description, duration, and optional instructor assignment
- Instructors manage course content: modules, lessons, and assignments
- Courses can be **published** or kept in **draft** state
- Course catalog publicly visible (published courses only)
- Unique auto-generated course codes for easy enrollment

### FR-04: Module & Lesson Delivery
- Courses contain ordered modules, each containing ordered lessons
- Lessons support text content, optional video URLs, and file resources
- Students mark lessons as **complete** — progress tracked in `LessonProgress`
- Previous / Next navigation between lessons
- Students must be enrolled to access course content

### FR-05: Enrollment Workflow
- Students enroll in courses via course page or "Join by Code"
- Enrollments start as **PENDING** and require admin approval
- Admins approve or reject enrollment requests
- Students cannot access course content until enrollment is ACTIVE
- Re-enrollment supported for previously rejected enrollments

### FR-06: Assignment Submission & Grading
- Instructors create assignments within modules (title, description, due date, max points)
- Assignments support DRAFT, PUBLISHED, and CLOSED statuses
- Students submit text content and/or file attachments (PDF, Word, PowerPoint, images, text)
- File upload validation: type whitelist, 10MB size limit, magic byte verification
- Instructors view submissions and assign numeric grades with written feedback
- Graded assignments cannot be resubmitted
- Students receive notifications when submissions are graded

### FR-07: Messaging System
- Direct messaging between any two users
- Conversation list showing last message preview per partner
- Recipient directory filtered by role (students see instructors/admins, instructors see students)
- Real-time-style message display with auto-scroll
- Notification generated for new messages

### FR-08: Notification System
- Bell icon with unread count badge in top navigation
- Notification types: enrollment, grade, message, assignment, announcement
- Clickable notifications link to relevant pages
- Mark all read functionality
- Admin dashboard shows synthetic pending-approval notifications

### FR-09: Dashboards & Analytics
- **Student Dashboard:** enrolled courses, lessons completed, learning streak, upcoming deadlines
- **Instructor Dashboard:** courses taught, student counts, pending submissions to review
- **Admin Dashboard:** system-wide stats (users, courses, enrollments), activity log, pending approvals

### FR-10: Learning Streak Tracker (Gamification)
- Consecutive-day lesson completion tracking
- 7-day visual calendar with checkmarks for active days
- Milestone-based motivational messages (1–4 days, 5–6 days, 7+ days — "Perfect week!")
- Streak resets if no lesson completed today or yesterday

### FR-11: Admin Panel
- User management: list, search, filter by role/status, approve, reject, deactivate
- Course management: create, delete, assign instructors
- Enrollment management: view and approve/reject pending enrollments
- Activity log: unified feed of registrations, enrollments, and course creations

### FR-12: Search & Filtering
- Course catalog search by title, description, or code
- Admin user search by name or email with role and status filters
- Admin activity log filterable by event type

### FR-13: Profile & Settings
- View and edit profile information (name, bio)
- Change password (requires current password)
- Account metadata display (email, role, join date)

### FR-14: Security Features
- Server-side authentication on all protected API routes (25+ admin endpoints secured)
- Rate limiting on authentication endpoints (5 req/min login, 3 req/min register)
- Input sanitization (HTML stripping) on all user-provided text fields
- File upload validation (type whitelist, size limits, magic byte verification)
- Password hashing with bcrypt (12 rounds)

### FR-15: Responsive Design
- Fully responsive layout using Tailwind CSS breakpoints (sm, md, lg)
- Mobile-friendly navigation with collapsible elements
- Adaptive grid layouts for course cards, dashboards, and tables

---

## Non-Functional Requirements

### NFR-01: Performance
- Page load time under 3 seconds on standard broadband
- API response time under 500ms for typical queries
- Efficient database queries using Prisma with selective field inclusion
- Static asset serving via Nuxt's built-in optimization

### NFR-02: Security
- JWT token-based authentication with short-lived access tokens (15 min)
- Refresh tokens stored as bcrypt hashes — not reversible
- All admin and instructor endpoints require server-side authentication
- Password hashing with bcrypt (12 salt rounds)
- Input sanitization to prevent XSS attacks
- File upload type and size validation
- Rate limiting on authentication endpoints

### NFR-03: Reliability
- PostgreSQL ACID compliance for data integrity
- Unique constraints on email, enrollment pairs, submission pairs
- Cascade deletes for dependent data integrity

### NFR-04: Usability
- Intuitive role-based navigation with labeled sections
- Consistent UI patterns across all pages (Nuxt UI component library)
- Toast notifications for success/error feedback
- Loading states and empty states on all data-driven pages
- Responsive design supporting desktop and mobile devices

### NFR-05: Maintainability
- Modular code structure: server routes, utilities, composables, stores
- TypeScript throughout for type safety
- Prisma ORM for type-safe database operations
- Git version control with conventional commit messages
- Comprehensive README with developer setup guide

### NFR-06: Data Protection
- Passwords never stored in plaintext (bcrypt hashed)
- JWT secrets stored in environment variables (never committed)
- Refresh tokens hashed before database storage
- User data accessible only to authenticated, authorized users

### NFR-07: Accessibility
- Semantic HTML elements (nav, main, aside, header, form, label)
- Form inputs with associated label elements
- Responsive design supporting zoom and text scaling
- Keyboard-accessible interactive elements

### NFR-08: Scalability
- PostgreSQL supports connection pooling via Prisma adapter
- Stateless JWT authentication enables horizontal scaling
- File uploads stored on local filesystem (migratable to cloud storage)
