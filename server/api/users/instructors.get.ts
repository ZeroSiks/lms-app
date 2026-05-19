import { prisma } from '@@/lib/prisma'
import { useAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  useAuth(event, 'ADMIN')

  const instructors = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bio: true,
      isApproved: true,
      createdAt: true,
      _count: { select: { Course: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { instructors }
})
