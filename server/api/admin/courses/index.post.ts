import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const { title, description, duration, instructorId } = await readBody(event)

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

    let instructorIdToSet: number | undefined

    if (instructorId != null) {
        const inst = await prisma.user.findUnique({ where: { id: Number(instructorId) } })
        if (!inst || inst.role !== 'INSTRUCTOR') {
            throw createError({ statusCode: 400, message: 'Invalid instructor.' })
        }
        instructorIdToSet = Number(instructorId)
    }

    return prisma.course.create({
        data: {
            title: (title as string).trim(),
            description: (description as string).trim(),
            duration: duration?.trim() || null,
            code,
            isPublished: true,
            instructorId: instructorIdToSet,
        },
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { Enrollment: true } },
        },
    })
})
