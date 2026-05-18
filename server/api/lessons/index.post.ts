import { prisma } from '@@/lib/prisma'
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
  const body = await readBody(event)
  const validated = schema.parse(body)

  const lesson = await prisma.lesson.create({
    data: validated,
  })

  return lesson
})