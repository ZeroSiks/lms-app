import { z } from 'zod'
import { prisma } from '@@/lib/prisma'

// ====================
//   Validation Schema
// ====================

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
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

    const { email, password } = result.data

    // ====================
    //     User Lookup
    // ====================

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        throw createError({ statusCode: 401, message: 'Invalid email or password.' })
    }

    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
        throw createError({ statusCode: 401, message: 'Invalid email or password.' })
    }

    // ====================
    //  Account Status Check
    // ====================

    if ((user.status as string) === 'PENDING') {
        throw createError({
            statusCode: 403,
            message: 'Your account is pending admin approval. You will be able to log in once approved.',
        })
    }

    if ((user.status as string) === 'REJECTED') {
        throw createError({
            statusCode: 403,
            message: 'Your registration request was not approved. Please contact the administrator.',
        })
    }

    // ====================
    //   Token Generation
    // ====================

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

    return {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
    }
})
