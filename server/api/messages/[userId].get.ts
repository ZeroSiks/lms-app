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

    const otherId = Number(getRouterParam(event, 'userId'))
    if (isNaN(otherId)) throw createError({ statusCode: 400, message: 'Invalid user ID' })

    return prisma.message.findMany({
        where: {
            OR: [
                { senderId: payload.userId, receiverId: otherId },
                { senderId: otherId, receiverId: payload.userId },
            ],
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true, content: true, senderId: true, receiverId: true, createdAt: true },
    })
})
