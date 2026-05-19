import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid course ID.' })

    const { instructorId } = await readBody(event)

    if (instructorId !== null && instructorId !== undefined) {
        const instructor = await prisma.user.findUnique({ where: { id: Number(instructorId) } })
        if (!instructor || instructor.role !== 'INSTRUCTOR') {
            throw createError({ statusCode: 400, message: 'User is not a valid instructor.' })
        }
    }

    return prisma.course.update({
        where: { id },
        data: { instructorId: instructorId ? Number(instructorId) : null },
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { Enrollment: true } },
        },
    })
})
