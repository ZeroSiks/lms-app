import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async () => {
    return prisma.user.findMany({
        where: { role: 'INSTRUCTOR', status: 'ACTIVE' as any },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: { firstName: 'asc' },
    })
})
