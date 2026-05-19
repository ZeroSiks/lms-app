import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const user = requireRole(event, 'INSTRUCTOR', 'ADMIN')
    const id = parseInt(getRouterParam(event, 'id') ?? '')
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid assignment id' })

    const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: { Module: { include: { Course: { select: { instructorId: true } } } } },
    })
    if (!assignment) throw createError({ statusCode: 404, message: 'Assignment not found' })
    if (user.role === 'INSTRUCTOR' && assignment.Module.Course.instructorId !== user.userId) {
        throw createError({ statusCode: 403, message: 'Not your course' })
    }

    const submissions = await prisma.submission.findMany({
        where: { assignmentId: id },
        include: {
            User: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { submittedAt: 'asc' },
    })

    return submissions.map((s) => ({
        id: s.id,
        submittedAt: s.submittedAt,
        status: s.status,
        grade: s.grade,
        feedback: s.feedback,
        content: s.content,
        fileUrl: s.fileUrl,
        student: s.User,
    }))
})
