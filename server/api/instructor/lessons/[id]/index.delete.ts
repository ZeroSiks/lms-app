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

    const lessonId = Number(getRouterParam(event, 'id'))
    if (isNaN(lessonId)) throw createError({ statusCode: 400, message: 'Invalid lesson ID' })

    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, Module: { Course: { instructorId: payload.userId } } },
    })
    if (!lesson) throw createError({ statusCode: 404, message: 'Lesson not found.' })

    await prisma.lesson.delete({ where: { id: lessonId } })
    return { ok: true }
})
