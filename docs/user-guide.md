# User Guide — Lumify LMS

## Getting Started

### Registration

1. Navigate to the Lumify homepage and click **Register** (or go to `/register`)
2. Fill in your first name, last name, email, and password (minimum 8 characters)
3. Select your role: **Student** or **Instructor**
4. Click **Create Account**
5. Your account will be **pending admin approval** — you'll see a confirmation screen
6. Once approved by an administrator, you can log in

### Login

1. Go to `/login`
2. Enter your registered email and password
3. Click **Sign In**
4. You'll be redirected to your dashboard based on your role

### Forgot Password

1. On the login page, click **Forgot password?**
2. Enter your email address
3. Click **Send Reset Link**
4. You'll receive a reset token (displayed on screen in development)
5. Click "Go to reset password" and enter your new password
6. Log in with your new password

---

## Student Guide

### Dashboard (`/dashboard`)

Your dashboard shows:
- **Learning Streak** — consecutive days you've completed at least one lesson
- **Stats** — enrolled courses, lessons completed, assignments due
- **Course Progress** — per-course progress bars showing completion percentage
- **Upcoming Deadlines** — assignments due soon (red if due within 2 days)

### Browsing Courses (`/courses`)

- View all published courses
- **Search** by title, description, or course code
- **Join by Code** — enter a course code to enroll directly
- Click on a course card to view details

### Enrolling in a Course

1. Open a course page
2. Click **Enroll Now**
3. Your enrollment will be pending admin approval
4. Once approved, the course appears in your dashboard

### Learning: Lessons

1. Open an enrolled course
2. Navigate to a lesson under any module
3. Read the lesson content and watch any embedded videos
4. Click **Mark Complete** when finished
5. Your completion is tracked in the sidebar with green checkmarks
6. Use **Previous** and **Next** buttons to navigate between lessons

### Submitting Assignments

1. Open the assignment from the course page
2. Write your answer in the text editor
3. Optionally attach a file (PDF, Word, PowerPoint, images — max 10MB)
4. Click **Submit Assignment**
5. After grading, you'll see your grade and feedback

### Tracking Progress (`/dashboard/progress`)

- View per-course completion percentages
- See your learning streak calendar (7-day view)
- Click any course to continue learning

### Messaging (`/dashboard/messages`)

- **Conversations** — sidebar shows all message threads
- **New Message** — click the button and search for a recipient by name
- Type your message and press Enter to send
- Messages are color-coded (blue = sent by you, white = received)

### Notifications

- The **bell icon** in the top navigation shows unread notification count
- Click to view: enrollment approvals, new messages, graded assignments
- Click **Mark all read** to clear the badge

### Profile Settings (`/dashboard/settings`)

- **Profile** — edit your name and bio
- **Password** — change your password (requires current password)
- View your account email, role, and join date

---

## Instructor Guide

### Dashboard (`/dashboard`)

Your dashboard shows:
- **Courses** you teach with student counts
- **Pending Reviews** — submissions waiting for grading
- Total students and published course counts

### Managing Courses (`/instructor/courses`)

- View all courses assigned to you
- Click a course to manage its content

### Course Content Management

#### Modules
1. Click **Add Module** to create a new section
2. Enter a title and description
3. Use **Edit** and **Delete** buttons on existing modules

#### Lessons
1. Select a module and click **Add Lesson**
2. Enter title, content, duration (minutes), and optional video URL
3. Lessons are ordered — drag/reorder by editing the order field

#### Assignments
1. Select a module and click **Add Assignment**
2. Enter title, description, due date, and maximum points
3. Choose whether to **publish immediately** or save as **draft**

#### Publishing
- Toggle the **Publish** button on the course page
- Only published courses appear in the catalog
- Draft courses are only visible to you

### Grading Submissions

1. Open a course and navigate to an assignment
2. Click **View Submissions**
3. Review student answers and download attached files
4. Enter a **grade** (numeric) and **feedback** (written comments)
5. Click **Grade Submission**
6. The student receives a notification with their grade

### Messaging

- Message your students from `/dashboard/messages`
- Recipients include all students enrolled in your courses

---

## Admin Guide

### Dashboard (`/admin`)

The admin overview shows:
- **System stats** — total students, instructors, active courses
- **Pending approvals** — users and enrollments awaiting review
- **Activity log** — recent registrations, enrollments, and course creations

### Approvals (`/admin/approvals`)

Two tabs:
- **Account Applications** — approve or reject pending user registrations
- **Course Applications** — approve or reject pending enrollment requests

Search by name or email, filter by role, and approve/reject with one click.

### User Management

- **Students** (`/admin/students`) — view, search, filter by status (All/Pending/Active/Rejected)
- **Instructors** (`/admin/instructors`) — same management capabilities
- Click enrollment/course counts to view details in a modal
- **Deactivate** active users or **approve**/**reject** pending ones

### Course Management (`/admin/courses`)

- View all courses with instructor names and enrollment counts
- **Add Course** — enter title, description, and duration
- **Assign Instructor** — select from active instructor list
- **Delete Course** — removes course and all dependent data (enrollments, announcements, modules)

### Activity Log (`/admin/activity`)

- Unified feed of all platform activity
- Filter by type: All, Registrations, Enrollments, Courses
- Each event shows: type, user, detail, status, and relative timestamp
- Click **Refresh** to load latest activity
