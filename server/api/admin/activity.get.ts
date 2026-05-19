import { prisma } from '@@/lib/prisma'
import { requireAdmin } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const [recentUsers, recentEnrollments, recentCourses] = await Promise.all([
        prisma.user.findMany({
            where: { role: { in: ['STUDENT', 'INSTRUCTOR'] as any[] } },
            select: { id: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 15,
        }),
        prisma.enrollment.findMany({
            include: {
                User: { select: { firstName: true, lastName: true } },
                Course: { select: { title: true, code: true } },
            },
            orderBy: { enrolledAt: 'desc' },
            take: 15,
        }),
        prisma.course.findMany({
            select: { id: true, title: true, code: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
    ])

    const events: Array<{
        id: string
        type: string
        event: string
        user: string
        detail: string
        status: string
        statusType: string
        time: string
    }> = []

    for (const u of recentUsers) {
        const s = u.status as string
        events.push({
            id: `user-${u.id}`,
            type: 'registration',
            event: u.role === 'INSTRUCTOR' ? 'Instructor Registered' : 'Student Registered',
            user: `${u.firstName} ${u.lastName}`,
            detail: u.role === 'INSTRUCTOR' ? 'Instructor account' : 'Student account',
            status: s === 'ACTIVE' ? 'Approved' : s === 'REJECTED' ? 'Rejected' : 'Pending',
            statusType: s === 'ACTIVE' ? 'success' : s === 'REJECTED' ? 'error' : 'warning',
            time: u.createdAt.toISOString(),
        })
    }

    for (const e of recentEnrollments) {
        const s = e.status as string
        events.push({
            id: `enrollment-${e.id}`,
            type: 'enrollment',
            event: 'Course Enrollment',
            user: `${e.User.firstName} ${e.User.lastName}`,
            detail: `${e.Course.title} (${e.Course.code})`,
            status: s === 'ACTIVE' ? 'Approved' : s === 'REJECTED' ? 'Rejected' : 'Pending',
            statusType: s === 'ACTIVE' ? 'success' : s === 'REJECTED' ? 'error' : 'warning',
            time: e.enrolledAt.toISOString(),
        })
    }

    for (const c of recentCourses) {
        events.push({
            id: `course-${c.id}`,
            type: 'course',
            event: 'Course Created',
            user: c.title,
            detail: `Code: ${c.code}`,
            status: 'Published',
            statusType: 'info',
            time: c.createdAt.toISOString(),
        })
    }

    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return events.slice(0, 25)
})
