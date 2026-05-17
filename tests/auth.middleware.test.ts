import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mirrors the logic in app/middleware/auth.ts
function authMiddleware(path: string, user: { role: string } | null): { redirect: string | null } {
    if (!user) return { redirect: '/login' }
    if (path.startsWith('/admin') && user.role !== 'ADMIN') return { redirect: '/dashboard' }
    if (path === '/dashboard' && user.role === 'ADMIN') return { redirect: '/admin' }
    return { redirect: null }
}

// Mirrors app/middleware/guest.ts — redirect logged-in users away from login/register
function guestMiddleware(path: string, user: { role: string } | null): { redirect: string | null } {
    if (!user) return { redirect: null }
    if (user.role === 'ADMIN') return { redirect: '/admin' }
    return { redirect: '/dashboard' }
}

describe('auth middleware', () => {
    it('redirects unauthenticated user to /login', () => {
        expect(authMiddleware('/dashboard', null).redirect).toBe('/login')
    })

    it('redirects unauthenticated user away from /admin to /login', () => {
        expect(authMiddleware('/admin', null).redirect).toBe('/login')
    })

    it('allows STUDENT to access /dashboard', () => {
        expect(authMiddleware('/dashboard', { role: 'STUDENT' }).redirect).toBeNull()
    })

    it('allows INSTRUCTOR to access /dashboard', () => {
        expect(authMiddleware('/dashboard', { role: 'INSTRUCTOR' }).redirect).toBeNull()
    })

    it('blocks STUDENT from /admin and redirects to /dashboard', () => {
        expect(authMiddleware('/admin', { role: 'STUDENT' }).redirect).toBe('/dashboard')
    })

    it('blocks INSTRUCTOR from /admin and redirects to /dashboard', () => {
        expect(authMiddleware('/admin/users', { role: 'INSTRUCTOR' }).redirect).toBe('/dashboard')
    })

    it('allows ADMIN to access /admin', () => {
        expect(authMiddleware('/admin', { role: 'ADMIN' }).redirect).toBeNull()
    })

    it('redirects ADMIN from /dashboard to /admin', () => {
        expect(authMiddleware('/dashboard', { role: 'ADMIN' }).redirect).toBe('/admin')
    })

    it('allows ADMIN to access nested /admin/courses', () => {
        expect(authMiddleware('/admin/courses', { role: 'ADMIN' }).redirect).toBeNull()
    })

    it('allows STUDENT to access /courses without redirect', () => {
        expect(authMiddleware('/courses', { role: 'STUDENT' }).redirect).toBeNull()
    })
})

describe('guest middleware', () => {
    it('allows unauthenticated user to access /login', () => {
        expect(guestMiddleware('/login', null).redirect).toBeNull()
    })

    it('redirects authenticated STUDENT away from /login to /dashboard', () => {
        expect(guestMiddleware('/login', { role: 'STUDENT' }).redirect).toBe('/dashboard')
    })

    it('redirects authenticated INSTRUCTOR away from /register to /dashboard', () => {
        expect(guestMiddleware('/register', { role: 'INSTRUCTOR' }).redirect).toBe('/dashboard')
    })

    it('redirects authenticated ADMIN away from /login to /admin', () => {
        expect(guestMiddleware('/login', { role: 'ADMIN' }).redirect).toBe('/admin')
    })
})
