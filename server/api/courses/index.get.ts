import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async () => {
    return prisma.course.findMany({
        where: { isPublished: true },
        select: {
            id: true,
            title: true,
            description: true,
            code: true,
            duration: true,
            createdAt: true,
            User: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
})
