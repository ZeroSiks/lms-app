import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

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
            message: result.error.errors[0]?.message ?? 'Invalid input',
        })
    }

    const { firstName, lastName, email, password, role } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        throw createError({
            statusCode: 409,
            message: 'An account with this email already exists.',
        })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
        data: { firstName, lastName, email, passwordHash, role },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    const payload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await hashPassword(refreshToken) },
    })

    setCookie(event, 'refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    return { accessToken, user }
})
