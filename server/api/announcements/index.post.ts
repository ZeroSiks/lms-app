import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'
import { sanitizeString } from '@@/server/utils/sanitize'
import { createNotification } from '@@/server/utils/notify'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
    throw createError({ statusCode: 403, message: 'Only admins and instructors can post announcements' })
  }

  const body = await readBody(event)
  const schema = z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(1).max(5000),
    courseId: z.number().int().positive(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  const { title, content, courseId } = parsed.data

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) throw createError({ statusCode: 404, message: 'Course not found' })

  if (user.role === 'INSTRUCTOR' && course.instructorId !== user.userId) {
    throw createError({ statusCode: 403, message: 'You can only announce to your own courses' })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: sanitizeString(title),
      content: sanitizeString(content),
      courseId,
      authorId: user.userId,
    },
    include: {
      User: { select: { id: true, firstName: true, lastName: true } },
      Course: { select: { id: true, title: true, code: true } },
    },
  })

  const enrolled = await prisma.enrollment.findMany({
    where: { courseId, status: 'ACTIVE' },
    select: { userId: true },
  })

  for (const e of enrolled) {
    if (e.userId !== user.userId) {
      await createNotification({
        userId: e.userId,
        title: `New announcement in ${course.title}`,
        message: title,
        type: 'announcement',
        link: `/courses/${courseId}`,
      })
    }
  }

  return announcement
})
