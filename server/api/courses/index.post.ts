import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'
import { z } from 'zod'

const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  code: z.string().min(1),
  instructorId: z.number().optional(),
  color: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const validated = createCourseSchema.parse(body)

  const course = await prisma.course.create({
    data: validated,
    include: {
      User: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })

  return course
})
