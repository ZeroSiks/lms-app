import { prisma } from '@@/lib/prisma'
import { useAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = useAuth(event)

  let streak = await prisma.userStreak.findUnique({
    where: { userId: payload.userId },
  })

  if (!streak) {
    streak = await prisma.userStreak.create({
      data: {
        userId: payload.userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
      },
    })
  }

  return { streak }
})
