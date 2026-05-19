import { prisma } from '@@/lib/prisma'
import { requireAuth } from '@@/server/utils/auth'

export default defineEventHandler(async (event) => {
    const payload = await requireAuth(event)

    const body = await readBody(event)
    const { firstName, lastName, bio } = body ?? {}

    if (!firstName?.trim()) throw createError({ statusCode: 400, message: 'First name is required.' })
    if (!lastName?.trim()) throw createError({ statusCode: 400, message: 'Last name is required.' })

    const updated = await prisma.user.update({
        where: { id: payload.userId },
        data: {
            firstName: stripHtml(firstName.trim()).slice(0, 100),
            lastName: stripHtml(lastName.trim()).slice(0, 100),
            bio: bio?.trim() ? stripHtml(bio.trim()).slice(0, 1000) : null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, bio: true },
    })

    return updated
})
