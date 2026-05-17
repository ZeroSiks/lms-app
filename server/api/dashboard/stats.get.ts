import { prisma } from '@@/lib/prisma'

function computeStreak(completedDates: Date[], now: Date): number {
    if (!completedDates.length) return 0
    const dayKey = (d: Date) => d.toISOString().slice(0, 10)
    const uniqueDays = new Set(completedDates.map(dayKey))
    let streak = 0
    const cursor = new Date(now)
    // Allow today to count even if not yet completed today
    while (true) {
        if (uniqueDays.has(dayKey(cursor))) {
            streak++
            cursor.setDate(cursor.getDate() - 1)
        } else {
            break
        }
    }
    return streak
}

export default defineEventHandler(async (event) => {
    const user = requireAuth(event)
    const now = new Date()

    if (user.role === 'STUDENT') {
        // Step 1: get enrollments (needed to scope all other queries)
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.userId, status: 'ACTIVE' },
            include: { Course: { select: { id: true, title: true, code: true } } },
        })
        const courseIds = enrollments.map((e) => e.courseId)

        // Step 2: run all dependent queries in parallel
        const [completedLessons, upcomingAssignments, recentSubmissions] = await Promise.all([
            prisma.lessonProgress.findMany({
                where: { userId: user.userId, completed: true },
                include: {
                    Lesson: {
                        select: {
                            duration: true,
                            title: true,
                            Module: { select: { Course: { select: { title: true } } } },
                        },
                    },
                },
                orderBy: { completedAt: 'desc' },
                take: 50,
            }),
            prisma.assignment.findMany({
                where: {
                    status: 'PUBLISHED',
                    dueDate: { gte: now },
                    Module: { courseId: { in: courseIds } },
                    Submission: { none: { userId: user.userId } },
                },
                include: { Module: { include: { Course: { select: { id: true, title: true, code: true } } } } },
                orderBy: { dueDate: 'asc' },
                take: 5,
            }),
            prisma.submission.findMany({
                where: { userId: user.userId },
                include: {
                    Assignment: {
                        select: { title: true, Module: { select: { Course: { select: { code: true } } } } },
                    },
                },
                orderBy: { submittedAt: 'desc' },
                take: 5,
            }),
        ])

        const studyMinutes = completedLessons.reduce((sum, lp) => sum + (lp.Lesson.duration ?? 0), 0)
        const completionDates = completedLessons.filter((lp) => lp.completedAt).map((lp) => lp.completedAt!)
        const streak = computeStreak(completionDates, now)

        const activityFeed = [
            ...completedLessons
                .filter((lp) => lp.completedAt)
                .slice(0, 5)
                .map((lp) => ({
                    type: 'lesson_complete' as const,
                    text: `Completed "${lp.Lesson.title}" in ${lp.Lesson.Module.Course.title}`,
                    time: lp.completedAt!.toISOString(),
                    tag: 'Completed',
                })),
            ...recentSubmissions.map((s) => ({
                type: 'submission' as const,
                text: `Submitted "${s.Assignment.title}" in ${s.Assignment.Module.Course.code}`,
                time: s.submittedAt.toISOString(),
                tag: 'Submitted',
            })),
        ]
            .sort((a, b) => b.time.localeCompare(a.time))
            .slice(0, 6)

        return {
            role: 'STUDENT',
            streak,
            stats: {
                enrolledCourses: enrollments.length,
                lessonsCompleted: completedLessons.length,
                studyHours: Math.round(studyMinutes / 60),
                assignmentsDue: upcomingAssignments.length,
            },
            upcomingDeadlines: upcomingAssignments.map((a) => ({
                id: a.id,
                task: a.title,
                course: a.Module.Course.code,
                due: a.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                dueDate: a.dueDate.toISOString(),
                urgent: a.dueDate.getTime() - now.getTime() < 48 * 60 * 60 * 1000,
            })),
            activityFeed,
            enrolledCourses: enrollments.map((e) => e.Course),
        }
    }

    if (user.role === 'INSTRUCTOR') {
        const myCourses = await prisma.course.findMany({
            where: { instructorId: user.userId },
            include: { _count: { select: { Enrollment: true } } },
        })
        const courseIds = myCourses.map((c) => c.id)

        const [totalStudents, pendingReviews, recentSubmissions] = await Promise.all([
            prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: 'ACTIVE' } }),
            prisma.submission.count({
                where: {
                    status: { in: ['SUBMITTED', 'LATE'] },
                    Assignment: { Module: { courseId: { in: courseIds } } },
                },
            }),
            prisma.submission.findMany({
                where: {
                    status: { in: ['SUBMITTED', 'LATE'] },
                    Assignment: { Module: { courseId: { in: courseIds } } },
                },
                include: {
                    User: { select: { firstName: true, lastName: true } },
                    Assignment: {
                        select: { title: true, Module: { select: { Course: { select: { code: true } } } } },
                    },
                },
                orderBy: { submittedAt: 'desc' },
                take: 5,
            }),
        ])

        const activityFeed = recentSubmissions.map((s) => ({
            type: 'submission' as const,
            text: `${s.User.firstName} ${s.User.lastName} submitted "${s.Assignment.title}"`,
            time: s.submittedAt.toISOString(),
            tag: s.status === 'LATE' ? 'Late' : 'Submitted',
        }))

        return {
            role: 'INSTRUCTOR',
            streak: 0,
            stats: {
                coursesTeaching: myCourses.length,
                totalStudents,
                pendingReviews,
                avgCompletion: 0,
            },
            activityFeed,
            myCourses: myCourses.map((c) => ({ ...c, studentCount: c._count.Enrollment })),
        }
    }

    // ADMIN
    const [userCount, courseCount, enrollmentCount, submissionCount] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
        prisma.submission.count({ where: { status: { in: ['SUBMITTED', 'LATE'] } } }),
    ])

    return {
        role: 'ADMIN',
        streak: 0,
        stats: { userCount, courseCount, enrollmentCount, pendingSubmissions: submissionCount },
    }
})
