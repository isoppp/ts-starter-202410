import { env } from '@/lib/env'
import { PrismaClient } from '@prisma/client'

const getPrismaClient = () => {
  const prisma = new PrismaClient({
    log: env.APP_ENV !== 'production' ? ['warn', 'error'] : ['error', 'warn'],
  })

  // @ts-ignore
  prisma.$on('query', (e: { duration: string }) => {
    console.log(`Query took: ${e.duration}ms`)
  })

  return prisma
}

export const prisma = getPrismaClient()
