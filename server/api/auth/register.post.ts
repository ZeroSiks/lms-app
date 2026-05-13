import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

// ====================
//   Validation Schema
// ====================

const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['STUDENT', 'INSTRUCTOR']),
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const result = schema.safeParse(body)
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.issues[0]?.message ?? 'Invalid input',
        })
    }

    const { firstName, lastName, email, password, role } = result.data

    // ====================
    //   Duplicate Check
    // ====================

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
        if (existing.status === 'PENDING') {
            throw createError({
                statusCode: 409,
                message: 'A registration request for this email is already pending admin approval.',
            })
        }
        if (existing.status === 'ACTIVE') {
            throw createError({
                statusCode: 409,
                message: 'An account with this email already exists.',
            })
        }
        // REJECTED — allow re-application by updating the existing record
        const passwordHash = await hashPassword(password)
        await prisma.user.update({
            where: { email },
            data: { firstName, lastName, passwordHash, role, status: 'PENDING' },
        })
        return { pending: true }
    }

    // ====================
    //    Create Account
    // ====================

    const passwordHash = await hashPassword(password)
    await prisma.user.create({
        data: { firstName, lastName, email, passwordHash, role, status: 'PENDING' },
    })

    return { pending: true }
})
