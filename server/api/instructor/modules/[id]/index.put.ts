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
    const { title, description } = body ?? {}
    if (!title?.trim()) throw createError({ statusCode: 400, message: 'Module title is required.' })

    return prisma.module.update({
        where: { id: moduleId },
        data: { title: title.trim(), description: description?.trim() || null },
    })
})
