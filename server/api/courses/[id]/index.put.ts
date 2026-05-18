import { prisma } from '@@/lib/prisma'
import { z } from 'zod'

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  code: z.string().min(1).optional(),
  color: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') as string)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid course ID' })
  }

  const body = await readBody(event)
  const validated = updateCourseSchema.parse(body)

  const course = await prisma.course.update({
    where: { id },
    data: validated,
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })

  return course
})