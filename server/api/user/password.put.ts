import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { verifyPassword, hashPassword } from '@@/server/utils/password'

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
    const { currentPassword, newPassword } = body ?? {}

    if (!currentPassword) throw createError({ statusCode: 400, message: 'Current password is required.' })
    if (!newPassword || newPassword.length < 8) throw createError({ statusCode: 400, message: 'New password must be at least 8 characters.' })

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { passwordHash: true },
    })
    if (!user) throw createError({ statusCode: 404, message: 'User not found' })

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) throw createError({ statusCode: 400, message: 'Current password is incorrect.' })

    const newHash = await hashPassword(newPassword)
    await prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash: newHash },
    })

    return { ok: true }
})
