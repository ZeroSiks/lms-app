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

  const courses = await prisma.course.findMany({
    where: { instructorId: payload.userId },
    include: {
      User: {
        select: { id: true, firstName: true, lastName: true }
      },
      _count: {
        select: { Enrollment: true, Module: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return courses
})
