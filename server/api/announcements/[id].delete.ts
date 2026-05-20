import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = Number(event.context.params?.id)

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Announcement not found' })
  if (existing.authorId !== user.userId && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Not authorized' })
  }

  await prisma.announcement.delete({ where: { id } })
  return { ok: true }
})
