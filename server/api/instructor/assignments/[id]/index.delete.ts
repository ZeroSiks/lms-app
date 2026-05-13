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

    await prisma.assignment.delete({ where: { id: assignmentId } })
    return { ok: true }
})
