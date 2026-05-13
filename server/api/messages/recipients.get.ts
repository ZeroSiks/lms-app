import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'lms_token')
    if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

    let payload
    try {
        payload = verifyAccessToken(token)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid or expired token' })
    }

    const role = payload.role as string
    const userId = payload.userId

    if (role === 'STUDENT') {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId, status: 'ACTIVE' as any },
            include: {
                Course: {
                    include: {
                        User: { select: { id: true, firstName: true, lastName: true, role: true } },
                    },
                },
            },
        })
        const seen = new Map<number, { id: number; firstName: string; lastName: string; role: string }>()
        for (const e of enrollments) {
            if (e.Course.User && e.Course.User.id !== userId) {
                seen.set(e.Course.User.id, { ...e.Course.User, role: e.Course.User.role as string })
            }
        }
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' as any, status: 'ACTIVE' as any },
            select: { id: true, firstName: true, lastName: true, role: true },
        })
        for (const a of admins) {
            if (a.id !== userId) seen.set(a.id, { ...a, role: a.role as string })
        }
        return Array.from(seen.values())
    }

    if (role === 'INSTRUCTOR') {
        const courses = await prisma.course.findMany({
            where: { instructorId: userId },
            include: {
                Enrollment: {
                    where: { status: 'ACTIVE' as any },
                    include: {
                        User: { select: { id: true, firstName: true, lastName: true, role: true } },
                    },
                },
            },
        })
        const seen = new Map<number, { id: number; firstName: string; lastName: string; role: string }>()
        for (const c of courses) {
            for (const e of c.Enrollment) {
                if (e.User.id !== userId) seen.set(e.User.id, { ...e.User, role: e.User.role as string })
            }
        }
        return Array.from(seen.values())
    }

    // Admin: return all active users except self
    const users = await prisma.user.findMany({
        where: { id: { not: userId }, status: 'ACTIVE' as any },
        select: { id: true, firstName: true, lastName: true, role: true },
        orderBy: { firstName: 'asc' },
    })
    return users.map(u => ({ ...u, role: u.role as string }))
})
