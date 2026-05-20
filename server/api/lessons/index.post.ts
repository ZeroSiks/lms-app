import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  content: z.string(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  order: z.number(),
  moduleId: z.number(),
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

  const module = await prisma.module.findUnique({ where: { id: validated.moduleId }, include: { Course: true } })
  if (!module) throw createError({ statusCode: 404, message: 'Module not found' })
  if (payload.role !== 'ADMIN' && module.Course.instructorId !== payload.userId) {
    throw createError({ statusCode: 403, message: 'Not your course' })
  }

  const lesson = await prisma.lesson.create({
    data: validated,
  })

  return lesson
})