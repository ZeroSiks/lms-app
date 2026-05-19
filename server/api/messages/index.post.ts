import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { createNotification } from '@@/server/utils/notify'

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
    const { receiverId, content } = body ?? {}

    if (!receiverId || isNaN(Number(receiverId))) throw createError({ statusCode: 400, message: 'Receiver ID is required.' })
    if (!content?.trim()) throw createError({ statusCode: 400, message: 'Message content cannot be empty.' })
    if (Number(receiverId) === payload.userId) throw createError({ statusCode: 400, message: 'Cannot send a message to yourself.' })

    const receiver = await prisma.user.findUnique({ where: { id: Number(receiverId) }, select: { id: true, firstName: true, lastName: true } })
    if (!receiver) throw createError({ statusCode: 404, message: 'Recipient not found.' })

    const sender = await prisma.user.findUnique({ where: { id: payload.userId }, select: { firstName: true, lastName: true } })

    const message = await prisma.message.create({
        data: { senderId: payload.userId, receiverId: Number(receiverId), content: stripHtml(content.trim()).slice(0, 5000) },
        select: { id: true, content: true, senderId: true, receiverId: true, createdAt: true, read: true },
    })

    await createNotification({
        userId: Number(receiverId),
        title: 'New message',
        message: `${sender?.firstName} ${sender?.lastName} sent you a message.`,
        type: 'message',
        link: `/dashboard/messages`,
    })

    return message
})
