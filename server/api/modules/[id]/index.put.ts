import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
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
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid module ID' })

  const mod = await prisma.module.findUnique({ where: { id }, include: { Course: true } })
  if (!mod) throw createError({ statusCode: 404, message: 'Module not found' })
  if (payload.role !== 'ADMIN' && mod.Course.instructorId !== payload.userId) {
    throw createError({ statusCode: 403, message: 'Not your course' })
  }

  const body = await readBody(event)
  const validated = schema.parse(body)

  const updated = await prisma.module.update({
    where: { id },
    data: validated,
    include: { Lesson: true }
  })

  return updated
})