import { prisma } from '@@/lib/prisma'

export default defineEventHandler(async () => {

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
