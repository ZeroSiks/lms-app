import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const user = requireAuth(event)

    if (user.role === 'STUDENT') {
        const submissions = await prisma.submission.findMany({
            where: { userId: user.userId },
            include: {
                Assignment: {
                    include: {
                        Module: { include: { Course: { select: { id: true, title: true, code: true } } } },
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        })

        return submissions.map((s) => ({
            id: s.id,
            content: s.content,
            fileUrl: s.fileUrl,
            submittedAt: s.submittedAt,
            status: s.status,
            grade: s.grade,
            feedback: s.feedback,
            assignmentId: s.assignmentId,
            assignmentTitle: s.Assignment.title,
            dueDate: s.Assignment.dueDate,
            maxPoints: s.Assignment.maxPoints,
            courseId: s.Assignment.Module.Course.id,
            courseTitle: s.Assignment.Module.Course.title,
            courseCode: s.Assignment.Module.Course.code,
        }))
    }

    // Instructor: pending submissions for their courses
    if (user.role === 'INSTRUCTOR') {
        const myCourses = await prisma.course.findMany({
            where: { instructorId: user.userId },
            select: { id: true },
        })
        const courseIds = myCourses.map((c) => c.id)

        const submissions = await prisma.submission.findMany({
            where: {
                status: { in: ['SUBMITTED', 'LATE', 'GRADED'] },
                Assignment: { Module: { courseId: { in: courseIds } } },
            },
            include: {
                User: { select: { id: true, firstName: true, lastName: true, email: true } },
                Assignment: {
                    include: { Module: { include: { Course: { select: { id: true, title: true, code: true } } } } },
                },
            },
            orderBy: { submittedAt: 'asc' },
        })

        return submissions.map((s) => ({
            id: s.id,
            submittedAt: s.submittedAt,
            status: s.status,
            grade: s.grade,
            assignmentId: s.assignmentId,
            assignmentTitle: s.Assignment.title,
            maxPoints: s.Assignment.maxPoints,
            courseId: s.Assignment.Module.Course.id,
            courseTitle: s.Assignment.Module.Course.title,
            student: s.User,
        }))
    }

    // Admin: all submissions
    const submissions = await prisma.submission.findMany({
        include: {
            User: { select: { id: true, firstName: true, lastName: true } },
            Assignment: { select: { id: true, title: true, maxPoints: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 200,
    })

    return submissions
})
