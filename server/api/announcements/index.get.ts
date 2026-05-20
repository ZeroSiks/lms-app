import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  const courseId = query.courseId ? Number(query.courseId) : undefined

  return prisma.announcement.findMany({
    where: courseId ? { courseId } : undefined,
    include: {
      User: { select: { id: true, firstName: true, lastName: true, role: true } },
      Course: { select: { id: true, title: true, code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
})
