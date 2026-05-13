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
    if (isNaN(courseId)) throw createError({ statusCode: 400, message: 'Invalid course ID' })

    const role = payload.role as string

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            Module: {
                orderBy: { order: 'asc' },
                include: {
                    Lesson: {
                        orderBy: { order: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            duration: true,
                            order: true,
                            LessonProgress: {
                                where: { userId: payload.userId },
                                select: { completed: true, completedAt: true },
                            },
                        },
                    },
                    Assignment: {
                        where: role === 'STUDENT' ? { status: 'PUBLISHED' as any } : {},
                        orderBy: { dueDate: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            dueDate: true,
                            maxPoints: true,
                            status: true,
                            Submission: {
                                where: { userId: payload.userId },
                                select: { id: true, status: true, grade: true, feedback: true, content: true, fileUrl: true, submittedAt: true },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!course) throw createError({ statusCode: 404, message: 'Course not found' })
    if (!course.isPublished && role === 'STUDENT') throw createError({ statusCode: 404, message: 'Course not found' })

    let enrollment = null
    if (role === 'STUDENT') {
        enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: payload.userId, courseId } },
            select: { id: true, status: true },
        })
    }

    const isInstructor = role === 'INSTRUCTOR' && course.instructorId === payload.userId
    const isAdmin = role === 'ADMIN'
    const isEnrolled = (enrollment?.status as string) === 'ACTIVE'
    const hasAccess = isAdmin || isInstructor || isEnrolled

    return { ...course, enrollment, hasAccess }
})
