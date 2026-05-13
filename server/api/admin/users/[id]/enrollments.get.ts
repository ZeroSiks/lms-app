import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
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
