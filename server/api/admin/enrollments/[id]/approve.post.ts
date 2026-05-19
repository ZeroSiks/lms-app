import { prisma } from '@@/lib/prisma'
import { createNotification } from '@@/server/utils/notify'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
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
        data: { status: 'ACTIVE' as any },
    })

    await createNotification({
        userId: enrollment.userId,
        title: 'Enrollment approved',
        message: `You have been enrolled in "${enrollment.Course.title}" (${enrollment.Course.code}). Start learning now!`,
        type: 'enrollment',
        link: `/courses/${enrollment.Course.id}`,
    })

    return { ok: true }
})
