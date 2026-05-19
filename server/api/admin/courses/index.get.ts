import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    return prisma.course.findMany({
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { Enrollment: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
})
