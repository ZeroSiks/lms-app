import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'

// ====================
//   Streak Calculator
// ====================

function calcStreak(dates: string[]): number {
    if (!dates.length) return 0
    const set = new Set(dates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    const yesterday = new Date(today.getTime() - 86400000)
    if (!set.has(fmt(today)) && !set.has(fmt(yesterday))) return 0
    const start = set.has(fmt(today)) ? new Date(today) : new Date(yesterday)
    let streak = 0
    const cur = new Date(start)
    while (set.has(fmt(cur))) {
        streak++
        cur.setDate(cur.getDate() - 1)
    }
    return streak
}

export default defineEventHandler(async (event) => {

    // ====================
    //    Authentication
    // ====================

    const token = getCookie(event, 'lms_token')
    if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

    let payload
    try {
        payload = verifyAccessToken(token)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid or expired token' })
    }

    const userId = payload.userId

    // ====================
    //      Data Fetch
    // ====================

    const [enrollments, lessonProgressAll, upcomingAssignments] = await Promise.all([
        prisma.enrollment.findMany({
            where: { userId, status: 'ACTIVE' as any },
            include: {
                Course: {
                    include: {
                        Module: {
                            include: {
                                Lesson: {
                                    select: {
                                        id: true,
                                        LessonProgress: { where: { userId }, select: { completed: true } },
                                    },
                                },
                            },
                        },
                        User: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        }),
        prisma.lessonProgress.findMany({
            where: { userId, completed: true },
            select: { completedAt: true },
            orderBy: { completedAt: 'desc' },
        }),
        prisma.assignment.findMany({
            where: {
                status: 'PUBLISHED' as any,
                dueDate: { gte: new Date() },
                Module: {
                    Course: {
                        Enrollment: { some: { userId, status: 'ACTIVE' as any } },
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
            take: 5,
            select: {
                id: true,
                title: true,
                dueDate: true,
                maxPoints: true,
                Module: { select: { courseId: true, Course: { select: { title: true, code: true } } } },
                Submission: { where: { userId }, select: { status: true, grade: true } },
            },
        }),
    ])

    // ====================
    //   Build Response
    // ====================

    const completedDates = lessonProgressAll
        .filter(p => p.completedAt)
        .map(p => p.completedAt!.toISOString().split('T')[0])

    const streak = calcStreak(completedDates)
    const totalCompleted = lessonProgressAll.length

    const colors = ['#0000ff', '#0033CC', '#0A2472', '#7C3AED', '#059669']
    const courses = enrollments.map((e, i) => {
        const allLessons = e.Course.Module.flatMap(m => m.Lesson)
        const total = allLessons.length
        const completed = allLessons.filter(l => l.LessonProgress[0]?.completed).length
        return {
            id: e.Course.id,
            title: e.Course.title,
            code: e.Course.code,
            instructor: e.Course.User ? `${e.Course.User.firstName} ${e.Course.User.lastName}` : null,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            completedLessons: completed,
            totalLessons: total,
            color: colors[i % colors.length],
        }
    })

    return {
        streak,
        totalCompleted,
        enrolledCount: enrollments.length,
        courses,
        upcomingAssignments,
        recentActivity: lessonProgressAll.slice(0, 10).map(p => ({ time: p.completedAt })),
    }
})
