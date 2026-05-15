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

    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) {
        throw createError({ statusCode: 400, message: 'Invalid user ID' })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
        throw createError({ statusCode: 404, message: 'User not found' })
    }

    const updated = await prisma.user.update({
        where: { id },
        data: { role: user.role },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    await prisma.notification.create({
        data: {
            userId: id,
            title: 'Your account has been approved. Welcome aboard!',
        },
    })

    await prisma.activityLog.create({
        data: {
            userId: id,
            type: 'STARTED_COURSE',
            description: `Account approved by admin.`,
        },
    })

    return { message: 'User approved successfully', user: updated }
})
