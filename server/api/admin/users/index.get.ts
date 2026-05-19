import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const query = getQuery(event)
    const role = (query.role as string | undefined)?.toUpperCase()
    const search = (query.search as string | undefined)?.trim() ?? ''
    const statusFilter = (query.status as string | undefined)?.toUpperCase()

    return prisma.user.findMany({
        where: {
            ...(role ? { role: role as any } : { role: { in: ['STUDENT', 'INSTRUCTOR'] as any[] } }),
            ...(statusFilter ? { status: statusFilter as any } : {}),
            ...(search
                ? {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            _count: { select: { Enrollment: true, Course: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
})
