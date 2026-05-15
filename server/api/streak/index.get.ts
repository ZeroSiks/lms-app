import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    if (!token) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const payload = verifyAccessToken(token)

    let streak = await prisma.userStreak.findUnique({
        where: { userId: payload.userId },
    })

    if (!streak) {
        streak = await prisma.userStreak.create({
            data: {
                userId: payload.userId,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: new Date(),
            },
        })
    }

    return { streak }
})
