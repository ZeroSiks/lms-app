import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number(),
  courseId: z.number(),
})

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'lms_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' })
  }

  if (payload.role !== 'ADMIN' && payload.role !== 'INSTRUCTOR') {
    throw createError({ statusCode: 403, message: 'Insufficient permissions' })
  }

  const body = await readBody(event)
  const validated = schema.parse(body)

  const course = await prisma.course.findUnique({ where: { id: validated.courseId } })
  if (!course) throw createError({ statusCode: 404, message: 'Course not found' })
  if (payload.role !== 'ADMIN' && course.instructorId !== payload.userId) {
    throw createError({ statusCode: 403, message: 'Not your course' })
  }

  const module = await prisma.module.create({
    data: validated,
    include: { Lesson: true }
  })

  return module
})