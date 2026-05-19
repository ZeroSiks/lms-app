import { z } from 'zod'
import { prisma } from '@@/lib/prisma'
import { hashPassword } from '@@/server/utils/password'

const schema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export default defineEventHandler(async (event) => {
  rateLimit(event, 3, 60_000)
  const body = await readBody(event)

  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message ?? 'Invalid input',
    })
  }

  const { token, newPassword } = result.data

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  })

  if (!user) {
    throw createError({ statusCode: 400, message: 'Invalid or expired reset token.' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  return { message: 'Password has been reset successfully. You may now log in.' }
})
