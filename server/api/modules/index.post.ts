import { prisma } from '@@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number(),
  courseId: z.number(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const module = await prisma.module.create({
    data: validated,
    include: { Lesson: true }
  })

  return module
})