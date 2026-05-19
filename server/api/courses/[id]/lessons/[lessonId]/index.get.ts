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

    const courseId = Number(getRouterParam(event, 'id'))
    const lessonId = Number(getRouterParam(event, 'lessonId'))
    if (isNaN(courseId) || isNaN(lessonId)) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const role = payload.role as string

    if (role === 'STUDENT') {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: payload.userId, courseId } },
        })
        if (!enrollment || (enrollment.status as string) !== 'ACTIVE') {
            throw createError({ statusCode: 403, message: 'You must be enrolled in this course to access lessons.' })
        }
    } else if (role === 'INSTRUCTOR') {
        const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: payload.userId } })
        if (!course) throw createError({ statusCode: 403, message: 'Access denied.' })
    }

    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, Module: { courseId } },
        include: {
            Module: { select: { id: true, title: true, courseId: true, order: true } },
            LessonProgress: {
                where: { userId: payload.userId },
                select: { completed: true, completedAt: true },
            },
            Resource: { select: { id: true, title: true, type: true, url: true } },
        },
    })
    if (!lesson) throw createError({ statusCode: 404, message: 'Lesson not found' })

    const siblings = await prisma.lesson.findMany({
        where: { moduleId: lesson.moduleId },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, order: true },
    })

    const idx = siblings.findIndex(l => l.id === lessonId)
    const prev = idx > 0 ? siblings[idx - 1] : null
    const next = idx < siblings.length - 1 ? siblings[idx + 1] : null

    return { ...lesson, courseId, prev, next }
})
