import { Prisma } from '@prisma/client'
import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
    const user = getUser(event)
    const query = getQuery(event)
    const courseId = query.courseId ? parseInt(query.courseId as string) : undefined
    const take = Math.min(parseInt((query.take as string) ?? '100'), 200)
    const cursor = query.cursor ? parseInt(query.cursor as string) : undefined

    const where: Prisma.AssignmentWhereInput = {}

    if (user.role === 'STUDENT') {
        where.status = 'PUBLISHED'
        if (courseId) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.userId, courseId } },
            })
            if (!enrollment) throw createError({ statusCode: 403, message: 'Not enrolled in this course' })
            where.Module = { courseId }
        } else {
            const enrollments = await prisma.enrollment.findMany({
                where: { userId: user.userId, status: 'ACTIVE' },
                select: { courseId: true },
            })
            where.Module = { courseId: { in: enrollments.map((e) => e.courseId) } }
        }
    } else if (user.role === 'INSTRUCTOR') {
        if (courseId) {
            const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.userId } })
            if (!course) throw createError({ statusCode: 403, message: 'Not your course' })
            where.Module = { courseId }
        } else {
            const myCourses = await prisma.course.findMany({
                where: { instructorId: user.userId },
                select: { id: true },
            })
            where.Module = { courseId: { in: myCourses.map((c) => c.id) } }
        }
    } else if (user.role === 'ADMIN') {
        if (courseId) where.Module = { courseId }
    }

    const assignments = await prisma.assignment.findMany({
        where,
        include: {
            Module: {
                include: { Course: { select: { id: true, title: true, code: true } } },
            },
            _count: { select: { Submission: true } },
        },
        orderBy: { dueDate: 'asc' },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    // For students, attach their own submission status if any
    let mySubmissions: Record<number, { status: string; grade: number | null }> = {}
    if (user.role === 'STUDENT' && assignments.length) {
        const subs = await prisma.submission.findMany({
            where: { userId: user.userId, assignmentId: { in: assignments.map((a) => a.id) } },
            select: { assignmentId: true, status: true, grade: true },
        })
        mySubmissions = Object.fromEntries(subs.map((s) => [s.assignmentId, { status: s.status, grade: s.grade }]))
    }

    return assignments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxPoints: a.maxPoints,
        status: a.status,
        moduleId: a.moduleId,
        moduleName: a.Module.title,
        courseId: a.Module.Course.id,
        courseTitle: a.Module.Course.title,
        courseCode: a.Module.Course.code,
        submissionCount: a._count.Submission,
        mySubmission: mySubmissions[a.id] ?? null,
    }))
})
