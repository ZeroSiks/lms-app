import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

const schema = z.object({
    grade: z.number().int().min(0),
    feedback: z.string().max(2000).optional(),
})

export default defineEventHandler(async (event) => {
    const user = requireRole(event, 'INSTRUCTOR', 'ADMIN')
    const id = parseInt(getRouterParam(event, 'id') ?? '')
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid submission id' })

    const body = await readBody(event)
    const result = schema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message ?? 'Invalid input' })
    }

    const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
            Assignment: {
                include: { Module: { include: { Course: { select: { instructorId: true, id: true } } } } },
            },
        },
    })
    if (!submission) throw createError({ statusCode: 404, message: 'Submission not found' })
    if (submission.status === 'GRADED') {
        throw createError({ statusCode: 409, message: 'Submission is already graded' })
    }

    const course = submission.Assignment.Module.Course
    if (user.role === 'INSTRUCTOR' && course.instructorId !== user.userId) {
        throw createError({ statusCode: 403, message: 'Not your course' })
    }

    const { grade, feedback } = result.data
    if (grade > submission.Assignment.maxPoints) {
        throw createError({ statusCode: 400, message: 'Grade cannot exceed maxPoints' })
    }

    const updated = await prisma.submission.update({
        where: { id },
        data: { grade, feedback: feedback ?? null, status: 'GRADED' },
    })

    return updated
})
