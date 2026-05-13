import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const search = (query.search as string | undefined)?.trim() ?? ''

    const users = await prisma.user.findMany({
        where: {
            status: 'PENDING' as any,
            role: { in: ['STUDENT', 'INSTRUCTOR'] },
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
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return users
})
