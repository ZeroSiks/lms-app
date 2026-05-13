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

    const body = await readBody(event)
    const { firstName, lastName, bio } = body ?? {}

    if (!firstName?.trim()) throw createError({ statusCode: 400, message: 'First name is required.' })
    if (!lastName?.trim()) throw createError({ statusCode: 400, message: 'Last name is required.' })

    const updated = await prisma.user.update({
        where: { id: payload.userId },
        data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            bio: bio?.trim() ?? null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, bio: true },
    })

    return updated
})
