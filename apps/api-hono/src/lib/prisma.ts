import { AsyncLocalStorage } from 'node:async_hooks'
import { env } from '@/lib/env'
import { PrismaClient } from '@prisma/client'

const getPrismaClient = () => {
  const prisma = new PrismaClient({
    log: env.APP_ENV !== 'production' ? ['warn', 'error', 'info', 'query'] : ['error', 'warn'],
  })

  // @ts-ignore
  prisma.$on('query', (e: { duration: string }) => {
    console.log(`Query took: ${e.duration}ms`)
  })

  return prisma
}

export const prisma = getPrismaClient()

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
export const txContext = new AsyncLocalStorage<TxClient>()

export async function withTransaction<T>(handler: () => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return txContext.run(tx, handler)
  })
}

export function getPrisma(): TxClient | PrismaClient {
  const tx = txContext.getStore()
  return tx ?? prisma
}
