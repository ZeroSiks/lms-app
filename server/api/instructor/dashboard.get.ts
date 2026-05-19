import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {

    // ====================
    //    Authentication
    // ====================

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

    const instructorId = payload.userId

    // ====================
    //      Data Fetch
    // ====================

    const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
            _count: { select: { Enrollment: { where: { status: 'ACTIVE' as any } } } },
            Module: {
                include: {
                    Assignment: {
                        where: { status: 'PUBLISHED' as any },
                        include: {
                            _count: { select: { Submission: { where: { status: 'SUBMITTED' as any } } } },
                        },
                    },
                    _count: { select: { Lesson: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // ====================
    //    Build Response
    // ====================

    const totalStudents = courses.reduce((sum, c) => sum + c._count.Enrollment, 0)
    const pendingReviews = courses.reduce((sum, c) =>
        sum + c.Module.reduce((ms, m) =>
            ms + m.Assignment.reduce((as, a) => as + a._count.Submission, 0), 0), 0)

    const courseList = courses.map(c => ({
        id: c.id,
        title: c.title,
        code: c.code,
        isPublished: c.isPublished,
        students: c._count.Enrollment,
        totalLessons: c.Module.reduce((sum, m) => sum + m._count.Lesson, 0),
        pendingSubmissions: c.Module.reduce((sum, m) =>
            sum + m.Assignment.reduce((as, a) => as + a._count.Submission, 0), 0),
    }))

    return {
        totalStudents,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        pendingReviews,
        courses: courseList,
    }
})
