import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    return prisma.user.findMany({
        where: { role: 'INSTRUCTOR', status: 'ACTIVE' as any },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: { firstName: 'asc' },
    })
})
