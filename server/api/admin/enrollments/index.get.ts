import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async () => {
    return prisma.enrollment.findMany({
        where: { status: 'PENDING' as any },
        include: {
            User: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
            Course: { select: { id: true, title: true, code: true } },
        },
        orderBy: { enrolledAt: 'desc' },
    })
})
