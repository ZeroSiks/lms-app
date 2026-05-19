import { verifyAccessToken, type JwtPayload } from '@@/server/utils/jwt'
import type { H3Event } from 'h3'

function extractPayload(event: H3Event): JwtPayload {
  const token = getCookie(event, 'lms_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  try {
    return verifyAccessToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' })
  }
}

function checkRole(payload: JwtPayload, role: string): void {
  if ((payload.role as string) !== role) {
    throw createError({ statusCode: 403, message: 'Insufficient permissions.' })
  }
}

export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  return extractPayload(event)
}

export async function requireAdmin(event: H3Event): Promise<JwtPayload> {
  const payload = extractPayload(event)
  checkRole(payload, 'ADMIN')
  return payload
}

export async function requireInstructor(event: H3Event): Promise<JwtPayload> {
  const payload = extractPayload(event)
  checkRole(payload, 'INSTRUCTOR')
  return payload
}

export async function requireStudent(event: H3Event): Promise<JwtPayload> {
  const payload = extractPayload(event)
  checkRole(payload, 'STUDENT')
  return payload
}
