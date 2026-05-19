import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      _count: { select: { Enrollment: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { students }
})
