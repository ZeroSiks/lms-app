import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'access_token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const payload = verifyAccessToken(token)

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: payload.userId },
    include: {
      course: {
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  })

  return enrollments
})
