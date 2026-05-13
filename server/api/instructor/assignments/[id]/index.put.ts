import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'lms_token')
    if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

    let payload
    try {
        payload = verifyAccessToken(token)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid or expired token' })
    }

    if ((payload.role as string) !== 'INSTRUCTOR') throw createError({ statusCode: 403, message: 'Instructors only.' })

    const assignmentId = Number(getRouterParam(event, 'id'))
    if (isNaN(assignmentId)) throw createError({ statusCode: 400, message: 'Invalid assignment ID' })

    const assignment = await prisma.assignment.findFirst({
        where: { id: assignmentId, Module: { Course: { instructorId: payload.userId } } },
    })
    if (!assignment) throw createError({ statusCode: 404, message: 'Assignment not found.' })

    const body = await readBody(event)
    const { title, description, dueDate, maxPoints, status } = body ?? {}
    if (!title?.trim()) throw createError({ statusCode: 400, message: 'Assignment title is required.' })

    return prisma.assignment.update({
        where: { id: assignmentId },
        data: {
            title: title.trim(),
            description: description?.trim() ?? assignment.description,
            dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
            maxPoints: maxPoints ? Number(maxPoints) : assignment.maxPoints,
            status: status ? status as any : assignment.status,
        },
        include: { _count: { select: { Submission: true } } },
    })
})
