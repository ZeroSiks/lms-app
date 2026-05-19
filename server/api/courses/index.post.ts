import { prisma } from '@@/lib/prisma'
import { z } from 'zod'

const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  code: z.string().min(1),
  instructorId: z.number(),
  color: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const validated = createCourseSchema.parse(body)

  const course = await prisma.course.create({
    data: validated,
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })

  return course
})
