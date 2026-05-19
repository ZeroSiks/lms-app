# Assessment Feature — Technical Specification

**Project:** Lumify LMS (UFCF7S-30-2_Sep_2025)
**Feature:** Assessment System (Quizzes, Assignments, Grading & Feedback)
**Version:** 1.0
**Date:** 2026-05-17

---

## Table of Contents

1. [Overview](#1-overview)
2. [Feature Scope](#2-feature-scope)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Schema Extensions](#6-database-schema-extensions)
7. [API Routes](#7-api-routes)
8. [UI Flows](#8-ui-flows)
9. [Validation Rules](#9-validation-rules)
10. [Edge Cases & Error Handling](#10-edge-cases--error-handling)
11. [Ethical & Academic Integrity Considerations](#11-ethical--academic-integrity-considerations)
12. [Test Plan](#12-test-plan)
13. [UML Diagram Notes](#13-uml-diagram-notes)
14. [Innovation Over Standard Moodle](#14-innovation-over-standard-moodle)

---

## 1. Overview

The Assessment System is a core feature of Lumify LMS that enables instructors and admins to create, manage, and grade student assessments. It covers three distinct assessment types:

- **Quizzes** — timed or untimed, auto-graded assessments with MCQ and short-answer questions
- **Assignments** — instructor-graded tasks where students submit text or files
- **Grading & Feedback** — a unified grading interface, per-submission feedback, and an overall course grade tracker

This feature directly addresses the coursework criterion of *System Functionality & Completeness* (25%) and *Innovation / Improvement Feature* (10%) by delivering a more structured, feedback-rich assessment experience than a standard Moodle installation.

---

## 2. Feature Scope

### In Scope

| Area | Capability |
|---|---|
| Quiz creation | Instructors/Admins create quizzes within a module |
| Question authoring | MCQ (single correct answer) and short-answer question types |
| Quiz settings | Time limit, max attempts, pass mark, visibility status |
| Quiz attempts | Students attempt quizzes; answers saved per question |
| Auto-grading | MCQ answers graded instantly on submission |
| Assignment creation | Instructors/Admins create assignments within a module |
| Assignment submission | Students submit text content and/or a file URL |
| Late detection | System flags submissions after the due date as LATE |
| Manual grading | Instructors enter numeric grade and written feedback per submission |
| Grade overview | Students see all grades per course in one view |
| Grade book | Instructors see all student grades per course in a table |

### Out of Scope (v1.0)

- Peer assessment
- Group submissions
- Plagiarism detection integration
- File storage (file submissions use URLs only)
- Question banks / question randomisation
- Partial credit for MCQ

---

## 3. User Roles & Permissions

| Action | Student | Instructor | Admin |
|---|---|---|---|
| Create quiz | No | Yes (own courses only) | Yes (any course) |
| Edit quiz | No | Yes (own, DRAFT only) | Yes (any, DRAFT only) |
| Delete quiz | No | Yes (own, DRAFT only) | Yes (any) |
| Publish / close quiz | No | Yes (own courses) | Yes (any course) |
| Attempt quiz | Yes (if enrolled, quiz PUBLISHED) | No | No |
| View all attempts | No | Yes (own courses) | Yes (any course) |
| Create assignment | No | Yes (own courses only) | Yes (any course) |
| Edit assignment | No | Yes (own, DRAFT only) | Yes (any, DRAFT only) |
| Delete assignment | No | Yes (own, DRAFT only) | Yes (any) |
| Publish / close assignment | No | Yes (own courses) | Yes (any course) |
| Submit assignment | Yes (if enrolled, assignment PUBLISHED) | No | No |
| Grade submission | No | Yes (own courses) | Yes (any course) |
| View own submission & grade | Yes | No | No |
| View grade overview (own) | Yes | No | No |
| View grade book (all students) | No | Yes (own courses) | Yes (any course) |

**Enforcement:** All permission checks are applied server-side on each API route. Client-side role checks are UI hints only and must never be the sole enforcement mechanism.

---

## 4. Functional Requirements

### 4.1 Quizzes

**FR-Q1 — Create Quiz**
An instructor or admin must be able to create a quiz attached to a module. A quiz has a title, optional description, optional time limit (minutes), max attempts (default 1), a pass mark percentage (default 50), and a status of DRAFT on creation.

**FR-Q2 — Add Questions**
An instructor or admin must be able to add questions to a quiz. Each question has:
- A question type: `MCQ` or `SHORT_ANSWER`
- Question text
- A point value (positive integer)
- A display order
- For MCQ: between 2 and 6 answer options, exactly one marked as correct

**FR-Q3 — Publish / Close Quiz**
An instructor can transition a quiz from DRAFT → PUBLISHED (making it available to enrolled students) or PUBLISHED → CLOSED (preventing new attempts). A quiz cannot return to DRAFT once published.

**FR-Q4 — Start Attempt**
An enrolled student can start an attempt on a PUBLISHED quiz if they have not exceeded `maxAttempts`. Starting an attempt records a `startedAt` timestamp. If a time limit is set, the attempt automatically submits when the limit expires.

**FR-Q5 — Save & Submit Attempt**
Students answer questions one at a time or all at once. Answers are submitted as a batch on final submission. MCQ answers reference a chosen option ID. Short-answer answers are plain text. Submission records a `submittedAt` timestamp.

**FR-Q6 — Auto-grade MCQ**
On submission, the system scores each MCQ question by comparing the selected option to the correct option. Short-answer questions are marked with 0 points by default and flagged for manual review.

**FR-Q7 — View Attempt Result**
After submission, the student sees their total score, pass/fail result, and per-question feedback (correct answer revealed for MCQ). If `maxAttempts > 1`, the student's best score is used as their grade.

**FR-Q8 — Instructor Quiz Review**
Instructors see an attempt list per quiz: student name, score, pass/fail, date. They can view individual attempts and manually override scores or add notes.

---

### 4.2 Assignments

**FR-A1 — Create Assignment**
An instructor or admin must be able to create an assignment attached to a module with: title, description, due date, maximum points, and status DRAFT on creation.

**FR-A2 — Publish / Close Assignment**
Same DRAFT → PUBLISHED → CLOSED lifecycle as quizzes. Students can only submit while status is PUBLISHED. Submissions after the due date are accepted but flagged as LATE automatically.

**FR-A3 — Submit Assignment**
An enrolled student submits once per assignment. A submission contains optional text content and/or an optional file URL. At least one of the two must be provided. Re-submission is not permitted once graded.

**FR-A4 — View Own Submission**
A student can view their own submission at any time, including submission status, grade, and feedback once graded.

**FR-A5 — Grade Submission**
An instructor selects a submission, enters a numeric grade (0 to `maxPoints`), and writes optional feedback text. Grading updates submission status to GRADED.

**FR-A6 — Submission List (Instructor)**
Instructors see a table of all submissions per assignment: student name, submission date, status (PENDING / SUBMITTED / LATE / GRADED), and grade if available.

---

### 4.3 Grading & Feedback

**FR-G1 — Student Grade Overview**
A student can navigate to a Grades page for any course they are enrolled in. The page lists:
- All published quizzes: best attempt score, max score, pass/fail
- All published assignments: submitted status, grade, max points, feedback
- An overall course grade (weighted average, see FR-G3)

**FR-G2 — Instructor Grade Book**
An instructor sees a table where rows are enrolled students and columns are each assessment (quiz and assignment). Each cell shows the student's score. Cells are coloured: green (≥ pass mark), amber (submitted, below pass), red (not submitted / not attempted).

**FR-G3 — Overall Course Grade Calculation**
The overall grade is calculated as:

```
overallGrade = Σ(assessmentScore / assessmentMaxPoints × assessmentWeight) / Σ(assessmentWeight)
```

Assessments without a grade do not contribute to the average (they are excluded from the denominator). Each assessment carries equal weight in v1.0. The instructor can mark a course as Pass/Fail or Percentage graded.

**FR-G4 — Feedback Notifications**
When an instructor grades a submission (assignment or short-answer quiz question), the student's grade overview immediately reflects the update. No email is sent in v1.0.

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Quiz submission must return an auto-graded result within 500ms for quizzes up to 50 MCQ questions |
| NFR-02 | Security | All assessment API routes must validate the authenticated user's role and course enrolment/ownership server-side before processing |
| NFR-03 | Data Integrity | A student's quiz attempt is atomic — either all answers are saved or none (database transaction) |
| NFR-04 | Usability | The quiz UI must display a countdown timer when a time limit is set, updating every second |
| NFR-05 | Usability | The grade book must be readable on screens ≥ 768px wide; horizontal scrolling is permitted for courses with many assessments |
| NFR-06 | Reliability | If a student closes the browser mid-attempt, their saved answers must persist; the attempt resumes correctly on return |
| NFR-07 | Compliance | Submitted student data (answers, grades, feedback) must be stored securely and not exposed to other students via API responses |
| NFR-08 | Accessibility | All form inputs must have associated labels; error messages must be programmatically associated with their field (ARIA) |

---

## 6. Database Schema Extensions

The following additions are required to the existing Prisma schema. Existing models (`Assignment`, `Submission`) are extended or reused as-is.

### 6.1 New Enum: `QuizStatus`

```prisma
enum QuizStatus {
  DRAFT
  PUBLISHED
  CLOSED
}
```

### 6.2 New Enum: `QuestionType`

```prisma
enum QuestionType {
  MCQ
  SHORT_ANSWER
}
```

### 6.3 New Enum: `AttemptStatus`

```prisma
enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  TIMED_OUT
}
```

### 6.4 New Model: `Quiz`

```prisma
model Quiz {
  id           Int           @id @default(autoincrement())
  title        String
  description  String?
  timeLimitMin Int?          // null = no limit
  maxAttempts  Int           @default(1)
  passMark     Int           @default(50)  // percentage
  status       QuizStatus    @default(DRAFT)
  moduleId     Int
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  Module       Module        @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  Question     QuizQuestion[]
  Attempt      QuizAttempt[]
}
```

### 6.5 New Model: `QuizQuestion`

```prisma
model QuizQuestion {
  id           Int          @id @default(autoincrement())
  quizId       Int
  type         QuestionType
  questionText String
  points       Int
  order        Int
  Quiz         Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  Option       QuizOption[]
  Answer       QuizAnswer[]
}
```

### 6.6 New Model: `QuizOption`

```prisma
model QuizOption {
  id         Int          @id @default(autoincrement())
  questionId Int
  text       String
  isCorrect  Boolean      @default(false)
  Question   QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  Answer     QuizAnswer[]
}
```

> **Constraint:** Only one `QuizOption` per `QuizQuestion` may have `isCorrect = true`. Enforced at the application layer on question creation/update.

### 6.7 New Model: `QuizAttempt`

```prisma
model QuizAttempt {
  id          Int           @id @default(autoincrement())
  userId      Int
  quizId      Int
  startedAt   DateTime      @default(now())
  submittedAt DateTime?
  score       Int?          // null until submitted
  status      AttemptStatus @default(IN_PROGRESS)
  User        User          @relation(fields: [userId], references: [id])
  Quiz        Quiz          @relation(fields: [quizId], references: [id], onDelete: Cascade)
  Answer      QuizAnswer[]
}
```

### 6.8 New Model: `QuizAnswer`

```prisma
model QuizAnswer {
  id               Int          @id @default(autoincrement())
  attemptId        Int
  questionId       Int
  selectedOptionId Int?         // MCQ only
  textAnswer       String?      // SHORT_ANSWER only
  pointsAwarded    Int?         // null until graded
  Attempt          QuizAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  Question         QuizQuestion @relation(fields: [questionId], references: [id])
  SelectedOption   QuizOption?  @relation(fields: [selectedOptionId], references: [id])

  @@unique([attemptId, questionId])
}
```

### 6.9 Existing Model Changes

**`Assignment`** — no schema changes needed. The existing fields (`title`, `description`, `dueDate`, `maxPoints`, `status`, `moduleId`) satisfy FR-A1.

**`Submission`** — no schema changes needed. The existing fields (`content`, `fileUrl`, `submittedAt`, `grade`, `feedback`, `status`, `userId`, `assignmentId`) satisfy FR-A3 through FR-A5.

**`Module`** — add Quiz relation:

```prisma
// Add to existing Module model:
Quiz Quiz[]
```

**`User`** — add QuizAttempt relation:

```prisma
// Add to existing User model:
QuizAttempt QuizAttempt[]
```

### 6.10 Entity Relationship Summary

```
Course
  └── Module (many)
        ├── Lesson (many)
        ├── Assignment (many)
        │     └── Submission (many, per User)
        └── Quiz (many)              ← NEW
              ├── QuizQuestion (many) ← NEW
              │     └── QuizOption (many, MCQ only) ← NEW
              └── QuizAttempt (many, per User) ← NEW
                    └── QuizAnswer (many, per QuizQuestion) ← NEW
```

---

## 7. API Routes

All routes require a valid JWT access token in the `Authorization: Bearer <token>` header unless stated otherwise. Role and ownership checks are enforced per the permissions table in Section 3.

### 7.1 Quiz Management

#### `POST /api/quizzes`

Creates a new quiz in DRAFT status.

**Auth:** Instructor or Admin

**Request body:**

```json
{
  "moduleId": 12,
  "title": "Week 3 Quiz",
  "description": "Covers chapters 4–6",
  "timeLimitMin": 30,
  "maxAttempts": 2,
  "passMark": 60
}
```

**Response `201`:**

```json
{
  "id": 5,
  "title": "Week 3 Quiz",
  "status": "DRAFT",
  "moduleId": 12,
  "timeLimitMin": 30,
  "maxAttempts": 2,
  "passMark": 60,
  "createdAt": "2026-05-17T10:00:00.000Z"
}
```

**Errors:**
- `400` — validation failure (missing title, moduleId, invalid values)
- `403` — authenticated user does not own the course containing this module
- `404` — moduleId not found

---

#### `GET /api/quizzes/:id`

Returns quiz details including questions and options. Correct answers (`isCorrect`) are **omitted** for Student role.

**Auth:** Any authenticated user with access to the course

**Response `200`:**

```json
{
  "id": 5,
  "title": "Week 3 Quiz",
  "status": "PUBLISHED",
  "timeLimitMin": 30,
  "maxAttempts": 2,
  "passMark": 60,
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "questionText": "What is a primary key?",
      "points": 2,
      "order": 1,
      "options": [
        { "id": 1, "text": "A unique identifier for a record" },
        { "id": 2, "text": "A foreign key reference" }
      ]
    }
  ]
}
```

---

#### `PATCH /api/quizzes/:id`

Updates quiz metadata or status. Only DRAFT quizzes can have their questions/options changed. Status transitions: DRAFT → PUBLISHED, PUBLISHED → CLOSED.

**Auth:** Instructor (own course) or Admin

**Request body:** Any subset of `{ title, description, timeLimitMin, maxAttempts, passMark, status }`

**Errors:**
- `400` — invalid status transition (e.g., CLOSED → DRAFT)
- `403` — not owner or not admin
- `409` — attempting to edit questions on a PUBLISHED quiz

---

#### `DELETE /api/quizzes/:id`

Deletes a quiz and all related questions, options, attempts, and answers (cascade). Only permitted while status is DRAFT.

**Auth:** Instructor (own course) or Admin

**Errors:**
- `403` — not owner or not admin
- `409` — quiz is PUBLISHED or CLOSED

---

#### `POST /api/quizzes/:id/questions`

Adds a question to a DRAFT quiz.

**Auth:** Instructor (own course) or Admin

**Request body:**

```json
{
  "type": "MCQ",
  "questionText": "Which of the following is a NoSQL database?",
  "points": 1,
  "order": 2,
  "options": [
    { "text": "PostgreSQL", "isCorrect": false },
    { "text": "MongoDB", "isCorrect": true },
    { "text": "MySQL", "isCorrect": false }
  ]
}
```

**Errors:**
- `400` — MCQ with no correct option, MCQ with more than one correct option, SHORT_ANSWER with options provided
- `409` — quiz is not DRAFT

---

#### `DELETE /api/quizzes/:quizId/questions/:questionId`

Removes a question and its options. Quiz must be DRAFT.

---

### 7.2 Quiz Attempts (Student)

#### `POST /api/quizzes/:id/attempts`

Starts a new quiz attempt for the authenticated student.

**Auth:** Student, enrolled in the course

**Response `201`:**

```json
{
  "attemptId": 7,
  "startedAt": "2026-05-17T10:05:00.000Z",
  "timeLimitMin": 30,
  "expiresAt": "2026-05-17T10:35:00.000Z"
}
```

**Errors:**
- `403` — student not enrolled in course, or quiz not PUBLISHED
- `409` — student has reached `maxAttempts`

---

#### `GET /api/attempts/:attemptId`

Returns the current attempt's saved answers (for resume on page reload).

**Auth:** Owner of the attempt only

---

#### `POST /api/attempts/:attemptId/submit`

Submits the quiz attempt. Triggers auto-grading for MCQ questions.

**Auth:** Owner of the attempt only

**Request body:**

```json
{
  "answers": [
    { "questionId": 1, "selectedOptionId": 2 },
    { "questionId": 2, "textAnswer": "A primary key uniquely identifies a row." }
  ]
}
```

**Response `200`:**

```json
{
  "attemptId": 7,
  "score": 4,
  "maxScore": 6,
  "passed": true,
  "results": [
    {
      "questionId": 1,
      "correct": true,
      "pointsAwarded": 2,
      "correctOptionId": 2
    },
    {
      "questionId": 2,
      "correct": null,
      "pointsAwarded": 0,
      "note": "Pending manual review"
    }
  ]
}
```

**Errors:**
- `400` — attempt already submitted or timed out
- `400` — answers provided for question IDs not in this quiz

---

#### `GET /api/quizzes/:id/attempts`

Returns all attempts for a quiz. For instructors/admins: all students' attempts. For students: their own attempts only.

---

### 7.3 Assignment Management

#### `POST /api/assignments`

Creates a new assignment in DRAFT status.

**Auth:** Instructor (own course) or Admin

**Request body:**

```json
{
  "moduleId": 12,
  "title": "Database Design Task",
  "description": "Design an ER diagram for a library system.",
  "dueDate": "2026-06-01T23:59:00.000Z",
  "maxPoints": 100
}
```

**Response `201`:** Assignment object with `status: "DRAFT"`

---

#### `GET /api/assignments/:id`

Returns assignment details. For students: also includes their own submission if one exists.

**Auth:** Enrolled student or instructor/admin with course access

---

#### `PATCH /api/assignments/:id`

Updates assignment fields or status. Editing description/dueDate is permitted on PUBLISHED assignments (instructors may need to extend deadlines). Status transitions: DRAFT → PUBLISHED, PUBLISHED → CLOSED.

**Auth:** Instructor (own course) or Admin

---

#### `DELETE /api/assignments/:id`

Deletes assignment. Only permitted while DRAFT.

**Auth:** Instructor (own course) or Admin

---

### 7.4 Submissions

#### `POST /api/assignments/:id/submissions`

Student submits their work.

**Auth:** Student, enrolled in course

**Request body:**

```json
{
  "content": "My written response...",
  "fileUrl": "https://example.com/my-submission.pdf"
}
```

**Business rules:**
- At least one of `content` or `fileUrl` must be non-empty
- If current datetime > assignment `dueDate`, `status` is set to `LATE`; otherwise `SUBMITTED`
- A student may only submit once per assignment. If a submission already exists and is not yet GRADED, it can be updated via `PATCH`

**Response `201`:** Submission object

**Errors:**
- `403` — student not enrolled, or assignment not PUBLISHED
- `409` — submission already exists and is GRADED (cannot re-submit)

---

#### `PATCH /api/submissions/:id`

Student updates their ungraded submission.

**Auth:** Owner of the submission, submission status must be SUBMITTED or LATE

---

#### `GET /api/assignments/:id/submissions`

Returns all submissions for an assignment.

**Auth:** Instructor (own course) or Admin

**Response `200`:**

```json
[
  {
    "id": 3,
    "userId": 14,
    "studentName": "Jane Doe",
    "submittedAt": "2026-05-30T18:22:00.000Z",
    "status": "SUBMITTED",
    "grade": null
  }
]
```

---

#### `PATCH /api/submissions/:id/grade`

Instructor grades a submission.

**Auth:** Instructor (own course) or Admin

**Request body:**

```json
{
  "grade": 78,
  "feedback": "Good structure. Please expand on section 3."
}
```

**Errors:**
- `400` — grade exceeds assignment `maxPoints` or is negative
- `403` — not instructor of the course or not admin

---

### 7.5 Grades

#### `GET /api/courses/:courseId/grades/me`

Returns the authenticated student's grade overview for a course.

**Auth:** Student, enrolled in course

**Response `200`:**

```json
{
  "courseId": 3,
  "overallGrade": 72.5,
  "quizzes": [
    {
      "quizId": 5,
      "title": "Week 3 Quiz",
      "bestScore": 4,
      "maxScore": 6,
      "passed": true
    }
  ],
  "assignments": [
    {
      "assignmentId": 2,
      "title": "Database Design Task",
      "grade": 78,
      "maxPoints": 100,
      "feedback": "Good structure. Please expand on section 3.",
      "status": "GRADED"
    }
  ]
}
```

---

#### `GET /api/courses/:courseId/gradebook`

Returns the grade book for all enrolled students.

**Auth:** Instructor (own course) or Admin

**Response `200`:**

```json
{
  "assessments": [
    { "id": 5, "type": "quiz", "title": "Week 3 Quiz", "maxScore": 6 },
    { "id": 2, "type": "assignment", "title": "Database Design Task", "maxPoints": 100 }
  ],
  "students": [
    {
      "userId": 14,
      "name": "Jane Doe",
      "grades": {
        "quiz_5": { "score": 4, "passed": true },
        "assignment_2": { "grade": 78, "status": "GRADED" }
      }
    }
  ]
}
```

---

## 8. UI Flows

### 8.1 Instructor: Create and Publish a Quiz

```
/courses/[id]
  └── Module section → "Add Assessment" button
        └── /courses/[id]/modules/[moduleId]/assessments/new
              └── Select type: Quiz
                    └── /courses/[id]/quizzes/new?moduleId=X
                          [Form: title, description, time limit, max attempts, pass mark]
                          → Submit → POST /api/quizzes
                                └── Redirect to quiz editor
                                      /courses/[id]/quizzes/[quizId]/edit
                                            [Add questions panel]
                                            → For each question: type, text, points, options
                                            → "Add Question" → POST /api/quizzes/:id/questions
                                            → "Publish" button
                                                  → PATCH /api/quizzes/:id { status: "PUBLISHED" }
                                                  → Confirmation toast
```

**States visible in the quiz editor:**
- DRAFT badge (yellow) — questions can be added/removed
- PUBLISHED badge (green) — questions are locked, no edits
- CLOSED badge (grey) — read-only

---

### 8.2 Student: Take a Quiz

```
/courses/[id]
  └── Module section → Quiz card (PUBLISHED, attempts remaining shown)
        └── "Start Quiz" button
              → POST /api/quizzes/:id/attempts
                    └── /quizzes/attempt/[attemptId]
                          [Countdown timer if time limit set]
                          [Questions rendered one per page or all at once]
                          [Answers auto-saved on change to localStorage]
                          → "Submit Quiz" button
                                → Confirmation modal: "Are you sure? You cannot change answers after submission."
                                      → POST /api/attempts/:attemptId/submit
                                            └── /quizzes/attempt/[attemptId]/result
                                                  [Score, pass/fail, per-question breakdown]
                                                  [For MCQ: correct answer shown]
                                                  [For short-answer: "Pending review" badge]
```

**Timer behaviour:**
- Timer shown top-right, counts down
- At 0: attempt submitted automatically, student redirected to result page
- If student navigates away and returns within the time window, attempt resumes from `startedAt`

---

### 8.3 Instructor: Create and Publish an Assignment

```
/courses/[id]/quizzes/new?moduleId=X
  (or select "Assignment" type from new assessment screen)
        └── /courses/[id]/assignments/new?moduleId=X
              [Form: title, description (rich text), due date picker, max points]
              → Submit → POST /api/assignments
                    → Redirect to assignment detail
                          [Edit button (DRAFT only)]
                          [Publish button → PATCH status: PUBLISHED]
                          [Close button → PATCH status: CLOSED]
```

---

### 8.4 Student: Submit an Assignment

```
/courses/[id]
  └── Module → Assignment card (PUBLISHED)
        [Shows: title, description, due date, max points]
        [If submitted: shows status badge and grade/feedback if graded]
        [If not submitted: "Submit Assignment" button]
              └── /assignments/[id]/submit
                    [Text area: written response]
                    [File URL input: link to uploaded file]
                    [Due date shown — if past, warning banner: "This submission will be marked as late"]
                    → Submit → POST /api/assignments/:id/submissions
                          → Success: redirect back to assignment detail with status badge
```

---

### 8.5 Instructor: Grade Submissions

```
/courses/[id]/assignments/[id]
  └── "View Submissions" tab (Instructor only)
        [Table: student name | submitted at | status | grade]
        [Colour-coded status: SUBMITTED (blue), LATE (amber), GRADED (green), PENDING (grey)]
        → Click student row
              └── /assignments/[id]/submissions/[submissionId]
                    [Student's text content shown]
                    [File URL as clickable link]
                    [Grade input: 0 – maxPoints]
                    [Feedback textarea]
                    → "Save Grade" → PATCH /api/submissions/:id/grade
                          → Toast: "Grade saved"
                          → Submission status updates to GRADED
```

---

### 8.6 Student: View Grades

```
Dashboard sidebar → "Grades" link
  └── /grades
        [Course cards — click to expand]
              └── /grades/[courseId]
                    [Overall grade percentage / pass-fail]
                    [Quizzes table: title | score | max | passed]
                    [Assignments table: title | grade | max | feedback preview | status]
                    [Click feedback row → modal with full feedback text]
```

---

## 9. Validation Rules

### Quiz

| Field | Rule |
|---|---|
| `title` | Required, 3–200 characters |
| `timeLimitMin` | Optional; if provided, must be integer 1–300 |
| `maxAttempts` | Integer 1–10, default 1 |
| `passMark` | Integer 1–100, default 50 |
| `status` transition | DRAFT → PUBLISHED only if at least 1 question exists |
| `status` transition | PUBLISHED → CLOSED allowed; no reverse transitions |

### Quiz Question

| Field | Rule |
|---|---|
| `questionText` | Required, 5–1000 characters |
| `points` | Integer 1–100 |
| `order` | Positive integer; no two questions on the same quiz may share the same order |
| MCQ options | Minimum 2, maximum 6 |
| MCQ correct answers | Exactly 1 option must have `isCorrect: true` |
| SHORT_ANSWER options | Options array must be empty or omitted |

### Assignment

| Field | Rule |
|---|---|
| `title` | Required, 3–200 characters |
| `dueDate` | Required; must be in the future at creation time |
| `maxPoints` | Integer 1–1000 |
| `status` transition | Same rules as quiz |

### Submission

| Field | Rule |
|---|---|
| `content` | Optional string, max 10,000 characters |
| `fileUrl` | Optional; if provided, must be a valid URL |
| At least one | `content` or `fileUrl` must be present and non-empty |

### Grade

| Field | Rule |
|---|---|
| `grade` | Integer, 0 ≤ grade ≤ assignment.maxPoints |
| `feedback` | Optional string, max 2000 characters |

---

## 10. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Student starts quiz, browser crashes | On next page load, `GET /api/attempts/:attemptId` restores in-progress attempt. Timer resumes based on `startedAt`. |
| Timer expires before student submits | A server-side job (or on next request) marks the attempt as `TIMED_OUT` and auto-grades available answers |
| Student submits after time limit | Server compares `submittedAt` against `startedAt + timeLimitMin`. If exceeded, attempt is marked TIMED_OUT regardless |
| Instructor deletes a question with existing attempts | Not permitted if quiz status is PUBLISHED or CLOSED. Quiz must be reverted — which is also blocked. Solution: instructor must close the quiz and create a new one |
| Assignment due date passes while student is mid-submission | Submission is accepted; `status` is set to LATE based on server-side timestamp comparison, not client-side |
| Grade entered above `maxPoints` | API returns `400` with message `"Grade cannot exceed maxPoints"` |
| Student accesses another student's submission URL | API checks `submission.userId === authenticatedUser.id`; returns `403` |
| Instructor tries to grade a submission for a course they don't own | API verifies `course.instructorId === authenticatedUser.id` or `user.role === ADMIN`; returns `403` |
| Two students submit simultaneously to the same assignment | Each has a unique `(userId, assignmentId)` constraint on `Submission`; no conflict |
| Quiz published with no questions | `PATCH` to PUBLISHED returns `400`: `"Quiz must have at least one question before publishing"` |

---

## 11. Ethical & Academic Integrity Considerations

### Data Privacy (GDPR / Data Protection Principles)

- Student grades and submission content are personal data. They must only be accessible to: the student themselves, the course instructor, and admins.
- Grade data must never appear in any API response intended for a different user.
- Submissions must not be cached client-side in a way that persists across logout (clear Pinia store and cookies on logout).

### Academic Integrity

- The system does not implement plagiarism detection in v1.0, which is a known limitation. This should be noted in documentation and treated as a risk.
- Correct answers for MCQ questions are never exposed via the API to student-role tokens, even after an attempt is submitted — only the correctness of their specific answer is revealed.
- `maxAttempts` limits the ability of students to brute-force quiz answers through repeated attempts.
- Timed quizzes reduce the window for external assistance.
- Short-answer questions require manual instructor review, which naturally involves human judgement on originality.

### Misuse Risks

| Risk | Mitigation |
|---|---|
| Student shares quiz questions publicly | Questions are only visible to enrolled students via authenticated API calls; no public route exposes them |
| Instructor inflates grades | Grade audit trail: `grade`, `feedback`, and `updatedAt` are stored; admin can review all grades |
| Admin accesses student data without cause | All admin actions should be logged (future feature); admin role is assigned only by existing admins |

---

## 12. Test Plan

The following test cases satisfy the coursework requirement of a minimum of 3 detailed test cases.

---

### Test Case 1 — MCQ Quiz Auto-Grading

**Test ID:** TC-ASS-001
**Feature:** Quiz submission and auto-grading
**Type:** Functional / Integration

**Preconditions:**
- A course exists with at least one module
- An instructor is authenticated
- A quiz (ID: 5) is PUBLISHED in that module with 3 MCQ questions:
  - Q1 (2pts): correct option ID = 10
  - Q2 (2pts): correct option ID = 14
  - Q3 (2pts): correct option ID = 19
- A student is enrolled in the course

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Student calls `POST /api/quizzes/5/attempts` | Response 201, `attemptId` returned |
| 2 | Student calls `POST /api/attempts/{attemptId}/submit` with answers: Q1→10 (correct), Q2→13 (wrong), Q3→19 (correct) | Response 200 |
| 3 | Verify `score` in response | Score = 4 (Q1: 2pts + Q3: 2pts) |
| 4 | Verify `passed` in response (passMark = 60%) | `passed: true` (4/6 = 66.7%) |
| 5 | Verify Q2 result | `correct: false`, `correctOptionId: 14`, `pointsAwarded: 0` |
| 6 | Student calls `GET /api/courses/{courseId}/grades/me` | Quiz entry shows `bestScore: 4`, `passed: true` |

**Pass criteria:** All 6 steps return the expected results.

---

### Test Case 2 — Late Submission Detection

**Test ID:** TC-ASS-002
**Feature:** Assignment submission with past due date
**Type:** Functional / Integration

**Preconditions:**
- An assignment (ID: 8) exists, PUBLISHED, `dueDate` = 2026-05-10T23:59:00Z (in the past)
- A student is enrolled and has no existing submission for assignment 8
- Current server time is 2026-05-17T10:00:00Z (after due date)

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Student calls `POST /api/assignments/8/submissions` with `{ "content": "My answer" }` | Response 201 |
| 2 | Verify `status` field in response | `status: "LATE"` |
| 3 | Instructor calls `GET /api/assignments/8/submissions` | Student's submission appears with `status: "LATE"` |
| 4 | Instructor grades the submission: `PATCH /api/submissions/{id}/grade` with `{ "grade": 55, "feedback": "Late penalty applied." }` | Response 200, submission status → GRADED |
| 5 | Student calls `GET /api/courses/{courseId}/grades/me` | Assignment shows `grade: 55`, `status: "GRADED"`, feedback visible |

**Pass criteria:** Submission is accepted, flagged LATE, and fully gradeable by the instructor.

---

### Test Case 3 — Role Enforcement: Student Cannot Access Grade Book

**Test ID:** TC-ASS-003
**Feature:** Role-based access control on grade book endpoint
**Type:** Security / Authorization

**Preconditions:**
- Course ID 3 exists
- User A is a STUDENT enrolled in course 3
- User B is the INSTRUCTOR of course 3
- User C is an ADMIN

**Steps:**

| # | Action | Actor | Expected Result |
|---|---|---|---|
| 1 | `GET /api/courses/3/gradebook` | Unauthenticated | `401 Unauthorized` |
| 2 | `GET /api/courses/3/gradebook` | Student (User A) | `403 Forbidden` |
| 3 | `GET /api/courses/3/gradebook` | Instructor (User B) | `200 OK` — grade book data returned |
| 4 | `GET /api/courses/3/gradebook` | Admin (User C) | `200 OK` — grade book data returned |
| 5 | `GET /api/courses/3/gradebook` | Instructor of a *different* course (User D) | `403 Forbidden` |

**Pass criteria:** Only the course's instructor and admins receive a 200 response. All other roles and unauthenticated requests are rejected with the correct status code.

---

## 13. UML Diagram Notes

The following guidance describes how the assessment feature should be represented in the project's required UML diagrams.

### Use Case Diagram

Actors: **Student**, **Instructor**, **Admin**

Key use cases to include:
- `Create Quiz` (Instructor, Admin)
- `Add Question to Quiz` (Instructor, Admin)
- `Publish Quiz` (Instructor, Admin)
- `Attempt Quiz` (Student) — `<<include>>` Start Attempt, Submit Attempt
- `View Quiz Result` (Student)
- `Create Assignment` (Instructor, Admin)
- `Submit Assignment` (Student)
- `Grade Submission` (Instructor, Admin)
- `View Grade Overview` (Student)
- `View Grade Book` (Instructor, Admin)

### Class Diagram

Include the following classes with attributes and methods:
- `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `QuizAnswer`
- `Assignment`, `Submission`
- Show associations: Quiz 1–* QuizQuestion, QuizQuestion 1–* QuizOption, Quiz 1–* QuizAttempt, QuizAttempt 1–* QuizAnswer

### Sequence Diagram

Recommended scenario: **Student takes a quiz**

```
Student → Client → POST /api/quizzes/:id/attempts → Server → DB: create QuizAttempt
Student → Client → POST /api/attempts/:id/submit → Server
  Server → DB: save QuizAnswer (per question)
  Server → autoGrade(): compare selectedOptionId to QuizOption.isCorrect
  Server → DB: update QuizAttempt (score, status: SUBMITTED)
  Server → Client: return result
Client → Student: show score + per-question breakdown
```

### Activity Diagram

Recommended scenario: **Assignment submission lifecycle**

```
[Assignment created: DRAFT]
  → Instructor adds details
  → Instructor publishes → [PUBLISHED]
      → Student submits before due date → [SUBMITTED]
      → Student submits after due date → [LATE]
      → No submission → [PENDING until CLOSED]
  → Instructor closes → [CLOSED]
  → Instructor grades each submission → [GRADED]
  → Student views grade & feedback
```

---

## 14. Innovation Over Standard Moodle

This section directly addresses the coursework criterion *Innovation / Improvement Feature* (10%).

| Feature | Standard Moodle | Lumify Assessment |
|---|---|---|
| Quiz grading | Auto-graded; result shown on separate page after delay | Instant results on same page with per-question breakdown |
| Quiz timer | Basic countdown; no server-side enforcement | Server-enforced: `submittedAt` checked against `startedAt + limit`; auto-submit on timeout |
| Grade overview | Grades scattered across course pages | Unified `/grades` page per course with overall percentage |
| Grade book | Table-only, no visual status indicators | Colour-coded cells (green/amber/red) for at-a-glance progress |
| Submission re-attempt | Requires instructor to manually reset | Student can update submission until it is graded (no instructor action needed) |
| Late submission | Often blocked by default | Accepted but auto-flagged as LATE; instructor retains full control over grading |
| Feedback | Plain text field | Markdown-ready textarea (future) with character limit and preview |
