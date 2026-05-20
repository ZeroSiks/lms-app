import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

const schema = z.object({
    assignmentId: z.number().int().positive(),
    content: z.string().max(10000).optional(),
    fileUrl: z.string().trim().url().optional(),
}).refine((d) => (d.content?.trim() || d.fileUrl?.trim()), {
    message: 'At least one of content or fileUrl must be provided',
})

export default defineEventHandler(async (event) => {
    const user = requireRole(event, 'STUDENT')
    const body = await readBody(event)

    const result = schema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message ?? 'Invalid input' })
    }

    const { assignmentId, content, fileUrl } = result.data

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { Module: { include: { Course: { select: { id: true } } } } },
    })
    if (!assignment) throw createError({ statusCode: 404, message: 'Assignment not found' })
    if (assignment.status !== 'PUBLISHED') {
        throw createError({ statusCode: 403, message: 'Assignment is not accepting submissions' })
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.userId, courseId: assignment.Module.Course.id } },
    })
    if (!enrollment) throw createError({ statusCode: 403, message: 'Not enrolled in this course' })

    const existing = await prisma.submission.findUnique({
        where: { userId_assignmentId: { userId: user.userId, assignmentId } },
    })
    if (existing?.status === 'GRADED') {
        throw createError({ statusCode: 409, message: 'Submission already graded and cannot be replaced' })
    }
    if (existing) {
        throw createError({ statusCode: 409, message: 'Submission already exists — use PATCH to update it' })
    }

    const isLate = new Date() > assignment.dueDate
    const submission = await prisma.submission.create({
        data: {
            userId: user.userId,
            assignmentId,
            content: content ?? null,
            fileUrl: fileUrl ?? null,
            status: isLate ? 'LATE' : 'SUBMITTED',
        },
    })

    return submission
})
