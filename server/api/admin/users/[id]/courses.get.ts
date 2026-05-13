import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
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
