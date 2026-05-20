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
let lessonId: number

function authHeaders(token: string): Record<string, string> {
  return { Cookie: `lms_token=${token}` }
}

describe('Lesson Completion (Test 7)', () => {

  beforeAll(async () => {
    const admin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@lms.com', password: 'Admin@12345' },
    })
    adminToken = admin.accessToken

    const course = await api<{ id: number }>('/api/admin/courses', {
      method: 'POST',
      body: { title: `Lesson Test ${ts}`, description: 'Lesson completion test', duration: '4 weeks' },
      headers: authHeaders(adminToken),
    })
    courseId = course.id

    const instEmail = `test-lesson-inst-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Lesson', lastName: 'Instructor', email: instEmail, password: 'InstPass123', role: 'INSTRUCTOR' },
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

    const mod = await api<{ id: number }>(`/api/instructor/courses/${courseId}/modules`, {
      method: 'POST',
      body: { title: 'Test Module', description: 'For lessons' },
      headers: authHeaders(instructorToken),
    })
    moduleId = mod.id

    const lesson = await api<{ id: number }>(`/api/instructor/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: { title: 'Test Lesson', content: 'Lesson content here', duration: 30, order: 0 },
      headers: authHeaders(instructorToken),
    })
    lessonId = lesson.id

    const stuEmail = `test-lesson-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Lesson', lastName: 'Tester', email: stuEmail, password: 'LessonPass1', role: 'STUDENT' },
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
      body: { email: stuEmail, password: 'LessonPass1' },
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
  })

  it('T7.1: student can mark lesson as complete', async () => {
    const res = await api<{ completed: boolean }>(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: authHeaders(studentToken),
    })
    expect(res.completed).toBe(true)
  })

  it('T7.2: lesson progress is reflected in course detail', async () => {
    const res = await api<{ Module: Array<{ id: number, Lesson: Array<{ id: number, LessonProgress: Array<{ completed: boolean }> }> }> }>(
      `/api/courses/${courseId}`,
      { headers: authHeaders(studentToken) }
    )
    const lesson = res.Module.flatMap(m => m.Lesson).find(l => l.id === lessonId)
    expect(lesson).toBeDefined()
    expect(lesson!.LessonProgress[0]?.completed).toBe(true)
  })

  it('T7.3: completing same lesson again is idempotent', async () => {
    const res = await api<{ completed: boolean }>(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: authHeaders(studentToken),
    })
    expect(res.completed).toBe(true)
  })

  it('T7.4: unauthenticated user cannot complete lesson', async () => {
    await expect(api(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
    })).rejects.toThrow()
  })

  it('T7.5: lesson detail returns with progress for student', async () => {
    const res = await api<{ LessonProgress: Array<{ completed: boolean }> }>(
      `/api/courses/${courseId}/lessons/${lessonId}`,
      { headers: authHeaders(studentToken) }
    )
    expect(res.LessonProgress[0]?.completed).toBe(true)
  })
})
