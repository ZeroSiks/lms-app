import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
  const password = 'Admin@12345'
  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: { status: 'ACTIVE' },
    create: {
      email: 'admin@lms.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log(`Superadmin ready → ${admin.email}`)

  const instructorPw = await bcrypt.hash('Instructor@123', 12)
  const instructor = await prisma.user.upsert({
    where: { email: 'dr.smith@lms.com' },
    update: { status: 'ACTIVE' },
    create: {
      email: 'dr.smith@lms.com',
      passwordHash: instructorPw,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      bio: 'Senior lecturer in Computer Science with 10 years of teaching experience.',
    },
  })
  console.log(`Instructor ready → ${instructor.email}`)

  const studentPw = await bcrypt.hash('Student@123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'alice@lms.com' },
    update: { status: 'ACTIVE' },
    create: {
      email: 'alice@lms.com',
      passwordHash: studentPw,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  })
  console.log(`Student ready → ${student.email}`)

  const student2 = await prisma.user.upsert({
    where: { email: 'bob@lms.com' },
    update: { status: 'ACTIVE' },
    create: {
      email: 'bob@lms.com',
      passwordHash: studentPw,
      firstName: 'Bob',
      lastName: 'Williams',
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  })
  console.log(`Student ready → ${student2.email}`)

  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      title: 'Introduction to Computer Science',
      description: 'Foundations of computing including algorithms, data structures, and programming basics. Suitable for beginners with no prior coding experience.',
      code: 'CS101',
      duration: '12 weeks',
      isPublished: true,
      color: '#0000ff',
      instructorId: instructor.id,
    },
  })
  console.log(`Course ready → ${course1.title}`)

  const course2 = await prisma.course.upsert({
    where: { code: 'WD202' },
    update: {},
    create: {
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS, JavaScript, and modern frontend frameworks. Build responsive websites from scratch.',
      code: 'WD202',
      duration: '8 weeks',
      isPublished: true,
      color: '#7c3aed',
      instructorId: instructor.id,
    },
  })
  console.log(`Course ready → ${course2.title}`)

  const course3 = await prisma.course.upsert({
    where: { code: 'DB301' },
    update: {},
    create: {
      title: 'Database Systems',
      description: 'Relational database design, SQL, normalization, transactions, and an introduction to NoSQL databases.',
      code: 'DB301',
      duration: '10 weeks',
      isPublished: true,
      color: '#059669',
      instructorId: instructor.id,
    },
  })
  console.log(`Course ready → ${course3.title}`)

  for (const courseId of [course1.id, course2.id]) {
    const existing = await prisma.enrollment.findFirst({
      where: { userId: student.id, courseId },
    })
    if (!existing) {
      await prisma.enrollment.create({
        data: { userId: student.id, courseId, status: 'ACTIVE' },
      })
    }
  }
  console.log('Enrollments ready')

  const modulesData: Array<{ courseId: number; title: string; description: string }> = [
    { courseId: course1.id, title: 'Module 1: Programming Basics', description: 'Variables, data types, and control flow.' },
    { courseId: course1.id, title: 'Module 2: Data Structures', description: 'Arrays, linked lists, stacks, and queues.' },
    { courseId: course1.id, title: 'Module 3: Algorithms', description: 'Sorting, searching, and algorithmic complexity.' },
    { courseId: course2.id, title: 'Module 1: HTML & CSS', description: 'Building the structure and style of web pages.' },
    { courseId: course2.id, title: 'Module 2: JavaScript Essentials', description: 'DOM manipulation, events, and async programming.' },
  ]

  for (let i = 0; i < modulesData.length; i++) {
    const m = modulesData[i]
    const existing = await prisma.module.findFirst({
      where: { courseId: m.courseId, title: m.title },
    })
    if (existing) continue
    const mod = await prisma.module.create({
      data: { courseId: m.courseId, title: m.title, description: m.description, order: i % 3 },
    })

    const lessons = [
      { title: `${m.title.split(':')[0]}: Lesson 1`, content: `Welcome to ${m.title}. This lesson introduces the core concepts you'll need to master. Study the fundamentals and complete the exercise at the end.`, duration: 45, order: 0 },
      { title: `${m.title.split(':')[0]}: Lesson 2`, content: `Building on Lesson 1, this lesson dives deeper into practical applications. You'll work through hands-on examples and reinforce your understanding.`, duration: 60, order: 1 },
    ]
    for (const l of lessons) {
      await prisma.lesson.upsert({
        where: { id: (await prisma.lesson.findFirst({ where: { moduleId: mod.id, title: l.title } }))?.id ?? -1 },
        update: {},
        create: { moduleId: mod.id, title: l.title, content: l.content, duration: l.duration, order: l.order },
      })
    }

    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const existingAssign = await prisma.assignment.findFirst({
      where: { moduleId: mod.id, title: `${m.title.split(':')[0]} Assignment` },
    })
    if (!existingAssign) {
      await prisma.assignment.create({
        data: {
          moduleId: mod.id,
          title: `${m.title.split(':')[0]} Assignment`,
          description: `Complete the following tasks to demonstrate your understanding of ${m.title.toLowerCase()}. Submit your solutions as a text response or upload a file.`,
          dueDate: futureDate,
          maxPoints: 100,
          status: 'PUBLISHED',
        },
      })
    }
  }

  console.log('Seed complete — 3 courses, 5 modules, 10 lessons, 5 assignments')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
