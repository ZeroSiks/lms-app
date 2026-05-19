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

    await prisma.module.delete({ where: { id: moduleId } })
    return { ok: true }
})
