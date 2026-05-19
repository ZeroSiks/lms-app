import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'

const TEST_SECRET = 'test-secret-for-unit-tests'

// Mirror requireAuth logic with test-injectable verifier
function makeVerify(secret: string) {
    return (token: string) => jwt.verify(token, secret) as { userId: number; email: string; role: string }
}

function requireAuthLogic(
    authHeader: string | undefined,
    cookieToken: string | undefined,
    verify: (t: string) => unknown
): { status: number; message: string } | { userId: number; email: string; role: string } {
    let token: string | undefined
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
    } else {
        token = cookieToken
    }

    if (!token) return { status: 401, message: 'Authentication required' }

    try {
        return verify(token) as { userId: number; email: string; role: string }
    } catch {
        return { status: 401, message: 'Invalid or expired token' }
    }
}

const validPayload = { userId: 42, email: 'user@test.com', role: 'STUDENT' as const }

function makeToken(payload = validPayload, secret = TEST_SECRET, opts: jwt.SignOptions = {}) {
    return jwt.sign(payload, secret, { expiresIn: '15m', ...opts })
}

const verify = makeVerify(TEST_SECRET)

describe('requireAuth — token extraction', () => {
    it('returns 401 when no header and no cookie', () => {
        const result = requireAuthLogic(undefined, undefined, verify)
        expect(result).toMatchObject({ status: 401, message: 'Authentication required' })
    })

    it('extracts token from Authorization: Bearer header', () => {
        const token = makeToken()
        const result = requireAuthLogic(`Bearer ${token}`, undefined, verify)
        expect(result).toMatchObject({ userId: 42, email: 'user@test.com', role: 'STUDENT' })
    })

    it('falls back to cookie when no Authorization header', () => {
        const token = makeToken()
        const result = requireAuthLogic(undefined, token, verify)
        expect(result).toMatchObject({ userId: 42 })
    })

    it('prefers Authorization header over cookie when both present', () => {
        const headerToken = makeToken({ ...validPayload, userId: 1 })
        const cookieToken = makeToken({ ...validPayload, userId: 2 })
        const result = requireAuthLogic(`Bearer ${headerToken}`, cookieToken, verify) as { userId: number }
        expect(result.userId).toBe(1)
    })

    it('returns 401 for header without Bearer prefix', () => {
        const token = makeToken()
        const result = requireAuthLogic(token, undefined, verify)
        // Without "Bearer " prefix, falls to cookie (undefined) → 401
        expect(result).toMatchObject({ status: 401, message: 'Authentication required' })
    })
})

describe('requireAuth — token verification', () => {
    it('returns 401 for a completely invalid token string', () => {
        const result = requireAuthLogic('Bearer not.a.jwt', undefined, verify)
        expect(result).toMatchObject({ status: 401, message: 'Invalid or expired token' })
    })

    it('returns 401 for a token signed with the wrong secret', () => {
        const badToken = makeToken(validPayload, 'wrong-secret')
        const result = requireAuthLogic(`Bearer ${badToken}`, undefined, verify)
        expect(result).toMatchObject({ status: 401, message: 'Invalid or expired token' })
    })

    it('returns 401 for an expired token', () => {
        const expiredToken = makeToken(validPayload, TEST_SECRET, { expiresIn: '-1s' })
        const result = requireAuthLogic(`Bearer ${expiredToken}`, undefined, verify)
        expect(result).toMatchObject({ status: 401, message: 'Invalid or expired token' })
    })

    it('accepts a valid token and returns its payload', () => {
        const token = makeToken({ userId: 99, email: 'admin@test.com', role: 'ADMIN' })
        const result = requireAuthLogic(`Bearer ${token}`, undefined, verify)
        expect(result).toMatchObject({ userId: 99, email: 'admin@test.com', role: 'ADMIN' })
    })

    it('returns 401 (no token) for an empty Bearer value', () => {
        // 'Bearer '.slice(7) = '' which is falsy → treated as missing token
        const result = requireAuthLogic('Bearer ', undefined, verify)
        expect(result).toMatchObject({ status: 401, message: 'Authentication required' })
    })
})
