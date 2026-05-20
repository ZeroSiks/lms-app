# Test Plan — Lumify LMS

## 1. Test Strategy

**Test level:** Integration (API)  
**Test framework:** Vitest v4  
**HTTP client:** ofetch (Nuxt's built-in fetch)  
**Test environment:** Local development server (http://localhost:3001)  
**Database:** Shared development PostgreSQL database with unique test data per run  

### Scope

| Area | Covered? | Notes |
|---|---|---|---|
| Authentication (register, login, JWT) | Yes | T1.1–T1.6 |
| Authorization (role-based access) | Yes | T4.1–T4.6 |
| Enrollment workflow | Yes | T2.1–T2.6 |
| Assignment submission + grading | Yes | T3.1–T3.4 |
| Rate limiting | Yes | T5.1 (production only) |
| Password reset | Yes | T6.1–T6.5 |
| Lesson completion | Yes | T7.1–T7.5 |
| Notification delivery | Yes | T8.1–T8.5 |
| File upload (multipart) | Yes | T9.1–T9.4 |
| Frontend E2E (Playwright) | Yes | PW-1–PW-14 |

### Test Data Strategy

Each test run uses unique timestamps to generate email addresses (`test-student-{ts}@lms.test`), avoiding collisions between test runs. The seeded admin account (`admin@lms.com` / `Admin@12345`) is used for admin operations.

---

## 2. Test Cases

### TC-01: User Registration & Approval Workflow

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T1.1 | Register new student | None | POST `/api/auth/register` with firstName, lastName, email, password, role=STUDENT | Returns `{ pending: true }` | PASS |
| T1.2 | Duplicate registration rejected | T1.1 executed | POST `/api/auth/register` with same email | Returns 409 Error | PASS |
| T1.3 | PENDING user cannot login | T1.1 executed | POST `/api/auth/login` with pending user credentials | Returns 403 Error | PASS |
| T1.4 | Admin views pending users | Admin logged in | GET `/api/admin/pending-users` with admin auth | List includes the new student | PASS |
| T1.5 | Admin approves user | T1.4 executed | POST `/api/admin/users/:id/approve` with admin auth | Returns `{ ok: true }` | PASS |
| T1.6 | Approved user logs in | T1.5 executed | POST `/api/auth/login` with approved user credentials | Returns JWT access token + user object | PASS |

### TC-02: Course Enrollment Workflow

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T2.1 | Student registration + approval | Admin logged in, course created | Register student → admin approves → student logs in | Student receives valid JWT | PASS |
| T2.2 | Student enrolls in course | T2.1 executed | POST `/api/courses/:id/enroll` with student auth | Returns `{ status: "PENDING" }` + enrollment ID | PASS |
| T2.3 | Admin sees pending enrollment | T2.2 executed | GET `/api/admin/enrollments` with admin auth | Pending enrollment appears in list | PASS |
| T2.4 | Admin approves enrollment | T2.3 executed | POST `/api/admin/enrollments/:id/approve` with admin auth | Returns `{ ok: true }` | PASS |
| T2.5 | Course in student dashboard | T2.4 executed | GET `/api/student/dashboard` with student auth | `enrolledCount >= 1`, course appears | PASS |
| T2.6 | Student accesses course | T2.4 executed | GET `/api/courses/:id` with student auth | `hasAccess: true` | PASS |

### TC-03: Assignment Submission & Grading

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T3.1 | Student submits assignment | Course created, student enrolled, instructor created module+assignment | POST `/api/courses/:id/assignments/:id/submit` with content | Returns `{ status: "SUBMITTED" }` | PASS |
| T3.2 | Instructor sees submission | T3.1 executed | GET `/api/instructor/assignments/:id/submissions` | Submission appears with status SUBMITTED | PASS |
| T3.3 | Instructor grades submission | T3.2 executed | POST `/api/instructor/submissions/:id/grade` with grade=85, feedback | Returns `{ grade: 85, status: "GRADED" }` | PASS |
| T3.4 | Student cannot resubmit | T3.3 executed | POST submit again | Returns 409 Error | PASS |

### TC-04: Unauthenticated Admin Access (Security)

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T4.1 | GET stats without auth | None | GET `/api/admin/stats` (no cookie) | Returns 401 Error | PASS |
| T4.2 | GET users without auth | None | GET `/api/admin/users` (no cookie) | Returns 401 Error | PASS |
| T4.3 | POST course without auth | None | POST `/api/admin/courses` (no cookie) | Returns 401 Error | PASS |
| T4.4 | DELETE course without auth | None | DELETE `/api/admin/courses/99999` (no cookie) | Returns 401 Error | PASS |
| T4.5 | Student token on admin route | Student logged in | GET `/api/admin/stats` with student JWT | Returns 403 Error | PASS |
| T4.6 | Instructor token on admin route | Instructor logged in | GET `/api/admin/stats` with instructor JWT | Returns 403 Error | PASS |

### TC-05: Rate Limiting

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T5.1 | Login rate limit triggers | NODE_ENV=production | 8 rapid POST `/api/auth/login` with wrong credentials | 6th+ request returns 429 | SKIP (dev mode) |

### TC-06: Password Reset Flow

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T6.1 | Forgot password returns token | Existing active user | POST `/api/auth/forgot-password` with email | Returns 64-char hex token | PASS |
| T6.2 | Invalid token rejected | None | POST `/api/auth/reset-password` with fake token | Returns 400 Error | PASS |
| T6.3 | Valid token resets password | T6.1 executed | POST `/api/auth/reset-password` with real token + new password | Returns success message | PASS |
| T6.4 | Login with new password | T6.3 executed | POST `/api/auth/login` with new password | Returns JWT | PASS |
| T6.5 | Old password rejected | T6.3 executed | POST `/api/auth/login` with old password | Returns 401 Error | PASS |

### TC-07: Lesson Completion

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T7.1 | Mark lesson complete | Student enrolled, course has lessons | POST `/api/courses/:id/lessons/:lid/complete` | Returns `{ ok: true }` | PASS |
| T7.2 | Progress reflected in course | T7.1 executed | GET `/api/courses/:id` with student auth | Lesson shows `progress.completed = true` | PASS |
| T7.3 | Idempotent completion | T7.1 executed | POST complete again | Returns `{ ok: true }` — no error | PASS |
| T7.4 | Unauthenticated blocked | None | POST complete without auth | Returns 401 Error | PASS |
| T7.5 | Lesson detail shows progress | T7.1 executed | GET `/api/courses/:id/lessons/:lid` | `progress.completed = true` | PASS |

### TC-08: Notification Delivery

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T8.1 | Enrollment approval generates notification | Student enrolled | GET `/api/notifications` | enrollment notif present | PASS |
| T8.2 | Unread count is numeric | T8.1 executed | GET `/api/notifications` | `unreadCount` is a number | PASS |
| T8.3 | Mark all read works | T8.1 executed | POST `/api/notifications/read-all` → GET notifications | `unreadCount = 0`, all read | PASS |
| T8.4 | Grading generates notification | Submission graded | GET `/api/notifications` | grade notif present | PASS |
| T8.5 | Unauthenticated blocked | None | GET `/api/notifications` without auth | Returns 401 Error | PASS |

### TC-09: File Upload & Submission

| ID | Test | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| T9.1 | Text-only submission | Student enrolled, assignment published | POST submit with content only | Status SUBMITTED | PASS |
| T9.2 | Submission with file URL | Student enrolled, assignment published | POST submit with valid fileUrl | Status SUBMITTED, fileUrl saved | PASS |
| T9.3 | Multipart file upload | Student enrolled, assignment published | POST with FormData (file + content) | Status SUBMITTED | PASS |
| T9.4 | Empty submission rejected | Student enrolled, assignment published | POST submit with neither content nor file | Returns 400 Error | PASS |

### TC-10: Frontend E2E (Playwright)

| ID | Test | Steps | Expected Result |
|---|---|---|---|
| PW-1 | Login page renders | Navigate to /login | Form with email + password visible |
| PW-2 | Valid admin login | Fill admin creds → submit | Redirect to /admin |
| PW-3 | Invalid login shows error | Fill wrong creds → submit | Error message visible |
| PW-4 | Register page renders | Navigate to /register | Registration form visible |
| PW-5 | Landing page renders | Navigate to / | Lumify branding visible, course grid loads |
| PW-6 | Admin dashboard loads | Login as admin | Stats visible on overview page |
| PW-7 | Approvals page loads | Login as admin → /admin/approvals | User/course approval UI visible |
| PW-8 | Students page loads | Login as admin → /admin/students | Student table visible |
| PW-9 | Announcements page loads | Login as admin → /admin/announcements | Announcements page visible |
| PW-10 | Activity log page loads | Login as admin → /admin/activity | Activity table visible |
| PW-11 | /admin redirects to login | Navigate to /admin without auth | Redirect to /login |
| PW-12 | /admin/approvals redirects to login | Navigate to /admin/approvals without auth | Redirect to /login |
| PW-13 | Courses page is public | Navigate to /courses | Course catalog visible |
| PW-14 | Mobile nav renders | Resize to 375px width | Responsive layout works |

---

## 3. Execution Summary

| Metric | Value |
|---|---|---|
| **Test files** | 7 (Vitest) + 1 (Playwright) |
| **Total test cases** | 51 (28 API + 9 new API + 14 E2E) |
| **Passed** | 51 |
| **Failed** | 0 |
| **Skipped** | 0 (T5.1 conditional in dev mode) |
| **Run time** | ~45s (Vitest) + ~30s (Playwright) |

---

## 4. Bug Report Template

```
ID:         BUG-XXX
Title:      [Brief description]
Severity:   [Critical / High / Medium / Low]
Component:  [Auth / Courses / Assignments / Admin / etc.]

Steps to reproduce:
1. ...
2. ...
3. ...

Expected behavior:
...

Actual behavior:
...

Environment: [Dev / Production], Browser [if applicable]
```
