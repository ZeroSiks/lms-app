import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const user = requireAuth(event)
    const id = parseInt(getRouterParam(event, 'id') ?? '')
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid assignment id' })

    const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
            Module: {
                include: { Course: { select: { id: true, title: true, code: true, instructorId: true } } },
            },
            _count: { select: { Submission: true } },
        },
    })
    if (!assignment) throw createError({ statusCode: 404, message: 'Assignment not found' })

    const course = assignment.Module.Course

    if (user.role === 'STUDENT') {
        if (assignment.status !== 'PUBLISHED') throw createError({ statusCode: 403, message: 'Assignment not available' })
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: user.userId, courseId: course.id } },
        })
        if (!enrollment) throw createError({ statusCode: 403, message: 'Not enrolled in this course' })
    } else if (user.role === 'INSTRUCTOR') {
        if (course.instructorId !== user.userId) throw createError({ statusCode: 403, message: 'Not your course' })
    }

    let mySubmission = null
    if (user.role === 'STUDENT') {
        mySubmission = await prisma.submission.findUnique({
            where: { userId_assignmentId: { userId: user.userId, assignmentId: id } },
            select: { id: true, content: true, fileUrl: true, submittedAt: true, status: true, grade: true, feedback: true },
        })
    }

    return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
        status: assignment.status,
        moduleId: assignment.moduleId,
        moduleName: assignment.Module.title,
        courseId: course.id,
        courseTitle: course.title,
        courseCode: course.code,
        submissionCount: assignment._count.Submission,
        mySubmission,
    }
})
