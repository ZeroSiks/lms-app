import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

const schema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
    maxPoints: z.number().int().min(1).max(1000).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
})

const VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['PUBLISHED'],
    PUBLISHED: ['CLOSED'],
    CLOSED: [],
}

export default defineEventHandler(async (event) => {
    const user = requireRole(event, 'INSTRUCTOR', 'ADMIN')
    const id = parseInt(getRouterParam(event, 'id') ?? '')
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid assignment id' })

    const body = await readBody(event)
    const result = schema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Invalid input' })
    }

    const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: { Module: { include: { Course: { select: { instructorId: true } } } } },
    })
    if (!assignment) throw createError({ statusCode: 404, message: 'Assignment not found' })
    if (user.role === 'INSTRUCTOR' && assignment.Module.Course.instructorId !== user.userId) {
        throw createError({ statusCode: 403, message: 'Not your course' })
    }

    const { status, dueDate, ...rest } = result.data

    if (status && status !== assignment.status) {
        const allowed = VALID_TRANSITIONS[assignment.status] ?? []
        if (!allowed.includes(status)) {
            throw createError({ statusCode: 400, message: `Cannot transition from ${assignment.status} to ${status}` })
        }
    }

    const updateData: Record<string, unknown> = { ...rest }
    if (status) updateData.status = status
    if (dueDate) updateData.dueDate = new Date(dueDate)

    const updated = await prisma.assignment.update({ where: { id }, data: updateData })
    return updated
})
