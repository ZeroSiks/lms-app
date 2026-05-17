import { describe, it, expect } from 'vitest'

// Pure logic extracted from the dashboard stats computation

function computeStudyHours(completedLessons: { duration: number | null }[]): number {
    const minutes = completedLessons.reduce((sum, l) => sum + (l.duration ?? 0), 0)
    return Math.round(minutes / 60)
}

function isDeadlineUrgent(dueDate: Date, now: Date): boolean {
    return dueDate.getTime() - now.getTime() < 48 * 60 * 60 * 1000
}

function formatDueDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildActivityFeedItem(type: string, tag: string) {
    const validTags = ['Completed', 'Submitted', 'Late', 'Started', 'Feedback']
    return validTags.includes(tag) ? tag : 'Completed'
}

describe('Study hours calculation', () => {
    it('returns 0 for no lessons', () => {
        expect(computeStudyHours([])).toBe(0)
    })

    it('converts minutes to hours correctly', () => {
        const lessons = [{ duration: 60 }, { duration: 60 }, { duration: 60 }]
        expect(computeStudyHours(lessons)).toBe(3)
    })

    it('rounds partial hours', () => {
        const lessons = [{ duration: 45 }, { duration: 45 }]
        expect(computeStudyHours(lessons)).toBe(2) // 90 min = 1.5h → rounds to 2
    })

    it('handles null durations by treating them as 0', () => {
        const lessons = [{ duration: null }, { duration: 120 }]
        expect(computeStudyHours(lessons)).toBe(2)
    })

    it('handles 30 lessons of 60 min each = 30h', () => {
        const lessons = Array.from({ length: 30 }, () => ({ duration: 60 }))
        expect(computeStudyHours(lessons)).toBe(30)
    })
})

describe('Deadline urgency detection', () => {
    it('marks deadline within 48h as urgent', () => {
        const now = new Date('2026-05-17T10:00:00Z')
        const due = new Date('2026-05-18T09:00:00Z') // ~23h from now
        expect(isDeadlineUrgent(due, now)).toBe(true)
    })

    it('marks deadline exactly 48h away as not urgent', () => {
        const now = new Date('2026-05-17T10:00:00Z')
        const due = new Date('2026-05-19T10:00:00Z') // exactly 48h
        expect(isDeadlineUrgent(due, now)).toBe(false)
    })

    it('does not mark deadline 3+ days away as urgent', () => {
        const now = new Date('2026-05-17T10:00:00Z')
        const due = new Date('2026-05-21T10:00:00Z')
        expect(isDeadlineUrgent(due, now)).toBe(false)
    })

    it('marks past deadline as urgent (already overdue)', () => {
        const now = new Date('2026-05-17T10:00:00Z')
        const due = new Date('2026-05-15T10:00:00Z') // 2 days ago
        expect(isDeadlineUrgent(due, now)).toBe(true)
    })
})

describe('Activity feed tag normalisation', () => {
    it('passes through known tags unchanged', () => {
        expect(buildActivityFeedItem('lesson_complete', 'Completed')).toBe('Completed')
        expect(buildActivityFeedItem('submission', 'Submitted')).toBe('Submitted')
        expect(buildActivityFeedItem('submission', 'Late')).toBe('Late')
    })

    it('defaults unknown tags to Completed', () => {
        expect(buildActivityFeedItem('unknown', 'SomethingElse')).toBe('Completed')
    })
})
