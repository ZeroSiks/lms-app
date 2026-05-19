import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'lms_token')
    if (!token) throw createError({ statusCode: 401, message: 'You must be logged in to enroll.' })

    let payload
    try {
        payload = verifyAccessToken(token)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid or expired session. Please log in again.' })
    }

    if (payload.role !== 'STUDENT') {
        throw createError({ statusCode: 403, message: 'Only students can enroll in courses.' })
    }

    const courseId = Number(getRouterParam(event, 'id'))
    if (isNaN(courseId)) throw createError({ statusCode: 400, message: 'Invalid course ID.' })

    const course = await prisma.course.findUnique({ where: { id: courseId, isPublished: true } })
    if (!course) throw createError({ statusCode: 404, message: 'Course not found.' })

    const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payload.userId, courseId } },
    })

    if (existing) {
        const status = existing.status as string
        if (status === 'PENDING') {
            throw createError({ statusCode: 409, message: 'Your enrollment request is already pending approval.' })
        }
        if (status === 'ACTIVE') {
            throw createError({ statusCode: 409, message: 'You are already enrolled in this course.' })
        }
        if (status === 'REJECTED') {
            await prisma.enrollment.update({
                where: { id: existing.id },
                data: { status: 'PENDING' as any, enrolledAt: new Date() },
            })
            return { ok: true, id: existing.id, status: 'PENDING', reapplied: true }
        }
    }

    await prisma.enrollment.create({
        data: { userId: payload.userId, courseId, status: 'PENDING' as any },
    })

    const created = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payload.userId, courseId } },
    })

    return { ok: true, id: created!.id, status: 'PENDING' }
})
