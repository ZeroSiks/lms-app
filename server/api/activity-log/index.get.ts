import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)

  const logs = await prisma.activityLog.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      Course: { select: { id: true, title: true } },
      Module: { select: { id: true, title: true } },
    },
  })

  return { logs }
})
