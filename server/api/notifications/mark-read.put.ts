import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!token) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const payload = verifyAccessToken(token)

    await prisma.notification.updateMany({
        where: { userId: payload.userId, read: false },
        data: { read: true },
    })

    return { message: 'All notifications marked as read' }
})
