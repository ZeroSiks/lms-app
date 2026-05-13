import { prisma } from '@@/lib/prisma'
import { createNotification } from '@@/server/utils/notify'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    if (isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid enrollment ID.' })

    const enrollment = await prisma.enrollment.findUnique({
        where: { id },
        include: { Course: { select: { id: true, title: true, code: true } } },
    })
    if (!enrollment) throw createError({ statusCode: 404, message: 'Enrollment not found.' })

    if ((enrollment.status as string) !== 'PENDING') {
        throw createError({ statusCode: 400, message: 'Enrollment is not in a pending state.' })
    }

    await prisma.enrollment.update({
        where: { id },
        data: { status: 'REJECTED' as any },
    })

    await createNotification({
        userId: enrollment.userId,
        title: 'Enrollment not approved',
        message: `Your enrollment request for "${enrollment.Course.title}" was not approved. Contact an administrator for more information.`,
        type: 'enrollment',
        link: `/courses`,
    })

    return { ok: true }
})
