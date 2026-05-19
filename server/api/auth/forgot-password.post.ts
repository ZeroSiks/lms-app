import { z } from 'zod'
import { prisma } from '@@/lib/prisma'
import { randomBytes } from 'node:crypto'

const schema = z.object({
  email: z.string().email('Invalid email address'),
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

  const { email } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { message: 'If an account with that email exists, a reset link has been sent.' }
  }

  if ((user.status as string) !== 'ACTIVE') {
    return { message: 'If an account with that email exists, a reset link has been sent.' }
  }

  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  })

  return {
    message: 'If an account with that email exists, a reset link has been sent.',
    resetToken: token,
  }
})
