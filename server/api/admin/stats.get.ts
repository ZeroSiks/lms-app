import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    // ====================
    //   Aggregate Stats
    // ====================

    const [totalStudents, totalInstructors, activeCourses, pendingUsers, pendingEnrollments, latestUser] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' as any } }),
        prisma.user.count({ where: { role: 'INSTRUCTOR', status: 'ACTIVE' as any } }),
        prisma.course.count({ where: { isPublished: true } }),
        prisma.user.count({ where: { status: 'PENDING' as any, role: { in: ['STUDENT', 'INSTRUCTOR'] as any[] } } }),
        prisma.enrollment.count({ where: { status: 'PENDING' as any } }),
        prisma.user.findFirst({
            where: { role: { in: ['STUDENT', 'INSTRUCTOR'] as any[] } },
            select: { firstName: true, lastName: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        }),
    ])

    return {
        totalStudents,
        totalInstructors,
        activeCourses,
        pendingUsers,
        pendingEnrollments,
        totalPending: pendingUsers + pendingEnrollments,
        latestUser,
    }
})
