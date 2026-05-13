import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid course ID.' })

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) throw createError({ statusCode: 404, message: 'Course not found.' })

    await prisma.enrollment.deleteMany({ where: { courseId: id } })
    await prisma.announcement.deleteMany({ where: { courseId: id } })
    await prisma.course.delete({ where: { id } })

    return { ok: true }
})
