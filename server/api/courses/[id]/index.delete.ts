import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'lms_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' })
  }

  const id = parseInt(getRouterParam(event, 'id') as string)
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid course ID' })

  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) throw createError({ statusCode: 404, message: 'Course not found' })

  if (payload.role !== 'ADMIN' && course.instructorId !== payload.userId) {
    throw createError({ statusCode: 403, message: 'Not your course' })
  }

  await prisma.course.delete({ where: { id } })

  return { success: true, message: 'Course deleted' }
})