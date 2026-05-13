import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const { title, description, duration } = await readBody(event)

    if (!title?.trim()) throw createError({ statusCode: 400, message: 'Title is required.' })
    if (!description?.trim()) throw createError({ statusCode: 400, message: 'Description is required.' })

    const prefix = (title as string)
        .split(' ')
        .map((w: string) => w[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 3)
        .padEnd(3, 'X')
    const suffix = Date.now().toString().slice(-5)
    let code = `${prefix}${suffix}`

    const existing = await prisma.course.findUnique({ where: { code } })
    if (existing) code = `${code}A`

    return prisma.course.create({
        data: {
            title: (title as string).trim(),
            description: (description as string).trim(),
            duration: duration?.trim() || null,
            code,
            isPublished: true,
        },
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { Enrollment: true } },
        },
    })
})
