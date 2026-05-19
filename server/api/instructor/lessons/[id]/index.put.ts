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

    const body = await readBody(event)
    const { title, content, videoUrl, duration } = body ?? {}
    if (!title?.trim()) throw createError({ statusCode: 400, message: 'Lesson title is required.' })
    if (!content?.trim()) throw createError({ statusCode: 400, message: 'Lesson content is required.' })

    return prisma.lesson.update({
        where: { id: lessonId },
        data: {
            title: title.trim(),
            content: content.trim(),
            videoUrl: videoUrl?.trim() || null,
            duration: duration ? Number(duration) : null,
        },
    })
})
