import { z } from 'zod'
import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid user ID'),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) {
    throw createError({ statusCode: 400, message: params.error.issues[0]?.message ?? 'Invalid input' })
  }

  const { id } = params.data

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  await prisma.user.delete({ where: { id } })

  return { message: 'User rejected and removed successfully' }
})
