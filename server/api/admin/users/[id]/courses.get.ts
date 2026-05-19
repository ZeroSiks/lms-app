import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid user ID' })

    return prisma.course.findMany({
        where: { instructorId: id },
        select: {
            id: true,
            title: true,
            code: true,
            duration: true,
            isPublished: true,
            _count: { select: { Enrollment: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
})
