import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async () => {
    return prisma.course.findMany({
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { Enrollment: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
})
