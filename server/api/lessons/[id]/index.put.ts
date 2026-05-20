import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  order: z.number().optional(),
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

  const id = parseInt(getRouterParam(event, 'id') as string)
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid lesson ID' })

  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { Module: { include: { Course: true } } } })
  if (!lesson) throw createError({ statusCode: 404, message: 'Lesson not found' })
  if (payload.role !== 'ADMIN' && lesson.Module.Course.instructorId !== payload.userId) {
    throw createError({ statusCode: 403, message: 'Not your course' })
  }

  const body = await readBody(event)
  const validated = schema.parse(body)

  const updated = await prisma.lesson.update({
    where: { id },
    data: validated,
  })

  return updated
})