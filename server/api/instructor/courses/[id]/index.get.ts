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

    if ((payload.role as string) !== 'INSTRUCTOR') {
        throw createError({ statusCode: 403, message: 'Instructors only.' })
    }

    const courseId = Number(getRouterParam(event, 'id'))
    if (isNaN(courseId)) throw createError({ statusCode: 400, message: 'Invalid course ID' })

    const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId: payload.userId },
        include: {
            _count: { select: { Enrollment: { where: { status: 'ACTIVE' as any } } } },
            Module: {
                orderBy: { order: 'asc' },
                include: {
                    Lesson: { orderBy: { order: 'asc' } },
                    Assignment: {
                        orderBy: { dueDate: 'asc' },
                        include: {
                            _count: { select: { Submission: true } },
                        },
                    },
                },
            },
        },
    })

    if (!course) throw createError({ statusCode: 404, message: 'Course not found.' })
    return course
})
