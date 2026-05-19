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

    const userId = payload.userId

    return prisma.assignment.findMany({
        where: {
            status: 'PUBLISHED' as any,
            Module: {
                Course: {
                    Enrollment: { some: { userId, status: 'ACTIVE' as any } },
                },
            },
        },
        orderBy: { dueDate: 'asc' },
        select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            maxPoints: true,
            status: true,
            Module: {
                select: {
                    id: true,
                    title: true,
                    courseId: true,
                    Course: { select: { id: true, title: true, code: true } },
                },
            },
            Submission: {
                where: { userId },
                select: { id: true, status: true, grade: true, feedback: true, submittedAt: true, content: true },
            },
        },
    })
})
