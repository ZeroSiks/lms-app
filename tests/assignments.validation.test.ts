import { describe, it, expect } from 'vitest'

// Pure validation functions mirroring API route logic — no external deps needed

function validateCreateAssignment(data: Record<string, unknown>) {
    if (typeof data.moduleId !== 'number' || !Number.isInteger(data.moduleId) || data.moduleId < 1)
        return 'Invalid moduleId'
    if (typeof data.title !== 'string' || data.title.length < 3 || data.title.length > 200)
        return 'title must be 3–200 chars'
    if (typeof data.description !== 'string' || data.description.length < 1)
        return 'description required'
    if (typeof data.dueDate !== 'string' || isNaN(Date.parse(data.dueDate)))
        return 'dueDate must be a valid datetime'
    if (typeof data.maxPoints !== 'number' || !Number.isInteger(data.maxPoints) || data.maxPoints < 1 || data.maxPoints > 1000)
        return 'maxPoints must be an integer 1–1000'
    return null
}

function validateGradeSubmission(data: Record<string, unknown>) {
    if (typeof data.grade !== 'number' || !Number.isInteger(data.grade) || data.grade < 0)
        return 'grade must be a non-negative integer'
    if (data.feedback !== undefined && (typeof data.feedback !== 'string' || data.feedback.length > 2000))
        return 'feedback max 2000 chars'
    return null
}

function validateSubmission(data: Record<string, unknown>) {
    if (typeof data.assignmentId !== 'number' || data.assignmentId < 1)
        return 'invalid assignmentId'
    if (typeof data.content === 'string' && data.content.length > 10000)
        return 'content max 10,000 chars'
    if (data.fileUrl !== undefined) {
        try { new URL(data.fileUrl as string) } catch { return 'fileUrl must be a valid URL' }
    }
    const hasContent = typeof data.content === 'string' && data.content.trim().length > 0
    const hasFile = typeof data.fileUrl === 'string' && data.fileUrl.trim().length > 0
    if (!hasContent && !hasFile) return 'At least one of content or fileUrl must be provided'
    return null
}

const VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['PUBLISHED'],
    PUBLISHED: ['CLOSED'],
    CLOSED: [],
}

function isValidTransition(from: string, to: string): boolean {
    return (VALID_TRANSITIONS[from] ?? []).includes(to)
}

function isLateSubmission(dueDate: Date, submittedAt: Date): boolean {
    return submittedAt > dueDate
}

function capGrade(grade: number, maxPoints: number): boolean {
    return grade >= 0 && grade <= maxPoints
}

// ---- Tests ----

describe('Assignment creation validation', () => {
    const valid = {
        moduleId: 1,
        title: 'Final Project',
        description: 'Build a web application',
        dueDate: '2027-01-01T00:00:00.000Z',
        maxPoints: 100,
    }

    it('accepts valid input', () => expect(validateCreateAssignment(valid)).toBeNull())

    it('rejects title shorter than 3 chars', () => {
        expect(validateCreateAssignment({ ...valid, title: 'AB' })).not.toBeNull()
    })

    it('rejects title longer than 200 chars', () => {
        expect(validateCreateAssignment({ ...valid, title: 'x'.repeat(201) })).not.toBeNull()
    })

    it('rejects maxPoints of 0', () => {
        expect(validateCreateAssignment({ ...valid, maxPoints: 0 })).not.toBeNull()
    })

    it('rejects maxPoints above 1000', () => {
        expect(validateCreateAssignment({ ...valid, maxPoints: 1001 })).not.toBeNull()
    })

    it('rejects non-datetime dueDate', () => {
        expect(validateCreateAssignment({ ...valid, dueDate: 'not-a-date' })).not.toBeNull()
    })

    it('rejects missing moduleId', () => {
        const { moduleId: _, ...rest } = valid
        expect(validateCreateAssignment(rest as Record<string, unknown>)).not.toBeNull()
    })

    it('rejects fractional maxPoints', () => {
        expect(validateCreateAssignment({ ...valid, maxPoints: 50.5 })).not.toBeNull()
    })
})

describe('Assignment status transitions', () => {
    it('allows DRAFT → PUBLISHED', () => expect(isValidTransition('DRAFT', 'PUBLISHED')).toBe(true))
    it('allows PUBLISHED → CLOSED', () => expect(isValidTransition('PUBLISHED', 'CLOSED')).toBe(true))
    it('rejects CLOSED → DRAFT', () => expect(isValidTransition('CLOSED', 'DRAFT')).toBe(false))
    it('rejects CLOSED → PUBLISHED', () => expect(isValidTransition('CLOSED', 'PUBLISHED')).toBe(false))
    it('rejects PUBLISHED → DRAFT', () => expect(isValidTransition('PUBLISHED', 'DRAFT')).toBe(false))
    it('rejects DRAFT → CLOSED', () => expect(isValidTransition('DRAFT', 'CLOSED')).toBe(false))
})

describe('Late submission detection', () => {
    it('flags submission after due date as late', () => {
        const due = new Date('2026-05-01T00:00:00Z')
        const submitted = new Date('2026-05-02T10:00:00Z')
        expect(isLateSubmission(due, submitted)).toBe(true)
    })

    it('does not flag submission before due date', () => {
        const due = new Date('2026-06-01T00:00:00Z')
        const submitted = new Date('2026-05-30T10:00:00Z')
        expect(isLateSubmission(due, submitted)).toBe(false)
    })

    it('same-millisecond submission is not late', () => {
        const date = new Date('2026-06-01T23:59:00Z')
        expect(isLateSubmission(date, date)).toBe(false)
    })
})

describe('Submission validation', () => {
    it('accepts submission with content only', () => {
        expect(validateSubmission({ assignmentId: 1, content: 'My answer here' })).toBeNull()
    })

    it('accepts submission with fileUrl only', () => {
        expect(validateSubmission({ assignmentId: 1, fileUrl: 'https://example.com/file.pdf' })).toBeNull()
    })

    it('accepts submission with both content and fileUrl', () => {
        expect(validateSubmission({ assignmentId: 1, content: 'My answer', fileUrl: 'https://example.com/file.pdf' })).toBeNull()
    })

    it('rejects submission with neither content nor fileUrl', () => {
        expect(validateSubmission({ assignmentId: 1 })).not.toBeNull()
    })

    it('rejects content exceeding 10,000 chars', () => {
        expect(validateSubmission({ assignmentId: 1, content: 'x'.repeat(10001) })).not.toBeNull()
    })

    it('rejects invalid fileUrl', () => {
        expect(validateSubmission({ assignmentId: 1, fileUrl: 'not-a-url' })).not.toBeNull()
    })

    it('rejects whitespace-only content as empty', () => {
        expect(validateSubmission({ assignmentId: 1, content: '   ' })).not.toBeNull()
    })
})

describe('Grade validation', () => {
    it('accepts grade of 0', () => expect(validateGradeSubmission({ grade: 0 })).toBeNull())
    it('accepts grade with feedback', () => expect(validateGradeSubmission({ grade: 85, feedback: 'Well done' })).toBeNull())
    it('rejects negative grade', () => expect(validateGradeSubmission({ grade: -1 })).not.toBeNull())
    it('rejects feedback exceeding 2000 chars', () => {
        expect(validateGradeSubmission({ grade: 50, feedback: 'x'.repeat(2001) })).not.toBeNull()
    })
    it('capGrade: true when grade within range', () => {
        expect(capGrade(78, 100)).toBe(true)
        expect(capGrade(100, 100)).toBe(true)
        expect(capGrade(0, 100)).toBe(true)
    })
    it('capGrade: false when grade exceeds maxPoints', () => {
        expect(capGrade(101, 100)).toBe(false)
    })
})

// Route-level grade cap: mirrors the check in grade.put.ts
function routeGradeCheck(grade: number, maxPoints: number): { statusCode: number; message: string } | null {
    if (grade > maxPoints) return { statusCode: 400, message: 'Grade cannot exceed maxPoints' }
    return null
}

// Route-level already-graded guard: mirrors the 409 check added to grade.put.ts
function routeAlreadyGradedCheck(currentStatus: string): { statusCode: number; message: string } | null {
    if (currentStatus === 'GRADED') return { statusCode: 409, message: 'Submission is already graded' }
    return null
}

describe('Grade route-level checks', () => {
    it('returns 400 when grade exceeds maxPoints', () => {
        expect(routeGradeCheck(101, 100)).toMatchObject({ statusCode: 400, message: 'Grade cannot exceed maxPoints' })
    })

    it('returns null when grade equals maxPoints', () => {
        expect(routeGradeCheck(100, 100)).toBeNull()
    })

    it('returns null when grade is below maxPoints', () => {
        expect(routeGradeCheck(0, 100)).toBeNull()
    })

    it('returns 409 when submission is already GRADED', () => {
        expect(routeAlreadyGradedCheck('GRADED')).toMatchObject({ statusCode: 409 })
    })

    it('returns null when submission is SUBMITTED', () => {
        expect(routeAlreadyGradedCheck('SUBMITTED')).toBeNull()
    })

    it('returns null when submission is LATE', () => {
        expect(routeAlreadyGradedCheck('LATE')).toBeNull()
    })
})

describe('Submission validation — whitespace fileUrl edge cases', () => {
    it('rejects whitespace-only fileUrl (spaces only)', () => {
        expect(validateSubmission({ assignmentId: 1, fileUrl: '   ' })).not.toBeNull()
    })

    it('rejects tab-only fileUrl', () => {
        expect(validateSubmission({ assignmentId: 1, fileUrl: '\t' })).not.toBeNull()
    })

    it('accepts valid https fileUrl after trimming would still be valid', () => {
        expect(validateSubmission({ assignmentId: 1, fileUrl: 'https://example.com/file.pdf' })).toBeNull()
    })
})
