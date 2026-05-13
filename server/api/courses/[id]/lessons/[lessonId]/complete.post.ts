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

    if ((payload.role as string) !== 'STUDENT') {
        throw createError({ statusCode: 403, message: 'Only students can mark lessons complete.' })
    }

    const courseId = Number(getRouterParam(event, 'id'))
    const lessonId = Number(getRouterParam(event, 'lessonId'))
    if (isNaN(courseId) || isNaN(lessonId)) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payload.userId, courseId } },
    })
    if (!enrollment || (enrollment.status as string) !== 'ACTIVE') {
        throw createError({ statusCode: 403, message: 'Not enrolled in this course.' })
    }

    const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, Module: { courseId } } })
    if (!lesson) throw createError({ statusCode: 404, message: 'Lesson not found.' })

    const progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: payload.userId, lessonId } },
        create: { userId: payload.userId, lessonId, completed: true, completedAt: new Date() },
        update: { completed: true, completedAt: new Date() },
    })

    return progress
})
