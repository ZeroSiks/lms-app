import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)

  await prisma.notification.updateMany({
    where: { userId: payload.userId, read: false },
    data: { read: true },
  })

  return { message: 'All notifications marked as read' }
})
