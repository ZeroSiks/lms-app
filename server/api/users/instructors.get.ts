import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!token) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const payload = verifyAccessToken(token)
    if (payload.role !== 'ADMIN') {
        throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    const instructors = await prisma.user.findMany({
        where: { role: 'INSTRUCTOR' },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return { instructors }
})
