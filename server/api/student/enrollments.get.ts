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

    return prisma.enrollment.findMany({
        where: { userId: payload.userId },
        include: {
            Course: {
                select: { id: true, title: true, code: true, description: true, duration: true },
            },
        },
        orderBy: { enrolledAt: 'desc' },
    })
})
