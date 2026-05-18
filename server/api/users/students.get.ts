import { prisma } from '@@/lib/prisma'
import { useAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  useAuth(event, 'ADMIN')

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isApproved: true,
      createdAt: true,
      _count: { select: { Enrollment: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { students }
})
