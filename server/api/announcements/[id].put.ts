import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'
import { sanitizeString } from '@@/server/utils/sanitize'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = Number(event.context.params?.id)

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Announcement not found' })
  if (existing.authorId !== user.userId && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Not authorized' })
  }

  const body = await readBody(event)
  const schema = z.object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(1).max(5000).optional(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  return prisma.announcement.update({
    where: { id },
    data: {
      ...(parsed.data.title && { title: sanitizeString(parsed.data.title) }),
      ...(parsed.data.content && { content: sanitizeString(parsed.data.content) }),
    },
  })
})
