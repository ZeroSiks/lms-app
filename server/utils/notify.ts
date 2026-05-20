import { prisma } from '@@/lib/prisma'

export async function createNotification(params: {
    userId: number
    title: string
    message: string
    type: 'grade' | 'enrollment' | 'message' | 'assignment' | 'announcement' | 'SYSTEM'
    link?: string
}) {
    await prisma.notification.create({ data: params }).catch(() => {})
}
