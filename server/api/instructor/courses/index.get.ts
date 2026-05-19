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

    if ((payload.role as string) !== 'INSTRUCTOR') {
        throw createError({ statusCode: 403, message: 'Instructors only.' })
    }

    return prisma.course.findMany({
        where: { instructorId: payload.userId },
        include: {
            _count: { select: { Enrollment: { where: { status: 'ACTIVE' as any } }, Module: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
})
