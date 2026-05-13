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

    const notifications = await prisma.notification.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return { notifications, unreadCount }
})
