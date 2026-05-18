import { z } from 'zod'
import { prisma } from '@@/lib/prisma'
import { useAuth } from '@@/server/utils/auth'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid user ID'),
})

export default defineEventHandler(async (event) => {
  const admin = useAuth(event, 'ADMIN')

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) {
    throw createError({ statusCode: 400, message: params.error.errors[0]?.message ?? 'Invalid input' })
  }

  const { id } = params.data

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isApproved: true },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isApproved: true },
  })

  await prisma.notification.create({
    data: {
      userId: id,
      title: 'Your account has been approved. Welcome aboard!',
    },
  })

  await prisma.activityLog.create({
    data: {
      userId: admin.userId,
      type: 'ACCOUNT_APPROVED',
      description: `Approved account for ${user.email}`,
    },
  })

  return { message: 'User approved successfully', user: updated }
})
