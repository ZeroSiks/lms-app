import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid user ID' })

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw createError({ statusCode: 404, message: 'User not found' })
    if ((user.role as string) === 'ADMIN') throw createError({ statusCode: 403, message: 'Cannot deactivate an admin account' })

    return prisma.user.update({
        where: { id },
        data: { status: 'REJECTED' as any },
        select: { id: true, status: true },
    })
})
