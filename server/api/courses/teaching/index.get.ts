import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'access_token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const payload = verifyAccessToken(token)

  const courses = await prisma.course.findMany({
    where: { instructorId: payload.userId },
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true }
      },
      _count: {
        select: { enrollments: true, modules: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return courses
})
