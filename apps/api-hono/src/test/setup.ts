import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: vPrisma.client,
  getPrisma: () => vPrisma.client,
  withTransaction: async function withTransaction<T>(handler: () => Promise<T>): Promise<T> {
    return handler()
  },
}))
