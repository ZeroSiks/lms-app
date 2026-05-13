import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { createNotification } from '@@/server/utils/notify'

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

    const submissionId = Number(getRouterParam(event, 'id'))
    if (isNaN(submissionId)) throw createError({ statusCode: 400, message: 'Invalid submission ID' })

    const submission = await prisma.submission.findFirst({
        where: { id: submissionId, Assignment: { Module: { Course: { instructorId: payload.userId } } } },
        include: {
            Assignment: { include: { Module: { include: { Course: { select: { id: true, title: true } } } } } },
        },
    })
    if (!submission) throw createError({ statusCode: 404, message: 'Submission not found.' })

    const body = await readBody(event)
    const { grade, feedback } = body ?? {}
    if (grade === undefined || grade === null || isNaN(Number(grade))) {
        throw createError({ statusCode: 400, message: 'Grade is required.' })
    }

    const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
            grade: Number(grade),
            feedback: feedback?.trim() || null,
            status: 'GRADED' as any,
        },
        include: { User: { select: { firstName: true, lastName: true, email: true } } },
    })

    const course = submission.Assignment.Module.Course
    await createNotification({
        userId: submission.userId,
        title: 'Assignment graded',
        message: `Your submission for "${submission.Assignment.title}" has been graded: ${grade}/${submission.Assignment.maxPoints} pts.`,
        type: 'grade',
        link: `/courses/${course.id}/assignments/${submission.assignmentId}`,
    })

    return updated
})
