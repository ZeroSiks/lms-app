import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const instructors = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bio: true,
      status: true,
      createdAt: true,
      _count: { select: { Course: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { instructors }
})
