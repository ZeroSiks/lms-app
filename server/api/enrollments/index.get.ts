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

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: payload.userId },
    include: {
      Course: {
        include: {
          User: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  })

  return enrollments
})
