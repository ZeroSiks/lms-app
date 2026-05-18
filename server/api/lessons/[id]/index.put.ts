import { prisma } from '@@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  order: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') as string)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid lesson ID' })
  }

  const body = await readBody(event)
  const validated = schema.parse(body)

  const lesson = await prisma.lesson.update({
    where: { id },
    data: validated,
  })

  return lesson
})