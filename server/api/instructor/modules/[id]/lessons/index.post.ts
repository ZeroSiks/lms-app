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
    const { title, content, videoUrl, duration } = body ?? {}
    if (!title?.trim()) throw createError({ statusCode: 400, message: 'Lesson title is required.' })
    if (!content?.trim()) throw createError({ statusCode: 400, message: 'Lesson content is required.' })

    const count = await prisma.lesson.count({ where: { moduleId } })

    return prisma.lesson.create({
        data: {
            title: title.trim(),
            content: content.trim(),
            videoUrl: videoUrl?.trim() || null,
            duration: duration ? Number(duration) : null,
            order: count + 1,
            moduleId,
        },
    })
})
