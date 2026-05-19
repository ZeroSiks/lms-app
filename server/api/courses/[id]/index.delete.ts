import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') as string)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid course ID' })
  }

  await prisma.course.delete({
    where: { id }
  })

  return { success: true, message: 'Course deleted' }
})