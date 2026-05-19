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

    const userId = payload.userId

    const messages = await prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { createdAt: 'desc' },
        include: {
            User_Message_senderIdToUser: { select: { id: true, firstName: true, lastName: true, role: true } },
            User_Message_receiverIdToUser: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
    })

    const seen = new Map<number, { id: number; firstName: string; lastName: string; role: string; lastMessage: string; lastTime: string }>()

    for (const msg of messages) {
        const other = msg.senderId === userId
            ? msg.User_Message_receiverIdToUser
            : msg.User_Message_senderIdToUser

        if (!seen.has(other.id)) {
            seen.set(other.id, {
                id: other.id,
                firstName: other.firstName,
                lastName: other.lastName,
                role: other.role as string,
                lastMessage: msg.content,
                lastTime: msg.createdAt.toISOString(),
            })
        }
    }

    return Array.from(seen.values())
})
