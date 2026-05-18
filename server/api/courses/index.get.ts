import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const search = query.search as string | undefined

    return prisma.course.findMany({
        where: {
            isPublished: true,
            ...(search ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } },
                ]
            } : {}),
        },
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
