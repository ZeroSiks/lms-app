import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
    const email = 'admin@lms.com'
    const password = 'Admin@12345'

    const passwordHash = await bcrypt.hash(password, 12)

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'ADMIN',
        },
    })

    console.log(`Superadmin ready → ${admin.email}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
