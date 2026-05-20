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

describe('File Upload & Validation (Test 9)', () => {

  beforeAll(async () => {
    const admin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@lms.com', password: 'Admin@12345' },
    })
    adminToken = admin.accessToken

    const course = await api<{ id: number }>('/api/admin/courses', {
      method: 'POST',
      body: { title: `Upload Test ${ts}`, description: 'File upload test', duration: '2 weeks' },
      headers: authHeaders(adminToken),
    })
    courseId = course.id

    const instEmail = `test-upload-inst-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Upload', lastName: 'Instructor', email: instEmail, password: 'InstPass123', role: 'INSTRUCTOR' },
    })
    const instPending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(instEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${instPending[0].id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const instLogin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: instEmail, password: 'InstPass123' },
    })
    instructorToken = instLogin.accessToken

    await api(`/api/admin/courses/${courseId}/assign-instructor`, {
      method: 'POST',
      body: { instructorId: instPending[0].id },
      headers: authHeaders(adminToken),
    })

    const stuEmail = `test-upload-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Upload', lastName: 'Tester', email: stuEmail, password: 'UploadPass1', role: 'STUDENT' },
    })
    const pending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(stuEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${pending[0].id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const login = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: stuEmail, password: 'UploadPass1' },
    })
    studentToken = login.accessToken

    const enrollment = await api<{ id: number }>(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: authHeaders(studentToken),
    })
    await api(`/api/admin/enrollments/${enrollment.id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })

    const mod = await api<{ id: number }>(`/api/instructor/courses/${courseId}/modules`, {
      method: 'POST',
      body: { title: 'Upload Module', description: 'Test' },
      headers: authHeaders(instructorToken),
    })
    moduleId = mod.id

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const assign = await api<{ id: number }>(`/api/instructor/modules/${moduleId}/assignments`, {
      method: 'POST',
      body: { title: 'Upload Assignment', description: 'Submit a file', dueDate: futureDate, maxPoints: 100, publish: true },
      headers: authHeaders(instructorToken),
    })
    assignmentId = assign.id
  })

  it('T9.1: submit assignment with text content only', async () => {
    const res = await api<{ status: string }>(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: { content: 'Text-only submission for upload test.' },
      headers: authHeaders(studentToken),
    })
    expect(res.status).toBe('SUBMITTED')
  })

  it('T9.2: submit assignment with a valid file URL', async () => {
    const instEmail = `test-upload2-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Upload', lastName: 'Two', email: instEmail, password: 'Pass12345', role: 'STUDENT' },
    })
    const pending2 = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(instEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${pending2[0].id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const login2 = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: instEmail, password: 'Pass12345' },
    })
    const token2 = login2.accessToken

    const enr2 = await api<{ id: number }>(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: authHeaders(token2),
    })
    await api(`/api/admin/enrollments/${enr2.id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })

    const res = await api<{ status: string; fileUrl: string }>(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: { content: 'Contains a file', fileUrl: 'https://example.com/assignment.pdf' },
      headers: authHeaders(token2),
    })
    expect(res.status).toBe('SUBMITTED')
  })

  it('T9.3: submit multipart file via submission endpoint', async () => {
    const instEmail = `test-upload3-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Upload', lastName: 'Three', email: instEmail, password: 'Pass12345', role: 'STUDENT' },
    })
    const pending3 = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(instEmail)}`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/admin/users/${pending3[0].id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const login3 = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: instEmail, password: 'Pass12345' },
    })
    const token3 = login3.accessToken

    const enr3 = await api<{ id: number }>(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: authHeaders(token3),
    })
    await api(`/api/admin/enrollments/${enr3.id}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })

    const formData = new FormData()
    formData.append('content', 'Multipart form submission test')
    formData.append('file', new Blob(['Hello World'], { type: 'text/plain' }), 'test-submission.txt')

    const res = await $fetch<{ status: string }>(`${BASE}/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        Cookie: `lms_token=${token3}`,
      },
      body: formData,
    })
    expect(res.status).toBe('SUBMITTED')
  })

  it('T9.4: submits with neither content nor file are rejected', async () => {
    await expect(api(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: {},
      headers: authHeaders(studentToken),
    })).rejects.toThrow()
  })
})
