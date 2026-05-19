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

    if ((payload.role as string) !== 'INSTRUCTOR') throw createError({ statusCode: 403, message: 'Instructors only.' })

    const moduleId = Number(getRouterParam(event, 'id'))
    if (isNaN(moduleId)) throw createError({ statusCode: 400, message: 'Invalid module ID' })

    const mod = await prisma.module.findFirst({
        where: { id: moduleId, Course: { instructorId: payload.userId } },
    })
    if (!mod) throw createError({ statusCode: 404, message: 'Module not found.' })

    const body = await readBody(event)
    const { title, description, dueDate, maxPoints, publish } = body ?? {}
    if (!title?.trim()) throw createError({ statusCode: 400, message: 'Assignment title is required.' })
    if (!description?.trim()) throw createError({ statusCode: 400, message: 'Assignment description is required.' })
    if (!dueDate) throw createError({ statusCode: 400, message: 'Due date is required.' })
    if (!maxPoints || isNaN(Number(maxPoints))) throw createError({ statusCode: 400, message: 'Max points is required.' })

    return prisma.assignment.create({
        data: {
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate),
            maxPoints: Number(maxPoints),
            status: publish ? 'PUBLISHED' as any : 'DRAFT' as any,
            moduleId,
        },
        include: { _count: { select: { Submission: true } } },
    })
})
