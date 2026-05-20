import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

const schema = z.object({
    moduleId: z.number().int().positive(),
    title: z.string().min(3).max(200),
    description: z.string().min(1),
    dueDate: z.string().datetime(),
    maxPoints: z.number().int().min(1).max(1000),
})

export default defineEventHandler(async (event) => {
    const user = requireRole(event, 'INSTRUCTOR', 'ADMIN')
    const body = await readBody(event)

    const result = schema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message ?? 'Invalid input' })
    }

    const { moduleId, title, description, dueDate, maxPoints } = result.data

    const due = new Date(dueDate)
    if (due <= new Date()) {
        throw createError({ statusCode: 400, message: 'Due date must be in the future' })
    }

    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { Course: { select: { id: true, instructorId: true } } },
    })
    if (!module) throw createError({ statusCode: 404, message: 'Module not found' })
    if (user.role === 'INSTRUCTOR' && module.Course.instructorId !== user.userId) {
        throw createError({ statusCode: 403, message: 'Not your course' })
    }

    const assignment = await prisma.assignment.create({
        data: { moduleId, title, description, dueDate: due, maxPoints },
    })

    return assignment
})
