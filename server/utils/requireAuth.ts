import { verifyAccessToken } from './jwt'
import type { JwtPayload } from './jwt'

export function getUser(event: Parameters<typeof getHeader>[0]): JwtPayload {
    const authHeader = getHeader(event, 'authorization')
    let token: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
    } else {
        token = getCookie(event, 'lms_token') ?? undefined
    }

    if (!token) {
        throw createError({ statusCode: 401, message: 'Authentication required' })
    }

    try {
        return verifyAccessToken(token)
    } catch (err) {
        console.error('[getUser] token verification failed:', err)
        throw createError({ statusCode: 401, message: 'Invalid or expired token' })
    }
}

export function requireRole(event: Parameters<typeof getHeader>[0], ...roles: JwtPayload['role'][]): JwtPayload {
    const payload = getUser(event)
    if (!roles.includes(payload.role)) {
        throw createError({ statusCode: 403, message: 'Insufficient permissions' })
    }
    return payload
}
