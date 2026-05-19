import { describe, it, expect, beforeAll } from 'vitest'
import { $fetch } from 'ofetch'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const api = (url: string, opts: Record<string, unknown> = {}) => $fetch(`${BASE}${url}`, opts)

const ts = Date.now()
let adminToken: string
let instructorToken: string
let studentToken: string
let courseId: number
let enrollmentId: number

function authHeaders(token: string): Record<string, string> {
  return { Cookie: `lms_token=${token}` }
}

describe('Enrollment & Admin Auth (Tests 2, 4)', () => {

  beforeAll(async () => {
    const admin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@lms.com', password: 'Admin@12345' },
    })
    adminToken = admin.accessToken

    const course = await api<{ id: number }>('/api/admin/courses', {
      method: 'POST',
      body: { title: `Test Course ${ts}`, description: 'Enrollment test course', duration: '8 weeks' },
      headers: authHeaders(adminToken),
    })
    courseId = course.id

    const instEmail = `test-instructor-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Test', lastName: 'Instructor', email: instEmail, password: 'InstPass123', role: 'INSTRUCTOR' },
    })
    const pending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(instEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${pending[0].id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const instLogin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: instEmail, password: 'InstPass123' },
    })
    instructorToken = instLogin.accessToken
  })

  // =================== TEST 2: Enrollment Workflow ===================

  it('T2.1: student registers, gets approved, and logs in', async () => {
    const email = `test-enroll-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Enroll', lastName: 'Student', email, password: 'EnrollPass1', role: 'STUDENT' },
    })
    const pending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(email)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${pending[0].id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const login = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password: 'EnrollPass1' },
    })
    studentToken = login.accessToken
  })

  it('T2.2: student enrolls in course (PENDING)', async () => {
    const res = await api<{ id: number; status: string }>(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: authHeaders(studentToken),
    })
    enrollmentId = res.id
    expect(res.status).toBe('PENDING')
  })

  it('T2.3: admin sees pending enrollment', async () => {
    const res = await api<Array<{ id: number }>>('/api/admin/enrollments', {
      headers: authHeaders(adminToken),
    })
    const found = res.find((e) => e.id === enrollmentId)
    expect(found).toBeDefined()
  })

  it('T2.4: admin approves enrollment', async () => {
    const res = await api<{ ok: boolean }>(`/api/admin/enrollments/${enrollmentId}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    expect(res.ok).toBe(true)
  })

  it('T2.5: course appears in student dashboard', async () => {
    const res = await api<{ enrolledCount: number; courses: Array<{ id: number }> }>('/api/student/dashboard', {
      headers: authHeaders(studentToken),
    })
    expect(res.enrolledCount).toBeGreaterThanOrEqual(1)
    expect(res.courses.find((c) => c.id === courseId)).toBeDefined()
  })

  it('T2.6: student can access course details after enrollment', async () => {
    const res = await api<{ hasAccess: boolean }>(`/api/courses/${courseId}`, {
      headers: authHeaders(studentToken),
    })
    expect(res.hasAccess).toBe(true)
  })

  // =================== TEST 4: Unauthenticated Admin Access ===================

  it('T4.1: admin stats rejected without auth', async () => {
    await expect(api('/api/admin/stats')).rejects.toThrow()
  })

  it('T4.2: admin users rejected without auth', async () => {
    await expect(api('/api/admin/users')).rejects.toThrow()
  })

  it('T4.3: POST admin courses rejected without auth', async () => {
    await expect(api('/api/admin/courses', { method: 'POST', body: {} })).rejects.toThrow()
  })

  it('T4.4: DELETE admin course rejected without auth', async () => {
    await expect(api('/api/admin/courses/99999', { method: 'DELETE' })).rejects.toThrow()
  })

  it('T4.5: student token cannot access admin endpoints', async () => {
    await expect(api('/api/admin/stats', { headers: authHeaders(studentToken) })).rejects.toThrow()
  })

  it('T4.6: instructor token cannot access admin endpoints', async () => {
    await expect(api('/api/admin/stats', { headers: authHeaders(instructorToken) })).rejects.toThrow()
  })
})
