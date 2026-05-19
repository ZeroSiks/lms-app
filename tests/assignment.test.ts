import { describe, it, expect, beforeAll } from 'vitest'
import { $fetch } from 'ofetch'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const api = (url: string, opts: Record<string, unknown> = {}) => $fetch(`${BASE}${url}`, opts)

const ts = Date.now()
let adminToken: string
let instructorToken: string
let studentToken: string
let courseId: number
let moduleId: number
let assignmentId: number

function authHeaders(token: string): Record<string, string> {
  return { Cookie: `lms_token=${token}` }
}

describe('Assignment Submission & Grading (Test 3)', () => {

  beforeAll(async () => {
    const admin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@lms.com', password: 'Admin@12345' },
    })
    adminToken = admin.accessToken

    const course = await api<{ id: number }>('/api/admin/courses', {
      method: 'POST',
      body: { title: `Grading Test ${ts}`, description: 'Grading test', duration: '6 weeks' },
      headers: authHeaders(adminToken),
    })
    courseId = course.id

    // Instructor
    const instEmail = `test-grader-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Grade', lastName: 'Instructor', email: instEmail, password: 'GradePass1', role: 'INSTRUCTOR' },
    })
    const instPending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(instEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${instPending[0].id}/approve`, {
      method: 'POST', headers: authHeaders(adminToken),
    })
    await api(`/api/admin/courses/${courseId}/assign-instructor`, {
      method: 'POST', body: { instructorId: instPending[0].id }, headers: authHeaders(adminToken),
    })
    const instLogin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST', body: { email: instEmail, password: 'GradePass1' },
    })
    instructorToken = instLogin.accessToken

    // Student
    const stuEmail = `test-submitter-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Submit', lastName: 'Student', email: stuEmail, password: 'SubmitPass1', role: 'STUDENT' },
    })
    const stuPending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(stuEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${stuPending[0].id}/approve`, {
      method: 'POST', headers: authHeaders(adminToken),
    })
    const stuLogin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST', body: { email: stuEmail, password: 'SubmitPass1' },
    })
    studentToken = stuLogin.accessToken

    // Enroll student
    const enrollment = await api<{ id: number }>(`/api/courses/${courseId}/enroll`, {
      method: 'POST', headers: authHeaders(studentToken),
    })
    await api(`/api/admin/enrollments/${enrollment.id}/approve`, {
      method: 'POST', headers: authHeaders(adminToken),
    })

    // Create module + assignment
    const mod = await api<{ id: number }>(`/api/instructor/courses/${courseId}/modules`, {
      method: 'POST', body: { title: 'Module 1', description: 'First' },
      headers: authHeaders(instructorToken),
    })
    moduleId = mod.id

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const assign = await api<{ id: number }>(`/api/instructor/modules/${moduleId}/assignments`, {
      method: 'POST',
      body: { title: 'Test Assignment', description: 'Submit here', dueDate: futureDate, maxPoints: 100, publish: true },
      headers: authHeaders(instructorToken),
    })
    assignmentId = assign.id
  })

  it('T3.1: student submits assignment', async () => {
    const res = await api<{ status: string; content: string }>(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: { content: 'My assignment submission for grading.' },
      headers: authHeaders(studentToken),
    })
    expect(res.status).toBe('SUBMITTED')
  })

  it('T3.2: instructor sees the submission', async () => {
    const res = await api<Array<{ id: number; status: string }>>(`/api/instructor/assignments/${assignmentId}/submissions`, {
      headers: authHeaders(instructorToken),
    })
    expect(res.length).toBeGreaterThanOrEqual(1)
    expect(res[0].status).toBe('SUBMITTED')
  })

  it('T3.3: instructor grades the submission', async () => {
    const subs = await api<Array<{ id: number }>>(`/api/instructor/assignments/${assignmentId}/submissions`, {
      headers: authHeaders(instructorToken),
    })
    const res = await api<{ grade: number; feedback: string; status: string }>(`/api/instructor/submissions/${subs[0].id}/grade`, {
      method: 'POST',
      body: { grade: 85, feedback: 'Good work!' },
      headers: authHeaders(instructorToken),
    })
    expect(res.grade).toBe(85)
    expect(res.feedback).toBe('Good work!')
    expect(res.status).toBe('GRADED')
  })

  it('T3.4: student cannot resubmit graded assignment', async () => {
    await expect(api(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: { content: 'Resubmission attempt' },
      headers: authHeaders(studentToken),
    })).rejects.toThrow()
  })
})
