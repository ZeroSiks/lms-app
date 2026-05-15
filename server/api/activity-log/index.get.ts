import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!token) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const payload = verifyAccessToken(token)

    const logs = await prisma.activityLog.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            Course: { select: { id: true, title: true } },
            Module: { select: { id: true, title: true } },
        },
    })

    return { logs }
})
