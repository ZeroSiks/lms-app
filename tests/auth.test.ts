import { describe, it, expect, beforeAll } from 'vitest'
import { $fetch } from 'ofetch'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const api = (url: string, opts: Record<string, unknown> = {}) => $fetch(`${BASE}${url}`, opts)

const ts = Date.now()
const studentEmail = `test-student-${ts}@lms.test`
const studentPassword = 'TestPass123'
let studentId: number
let adminToken: string

describe('Auth & Registration (Tests 1, 5, 6)', () => {

  beforeAll(async () => {
    const res = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@lms.com', password: 'Admin@12345' },
    })
    adminToken = res.accessToken
  })

  function adminHeaders(): Record<string, string> {
    return { Cookie: `lms_token=${adminToken}` }
  }

  // =================== TEST 1: User Registration + Approval ===================

  it('T1.1: registers a new student with PENDING status', async () => {
    const res = await api<{ pending: boolean }>('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Test', lastName: 'Student', email: studentEmail, password: studentPassword, role: 'STUDENT' },
    })
    expect(res.pending).toBe(true)
  })

  it('T1.2: duplicate registration rejected for pending email', async () => {
    await expect(api('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Test', lastName: 'Student', email: studentEmail, password: studentPassword, role: 'STUDENT' },
    })).rejects.toThrow()
  })

  it('T1.3: PENDING user cannot login', async () => {
    await expect(api('/api/auth/login', {
      method: 'POST',
      body: { email: studentEmail, password: studentPassword },
    })).rejects.toThrow()
  })

  it('T1.4: admin views pending users list', async () => {
    const res = await api<Array<{ id: number; email: string }>>('/api/admin/pending-users', {
      headers: adminHeaders(),
    })
    const found = res.find((u) => u.email === studentEmail)
    expect(found).toBeDefined()
    studentId = found!.id
  })

  it('T1.5: admin approves the pending user', async () => {
    const res = await api<{ ok: boolean }>(`/api/admin/users/${studentId}/approve`, {
      method: 'POST',
      headers: adminHeaders(),
    })
    expect(res.ok).toBe(true)
  })

  it('T1.6: approved user can login and receives JWT', async () => {
    const res = await api<{ accessToken: string; user: { role: string } }>('/api/auth/login', {
      method: 'POST',
      body: { email: studentEmail, password: studentPassword },
    })
    expect(res.accessToken).toBeDefined()
    expect(res.accessToken.length).toBeGreaterThan(10)
    expect(res.user.role).toBe('STUDENT')
  })

  // =================== TEST 6: Password Reset Flow ===================

  it('T6.1: forgot-password returns token for existing user', async () => {
    const res = await api<{ message: string; resetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: studentEmail },
    })
    expect(res.message).toBeDefined()
    expect(res.resetToken).toBeDefined()
    expect(res.resetToken!.length).toBe(64)
  })

  it('T6.2: invalid reset token is rejected', async () => {
    await expect(api('/api/auth/reset-password', {
      method: 'POST',
      body: { token: 'invalid-fake-token-12345', newPassword: 'SomePass99' },
    })).rejects.toThrow()
  })

  it('T6.3: valid reset token updates password', async () => {
    const forgotRes = await api<{ resetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: studentEmail },
    })
    const newPass = 'NewPass789!'

    const resetRes = await api<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: { token: forgotRes.resetToken, newPassword: newPass },
    })
    expect(resetRes.message).toContain('successfully')
  })

  it('T6.4: login works with new password after reset', async () => {
    const res = await api<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: studentEmail, password: 'NewPass789!' },
    })
    expect(res.accessToken).toBeDefined()
  })

  it('T6.5: old password no longer works after reset', async () => {
    await expect(api('/api/auth/login', {
      method: 'POST',
      body: { email: studentEmail, password: studentPassword },
    })).rejects.toThrow()
  })

  // =================== TEST 5: Rate Limiting ===================
  // NOTE: Rate limiter only active in production (NODE_ENV=production)
  //       This test verifies the rate limiter mechanism exists and triggers

  it('T5.1: login rate limit blocks after 5 rapid attempts', async () => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }
    let status429 = false
    for (let i = 0; i < 8; i++) {
      try {
        await api('/api/auth/login', {
          method: 'POST',
          body: { email: `ratelimit-${ts}@lms.test`, password: 'wrongpassword' },
        })
      } catch (e: unknown) {
        const err = e as { statusCode?: number }
        if (err.statusCode === 429) {
          status429 = true
          break
        }
      }
    }
    expect(status429).toBe(true)
  }, 15000)
})
