import { z } from 'zod'
import { prisma } from '@@/lib/prisma'
import { useAuth } from '@@/server/utils/auth'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid user ID'),
})

export default defineEventHandler(async (event) => {
  useAuth(event, 'ADMIN')

  const params = paramsSchema.safeParse({ id: getRouterParam(event, 'id') })
  if (!params.success) {
    throw createError({ statusCode: 400, message: params.error.errors[0]?.message ?? 'Invalid input' })
  }

  const { id } = params.data

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  await prisma.user.delete({ where: { id } })

  return { message: 'User rejected and removed successfully' }
})
