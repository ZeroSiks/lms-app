import { prisma } from '@@/lib/prisma'
import { useAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = useAuth(event)

  await prisma.notification.updateMany({
    where: { userId: payload.userId, read: false },
    data: { read: true },
  })

  return { message: 'All notifications marked as read' }
})
