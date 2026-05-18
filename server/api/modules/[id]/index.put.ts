import { prisma } from '@@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') as string)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid module ID' })
  }

  const body = await readBody(event)
  const validated = schema.parse(body)

  const module = await prisma.module.update({
    where: { id },
    data: validated,
    include: { Lesson: true }
  })

  return module
})