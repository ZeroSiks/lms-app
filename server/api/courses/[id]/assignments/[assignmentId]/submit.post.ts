import { prisma } from '@@/lib/prisma'
import { verifyAccessToken } from '@@/server/utils/jwt'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
]

const MAGIC_BYTES: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
}

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png']

const MAX_SIZE = 10 * 1024 * 1024

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function validateMagicBytes(data: Buffer, mimeType: string): boolean {
    const expected = MAGIC_BYTES[mimeType]
    if (!expected) return true
    for (let i = 0; i < expected.length; i++) {
        if (data[i] !== expected[i]) return false
    }
    return true
}

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'lms_token')
    if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })

    let payload
    try {
        payload = verifyAccessToken(token)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid or expired token' })
    }

    if ((payload.role as string) !== 'STUDENT') {
        throw createError({ statusCode: 403, message: 'Only students can submit assignments.' })
    }

    const courseId = Number(getRouterParam(event, 'id'))
    const assignmentId = Number(getRouterParam(event, 'assignmentId'))
    if (isNaN(courseId) || isNaN(assignmentId)) throw createError({ statusCode: 400, message: 'Invalid ID' })

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payload.userId, courseId } },
    })
    if (!enrollment || (enrollment.status as string) !== 'ACTIVE') {
        throw createError({ statusCode: 403, message: 'Not enrolled in this course.' })
    }

    const assignment = await prisma.assignment.findFirst({
        where: { id: assignmentId, status: 'PUBLISHED' as any, Module: { courseId } },
    })
    if (!assignment) throw createError({ statusCode: 404, message: 'Assignment not found.' })

    const existing = await prisma.submission.findUnique({
        where: { userId_assignmentId: { userId: payload.userId, assignmentId } },
    })
    if (existing && (existing.status as string) === 'GRADED') {
        throw createError({ statusCode: 409, message: 'This assignment has already been graded and cannot be resubmitted.' })
    }

    let content = ''
    let fileUrl: string | null = null

    const contentType = getHeader(event, 'content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
        const parts = await readMultipartFormData(event)
        const contentPart = parts?.find(p => p.name === 'content')
        const filePart = parts?.find(p => p.name === 'file' && p.filename)

        content = contentPart?.data.toString('utf-8').trim() ?? ''

        if (filePart && filePart.data.length > 0) {
            const mimeType = filePart.type ?? 'application/octet-stream'
            if (!ALLOWED_TYPES.includes(mimeType)) {
                throw createError({ statusCode: 400, message: 'File type not allowed. Use PDF, Word, PowerPoint, plain text, or image files.' })
            }
            if (filePart.data.length > MAX_SIZE) {
                throw createError({ statusCode: 400, message: 'File too large. Maximum size is 10MB.' })
            }
            if (!validateMagicBytes(filePart.data, mimeType)) {
                throw createError({ statusCode: 400, message: 'File content does not match its claimed type.' })
            }
            const rawName = sanitizeFilename(filePart.filename ?? 'file')
            let ext = rawName.split('.').pop()?.toLowerCase() ?? 'bin'
            if (!ALLOWED_EXTENSIONS.includes(ext)) ext = 'bin'
            const uploadsDir = join(process.cwd(), 'public', 'uploads')
            mkdirSync(uploadsDir, { recursive: true })
            const filename = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            writeFileSync(join(uploadsDir, filename), filePart.data)
            fileUrl = `/uploads/${filename}`
        }
    } else {
        const body = await readBody(event)
        content = (body?.content ?? '').trim()
    }

    if (!content && !fileUrl) {
        throw createError({ statusCode: 400, message: 'Please provide text content or upload a file.' })
    }

    const submission = await prisma.submission.upsert({
        where: { userId_assignmentId: { userId: payload.userId, assignmentId } },
        create: { userId: payload.userId, assignmentId, content: content || null, fileUrl, status: 'SUBMITTED' as any },
        update: { content: content || null, fileUrl, status: 'SUBMITTED' as any, submittedAt: new Date() },
    })

    return submission
})
