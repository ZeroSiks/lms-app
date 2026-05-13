import { prisma } from '@@/lib/prisma'
import { verifyRefreshToken, generateAccessToken } from '@@/server/utils/jwt'
import { verifyPassword } from '@@/server/utils/password'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'refresh_token')
    if (!token) throw createError({ statusCode: 401, message: 'No refresh token' })

    let payload
    try {
        payload = verifyRefreshToken(token)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid or expired refresh token' })
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, status: true, refreshToken: true },
    })

    if (!user || !user.refreshToken) throw createError({ statusCode: 401, message: 'Session expired' })

    const tokenValid = await verifyPassword(token, user.refreshToken)
    if (!tokenValid) throw createError({ statusCode: 401, message: 'Invalid refresh token' })

    if ((user.status as string) === 'REJECTED' || (user.status as string) === 'PENDING') {
        throw createError({ statusCode: 403, message: 'Account not active' })
    }

    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role as any })

    setCookie(event, 'lms_token', newAccessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15,
        path: '/',
    })

    return { accessToken: newAccessToken }
})
