import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid user ID' })

    return prisma.enrollment.findMany({
        where: { userId: id },
        include: {
            Course: { select: { id: true, title: true, code: true, duration: true } },
        },
        orderBy: { enrolledAt: 'desc' },
    })
})
