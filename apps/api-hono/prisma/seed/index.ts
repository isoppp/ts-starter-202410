import { prisma } from '@/lib/prisma'

async function seed() {
  await prisma.example.create({
    data: {
      name: '1',
    },
  })
}

seed()
