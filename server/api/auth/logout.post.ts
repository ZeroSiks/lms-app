import { prisma } from '@@/lib/prisma'
import { verifyRefreshToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'refresh_token')
    if (token) {
        try {
            const payload = verifyRefreshToken(token)
            await prisma.user.update({
                where: { id: payload.userId },
                data: { refreshToken: null },
            }).catch(() => {})
        } catch { /* token already invalid — still clear cookies */ }
    }
    deleteCookie(event, 'lms_token', { path: '/' })
    deleteCookie(event, 'refresh_token', { httpOnly: true, path: '/' })
    return { ok: true }
})
