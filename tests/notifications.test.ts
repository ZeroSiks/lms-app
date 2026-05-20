import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { $fetch } from 'ofetch'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const api = (url: string, opts: Record<string, unknown> = {}) => $fetch(`${BASE}${url}`, opts)

const ts = Date.now()
let adminToken: string
let studentToken: string
let studentId: number
let courseId: number
let assignmentId: number
let moduleId: number

function authHeaders(token: string): Record<string, string> {
  return { Cookie: `lms_token=${token}` }
}

describe('Notification Delivery (Test 8)', () => {

  beforeAll(async () => {
    const admin = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@lms.com', password: 'Admin@12345' },
    })
    adminToken = admin.accessToken

    const course = await api<{ id: number }>('/api/admin/courses', {
      method: 'POST',
      body: { title: `Notif Test ${ts}`, description: 'Notification test', duration: '2 weeks' },
      headers: authHeaders(adminToken),
    })
    courseId = course.id

    const stuEmail = `test-notif-${ts}@lms.test`
    await api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Notif', lastName: 'Tester', email: stuEmail, password: 'NotifPass1', role: 'STUDENT' },
    })
    const pending = await api<Array<{ id: number }>>(`/api/admin/pending-users?search=${encodeURIComponent(stuEmail)}`, {
      headers: authHeaders(adminToken),
    })
    studentId = pending[0].id
    await api(`/api/admin/users/${studentId}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    })
    const login = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: stuEmail, password: 'NotifPass1' },
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
      body: { title: 'Notif Module', description: 'Test' },
      headers: authHeaders(adminToken),
    })
    moduleId = mod.id

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const assign = await api<{ id: number }>(`/api/instructor/modules/${moduleId}/assignments`, {
      method: 'POST',
      body: { title: 'Notif Assignment', description: 'Submit', dueDate: futureDate, maxPoints: 100, publish: true },
      headers: authHeaders(adminToken),
    })
    assignmentId = assign.id
  })

  it('T8.1: enrollment approval generates notification', async () => {
    const res = await api<{ notifications: Array<{ title: string; type: string }> }>('/api/notifications', {
      headers: authHeaders(studentToken),
    })
    const enrollNotif = res.notifications.find(n => n.type === 'enrollment')
    expect(enrollNotif).toBeDefined()
  })

  it('T8.2: notifications endpoint returns unread count', async () => {
    const res = await api<{ notifications: Array<{ read: boolean }>; unreadCount: number }>('/api/notifications', {
      headers: authHeaders(studentToken),
    })
    expect(typeof res.unreadCount).toBe('number')
  })

  it('T8.3: mark all read clears unread count', async () => {
    await api('/api/notifications/read-all', {
      method: 'POST',
      headers: authHeaders(studentToken),
    })
    const res = await api<{ notifications: Array<{ read: boolean }>; unreadCount: number }>('/api/notifications', {
      headers: authHeaders(studentToken),
    })
    expect(res.unreadCount).toBe(0)
    expect(res.notifications.every(n => n.read)).toBe(true)
  })

  it('T8.4: grading a submission generates notification', async () => {
    await api(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: { content: 'My notif test submission.' },
      headers: authHeaders(studentToken),
    })
    const subs = await api<Array<{ id: number }>>(`/api/instructor/assignments/${assignmentId}/submissions`, {
      headers: authHeaders(adminToken),
    })
    await api(`/api/instructor/submissions/${subs[0].id}/grade`, {
      method: 'POST',
      body: { grade: 90, feedback: 'Notif test feedback' },
      headers: authHeaders(adminToken),
    })
    const res = await api<{ notifications: Array<{ type: string }> }>('/api/notifications', {
      headers: authHeaders(studentToken),
    })
    const gradeNotif = res.notifications.find(n => n.type === 'grade')
    expect(gradeNotif).toBeDefined()
  })

  it('T8.5: unauthenticated user cannot access notifications', async () => {
    await expect(api('/api/notifications')).rejects.toThrow()
  })
})
